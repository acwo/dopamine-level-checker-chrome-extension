console.log('D-Level AI background script loaded.');

const GEMINI_API_URL =
	'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'ANALYZE_VIDEO') {
		analyzeVideo(request.videoId)
			.then((analysis) => {
				sendResponse({ success: true, analysis });
			})
			.catch((error) => {
				sendResponse({ success: false, error: error.message });
			});
		return true; // Indicates that the response is sent asynchronously
	} else if (request.type === 'RUN_CLIENT_ANALYSIS') {
		if (sender.tab && sender.tab.id) {
			// Save the text with a timestamp to signal new analysis
			chrome.storage.session.set({ 
				lastTextToSummarize: request.text,
				analysisStartTime: Date.now()
			});
		}
	} else if (request.type === 'CLEAR_SIDEPANEL') {
		console.log('[Background] 🗑️ CLEAR_SIDEPANEL requested from tab:', sender.tab?.id);
		const timestamp = Date.now();
		chrome.storage.session.set({ clearSidepanel: timestamp }, () => {
			if (chrome.runtime.lastError) {
				console.error('[Background] ❌ Error storing clear signal:', chrome.runtime.lastError);
				sendResponse({ success: false, error: chrome.runtime.lastError.message });
			} else {
				console.log('[Background] ✅ Clear signal stored with timestamp:', timestamp);
				sendResponse({ success: true, timestamp });
			}
		});
		return true;
	} else if (request.type === 'OPEN_SIDE_PANEL') {
		if (sender.tab && sender.tab.id) {
			chrome.sidePanel.open({ tabId: sender.tab.id });
		}
	} else if (request.type === 'ANALYZE_VIDEO_FROM_SIDEPANEL') {
		chrome.tabs.query({ url: ['https://www.youtube.com/watch*', 'https://www.youtubekids.com/watch*'] }, (tabs) => {
			if (tabs.length > 0) {
				const youtubeTab = tabs[0];
				if (youtubeTab.url) {
					const videoId = new URL(youtubeTab.url).searchParams.get('v');
					if (videoId) {
						analyzeVideo(videoId)
							.then((analysis) => {
								sendResponse({ success: true, message: 'Analysis completed successfully!', analysis });
							})
							.catch((error) => {
								sendResponse({ success: false, error: error.message });
							});
					} else {
						sendResponse({ success: false, error: 'Could not extract video ID from URL' });
					}
				} else {
					sendResponse({ success: false, error: 'No YouTube URL found' });
				}
			} else {
				sendResponse({ success: false, error: 'No YouTube or YouTube Kids tab found. Please open a video first.' });
			}
		});
		return true;
	}
});

async function getVideoTitle(videoId: string): Promise<string> {
	try {
		// Use YouTube's oEmbed API to get the correct video title
		const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
		const response = await fetch(oembedUrl);
		if (response.ok) {
			const data = await response.json();
			return data.title || 'Unknown Video';
		}
	} catch (error) {
		console.error('Failed to fetch video title:', error);
	}
	return 'Unknown Video';
}

async function analyzeVideo(videoId: string) {
	console.log(`[D-Level] Starting analysis for video: ${videoId}`);
	
	const { apiKey } = await chrome.storage.local.get('apiKey');
	if (!apiKey) {
		throw new Error('Gemini API key not found. Please set it in the extension options.');
	}

	// Fetch the correct video title first
	console.log(`[D-Level] Fetching title for: ${videoId}`);
	const correctTitle = await getVideoTitle(videoId);
	console.log(`[D-Level] Video title: ${correctTitle}`);

	const promptUrl = chrome.runtime.getURL('prompt.txt');
	const systemPrompt = await fetch(promptUrl).then((res) => res.text());
	
	// CRITICAL: Always use youtube.com URL, not youtubekids.com
	// Gemini 2.5 Pro can access youtube.com but not youtubekids.com
	// Since video IDs are identical, we construct the standard YouTube URL
	const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
	
	// CRITICAL: Be EXTREMELY explicit about which video to analyze
	// Gemini might see related videos or playlists, so we repeat the video ID multiple times
	const userPrompt = `IMPORTANT: You MUST analyze ONLY this specific video:

YouTube URL: ${youtubeUrl}
Video ID: ${videoId}
Video Title: ${correctTitle}

DO NOT analyze:
- Related videos
- Recommended videos  
- Playlist videos
- Videos in the description
- Any other video

ONLY analyze the video with ID: ${videoId}

In your JSON response, you MUST include "videoId": "${videoId}" exactly as shown.

Now analyze this video: ${youtubeUrl}`;

	console.log(`[D-Level] Sending request to Gemini 2.5 Pro with extended thinking (budget: 32768 tokens)`);
	console.log(`[D-Level] Video URL for Gemini: ${youtubeUrl}`);
	console.log(`[D-Level] Video ID: ${videoId}`);

	const requestBody = {
		contents: [
			{
				parts: [{ text: systemPrompt }, { text: userPrompt }],
			},
		],
		generationConfig: {
			thinkingConfig: {
				thinkingBudget: 32768,
			},
		},
	};

	const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			`Gemini API error: ${response.status} ${
				response.statusText
			} - ${JSON.stringify(errorData)}`
		);
	}

	const data = await response.json();
	const analysisText = data.candidates[0].content.parts[0].text;

	// The response from Gemini is a JSON string, sometimes wrapped in markdown backticks.
	const cleanedAnalysisText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();

	try {
		const analysisJson = JSON.parse(cleanedAnalysisText);

		console.log(`[D-Level] AI returned videoId: ${analysisJson.videoId}`);
		console.log(`[D-Level] AI returned title: ${analysisJson.title}`);

		// CRITICAL: Force override videoId and title with the correct values
		// The AI might analyze related videos or return incorrect metadata
		analysisJson.videoId = videoId;
		analysisJson.title = correctTitle;

		console.log(`[D-Level] Forced correct videoId: ${videoId}`);
		console.log(`[D-Level] Forced correct title: ${correctTitle}`);

		// Add creation timestamp if not present
		if (!analysisJson.creationDate) {
			analysisJson.creationDate = new Date().toISOString();
		}

		await chrome.storage.local.set({ [videoId]: analysisJson });
		console.log(`[D-Level] Analysis saved successfully for: ${videoId}`);
		return analysisJson;
	} catch (e) {
		console.error('[D-Level] Failed to parse Gemini response as JSON:', cleanedAnalysisText);
		throw new Error('Failed to parse the analysis from the AI response.');
	}
}