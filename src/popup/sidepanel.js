const statusEl = document.getElementById('status');
const resultEl = document.getElementById('summary-result');
const clientButton = document.getElementById('run-client-analysis');
const serverButton = document.getElementById('run-full-analysis');
const serverStatusEl = document.getElementById('server-status');
const apiKeySection = document.getElementById('api-key-section');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key');

let textToAnalyze = null;
let currentVideoId = null;
let lastAnalyzedVideoId = null;
let lastAnalysisStartTime = null;

function extractVideoId(metadata) {
	const match = metadata.match(/Video ID: ([a-zA-Z0-9_-]{11})/);
	return match ? match[1] : null;
}

async function getCachedAnalysis(videoId, type) {
	if (type === 'full') {
		const result = await chrome.storage.local.get(videoId);
		return result[videoId] || null;
	}
	return null;
}

function simpleMarkdownToHTML(markdown) {
	let html = markdown;
	
	html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
	html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
	html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
	
	html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
	
	html = html.replace(/^\d+\.\s+(.*)$/gim, '<li>$1</li>');
	html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
	
	html = html.replace(/^[-*]\s+(.*)$/gim, '<li>$1</li>');
	
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
	
	html = html.split('\n\n').map(para => {
		if (para.startsWith('<h') || para.startsWith('<ol') || para.startsWith('<ul') || para.startsWith('<li')) {
			return para;
		}
		return para ? `<p>${para}</p>` : '';
	}).join('');
	
	return html;
}

async function checkAndPrepare() {
	try {
		if (!self.LanguageModel) {
			statusEl.textContent = 'Error: Prompt API is not supported by this browser. Requires Chrome 138+.';
			console.error('LanguageModel API not found');
			return;
		}

		const data = await chrome.storage.session.get(['lastTextToSummarize', 'analysisStartTime']);
		if (!data.lastTextToSummarize) {
			statusEl.textContent = 'Error: No text found. Click the button on the YouTube page first.';
			return;
		}

		textToAnalyze = data.lastTextToSummarize;
		currentVideoId = extractVideoId(textToAnalyze);
		
		const videoChanged = lastAnalyzedVideoId && currentVideoId && lastAnalyzedVideoId !== currentVideoId;
		const newAnalysisStarted = data.analysisStartTime && data.analysisStartTime !== lastAnalysisStartTime;
		
		if (videoChanged || newAnalysisStarted || !lastAnalyzedVideoId) {
			resultEl.innerHTML = '';
			serverStatusEl.innerHTML = '';
			serverStatusEl.style.color = '';
			console.log('[Sidepanel] Clearing results - New analysis started');
		}
		
		if (data.analysisStartTime) {
			lastAnalysisStartTime = data.analysisStartTime;
		}
		
		statusEl.textContent = 'Checking AI model availability...';
		
		if (currentVideoId) {
			const cachedFull = await getCachedAnalysis(currentVideoId, 'full');
			
			if (cachedFull) {
				const analysisDate = cachedFull.creationDate ? new Date(cachedFull.creationDate) : new Date();
				const cacheAge = Math.floor((Date.now() - analysisDate.getTime()) / 1000 / 60);
				const ageText = cacheAge < 60 ? `${cacheAge}m ago` : `${Math.floor(cacheAge / 60)}h ago`;
				const dLevel = cachedFull.dLevel || 'N/A';
				serverStatusEl.innerHTML = `✓ Full Analysis cached <span style="color: #FF7043; font-weight: bold;">(D-Level: ${dLevel}, ${ageText})</span> - Check popup for details`;
				serverStatusEl.style.color = '#4caf50';
			}
		}

		console.log('[Sidepanel] Checking LanguageModel availability...');
		const availability = await Promise.race([
			self.LanguageModel.availability({
				expectedOutputs: [{ type: 'text', languages: ['en'] }]
			}),
			new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Availability check timeout')), 5000)
			)
		]);

		console.log('[Sidepanel] Availability status:', availability);

		if (availability === 'no' || availability === 'unavailable') {
			statusEl.textContent = 'Error: AI Model is not available on this device. Requires Chrome 138+ with at least 22 GB free storage.';
			return;
		}

		if (availability === 'downloading') {
			statusEl.textContent = 'AI Model is currently downloading... Please wait and the analysis will start automatically.';
			setTimeout(checkAndPrepare, 2000);
			return;
		}

		if (availability === 'after-download' || availability === 'downloadable') {
			statusEl.textContent = 'Ready for Promise Analysis! Click below.';
			clientButton.style.display = 'block';
			clientButton.disabled = false;
			clientButton.textContent = 'Download AI Model & Start';
		} else if (availability === 'readily' || availability === 'available') {
			statusEl.textContent = 'Ready for Promise Analysis! Click below.';
			clientButton.style.display = 'block';
			clientButton.disabled = false;
			clientButton.textContent = 'Start Promise Analysis';
		} else {
			statusEl.textContent = `Unexpected availability status: ${availability}. Check console.`;
			console.warn('[Sidepanel] Unexpected availability:', availability);
		}
	} catch (e) {
		console.error('[Sidepanel] Availability check error:', e);
		statusEl.textContent = `Error: ${e.message || 'Failed to check AI model availability'}. Try reloading the page.`;
	}
}

async function runAnalysis() {
	try {
		if (!textToAnalyze) {
			statusEl.textContent = 'Error: No text to analyze.';
			return;
		}

		clientButton.disabled = true;
		const startTime = performance.now();
		statusEl.textContent = 'Creating AI session...';

		console.log('[Sidepanel] Input text:', textToAnalyze);
		console.log('[Sidepanel] Input length:', textToAnalyze.length);

		const session = await self.LanguageModel.create({
			expectedOutputs: [
				{ type: 'text', languages: ['en'] }
			]
		});

		statusEl.textContent = 'Analyzing promised experience from metadata...';
		resultEl.innerHTML = '<p style="color: #aaa;">🎯 Examining what this content promises through its title, description, and presentation...</p>';

		const prompt = `Analyze this YouTube video's metadata to identify the experience it promises to deliver.

VIDEO METADATA:
${textToAnalyze}

Examine the language, tone, and presentation patterns. Provide analysis using active, descriptive language (avoid all forms of "to be"):

**Content Promise:**
[What experience the title, description, and channel presentation promise to deliver]

**Stimulation Signals:**
[Identify patterns suggesting high/low sensory intensity: fast-pacing keywords, excitement language, calm descriptors, educational framing, etc.]

**Potential Neural Impact:**
[Describe the likely effect on a child's nervous system based on promised content: rapid attention shifts, sustained focus, emotional peaks, cognitive engagement, etc.]

**Target Engagement Pattern:**
[The viewing experience this metadata suggests: continuous excitement, calm exploration, challenge-reward cycles, emotional storytelling, etc.]

Note: This analysis examines the PROMISE the content makes through its presentation. The Full Video Analysis will measure whether the actual content delivers on this promise and calculate the precise D-Level score based on real audiovisual data.`;

		console.log('[Sidepanel] Sending prompt, length:', prompt.length);
		console.log('[Sidepanel] Full prompt:', prompt);
		
		try {
			const result = await session.prompt(prompt);
			console.log('[Sidepanel] Got result, length:', result.length);
			console.log('[Sidepanel] Full result:', result);
			console.log('[Sidepanel] Result type:', typeof result);
			
			const finalResult = result || '';
		
			if (!finalResult || finalResult.trim().length < 10) {
				statusEl.textContent = 'Analysis Error:';
				resultEl.innerHTML = `<p style="color: #ff6b6b;">The AI model returned an empty or very short response (${finalResult.length} characters).</p>
				<p><strong>Returned value:</strong> "${finalResult}"</p>
				<p>This might happen because:</p>
				<ul>
					<li>Gemini Nano needs more context or a different prompt format</li>
					<li>The model is not fully initialized</li>
					<li>Try using simpler questions</li>
				</ul>
				<p><strong>Input text length:</strong> ${textToAnalyze.length} characters</p>
				<p><strong>Try the server-side analysis for reliable results.</strong></p>`;
				clientButton.style.display = 'block';
				clientButton.disabled = false;
			} else {
				const endTime = performance.now();
				const duration = ((endTime - startTime) / 1000).toFixed(1);
				statusEl.innerHTML = `✅ Promise Analysis Complete <span style="color: #FFA726; font-weight: bold;">(${duration}s - Local AI)</span>`;
				resultEl.innerHTML = `<p style="background: #2a4a2a; padding: 8px; border-radius: 4px; color: #90EE90; font-size: 0.9em;">
					🎯 Promise Analysis complete. This examines what the content promises through its metadata. Run the Full Analysis below to verify if the video delivers on this promise with measured D-Level scoring.
				</p>` + simpleMarkdownToHTML(finalResult);
				clientButton.style.display = 'none';
				lastAnalyzedVideoId = currentVideoId;
			}

			session.destroy();
		} catch (innerError) {
			console.error('[Sidepanel] Prompt error:', innerError);
			throw innerError;
		}
	} catch (e) {
		console.error('Prompt API Error:', e);
		clientButton.disabled = false;

		if (e.name === 'NotSupportedError') {
			statusEl.textContent = 'Error: This feature requires Chrome 138+ with AI capabilities enabled.';
		} else if (e.name === 'NotReadableError') {
			statusEl.textContent = 'Error: Not enough disk space. Please free up at least 22 GB and try again.';
		} else if (e.message && e.message.includes('user gesture')) {
			statusEl.textContent = 'Please click the button again to download the AI model.';
			clientButton.style.display = 'block';
		} else {
			statusEl.textContent = `Error: ${e.message || 'An unexpected error occurred. Check console for details.'}`;
		}
	}
}

clientButton.onclick = runAnalysis;

async function checkApiKey() {
	const { apiKey } = await chrome.storage.local.get('apiKey');
	if (!apiKey) {
		apiKeySection.style.display = 'block';
		return false;
	}
	return true;
}

saveApiKeyButton.onclick = async () => {
	const apiKey = apiKeyInput.value.trim();
	if (!apiKey) {
		serverStatusEl.textContent = 'Please enter a valid API key';
		serverStatusEl.style.color = '#ff6b6b';
		return;
	}
	
	await chrome.storage.local.set({ apiKey });
	serverStatusEl.textContent = '✓ API key saved successfully!';
	serverStatusEl.style.color = '#4caf50';
	apiKeySection.style.display = 'none';
	setTimeout(() => {
		serverStatusEl.textContent = '';
	}, 3000);
};

serverButton.onclick = async () => {
	const hasApiKey = await checkApiKey();
	if (!hasApiKey) {
		serverStatusEl.textContent = 'Please add your Gemini API key first';
		serverStatusEl.style.color = '#ff6b6b';
		return;
	}
	
	const startTime = performance.now();
	serverButton.disabled = true;
	serverStatusEl.innerHTML = '🔄 Full analysis in progress... <span style="color: #FF7043;">(~30-60s - Cloud AI)</span>';
	serverStatusEl.style.color = '#aaa';
	
	chrome.runtime.sendMessage({ type: 'ANALYZE_VIDEO_FROM_SIDEPANEL' }, async (response) => {
		serverButton.disabled = false;
		
		if (chrome.runtime.lastError) {
			serverStatusEl.textContent = `Error: ${chrome.runtime.lastError.message}`;
			serverStatusEl.style.color = '#ff6b6b';
			return;
		}
		
		if (response && response.success) {
			const duration = ((performance.now() - startTime) / 1000).toFixed(1);
			const dLevel = response.analysis?.dLevel || 'N/A';
			serverStatusEl.innerHTML = `✓ Analysis completed! <span style="color: #FF7043; font-weight: bold;">(D-Level: ${dLevel}, ${duration}s - Cloud AI)</span> Check the extension popup for details.`;
			serverStatusEl.style.color = '#4caf50';
			lastAnalyzedVideoId = currentVideoId;
		} else if (response && response.error) {
			if (response.error.includes('API key')) {
				serverStatusEl.textContent = '⚠️ ' + response.error;
				apiKeySection.style.display = 'block';
			} else {
				serverStatusEl.textContent = `Error: ${response.error}`;
			}
			serverStatusEl.style.color = '#ff6b6b';
		}
	});
};

console.log('[Sidepanel] 🚀 Initializing sidepanel...');

// Set up storage change listener FIRST before anything else
chrome.storage.session.onChanged.addListener((changes) => {
	console.log('[Sidepanel] 📬 Storage changed:', Object.keys(changes));
	
	if (changes.clearSidepanel) {
		console.log('[Sidepanel] ✅ Clear signal received! Clearing results...');
		console.log('[Sidepanel] Old value:', changes.clearSidepanel.oldValue, 'New value:', changes.clearSidepanel.newValue);
		
		// Immediately clear everything
		resultEl.innerHTML = '';
		serverStatusEl.innerHTML = '';
		serverStatusEl.style.color = '';
		statusEl.textContent = 'Loading new video...';
		clientButton.style.display = 'none';
		clientButton.disabled = false;
		
		// Reset tracking
		lastAnalyzedVideoId = null;
		lastAnalysisStartTime = null;
		
		console.log('[Sidepanel] ✅ Cleared successfully');
	}
	if (changes.lastTextToSummarize || changes.analysisStartTime) {
		console.log('[Sidepanel] 📥 New analysis requested, refreshing...');
		checkAndPrepare();
	}
});

console.log('[Sidepanel] ✅ Listener registered');

// Check for existing clear signal on load
chrome.storage.session.get(['clearSidepanel'], (data) => {
	console.log('[Sidepanel] Checking for existing clear signal:', data);
	if (data.clearSidepanel) {
		const timeSinceClear = Date.now() - data.clearSidepanel;
		if (timeSinceClear < 5000) { // Within 5 seconds
			console.log('[Sidepanel] ⚡ Found recent clear signal, clearing now');
			resultEl.innerHTML = '';
			serverStatusEl.innerHTML = '';
			serverStatusEl.style.color = '';
			statusEl.textContent = 'Loading new video...';
			clientButton.style.display = 'none';
			clientButton.disabled = false;
			lastAnalyzedVideoId = null;
			lastAnalysisStartTime = null;
		}
	}
});

checkAndPrepare();
checkApiKey();
