console.log('D-Level AI content script loaded.');

function isYouTubeKids() {
	return window.location.hostname.includes('youtubekids.com');
}

function isExtensionContextValid() {
	try {
		return chrome.runtime?.id !== undefined;
	} catch {
		return false;
	}
}

function showExtensionReloadMessage() {
	const existingButton = document.getElementById('dlevel-preliminary-button');
	if (existingButton) {
		existingButton.textContent = '⚠️ Extension Reloaded - Refresh Page';
		existingButton.style.backgroundColor = '#ff6b6b';
		existingButton.onclick = () => {
			window.location.reload();
		};
	}
}

function injectPreliminaryButton() {
	if (document.getElementById('dlevel-preliminary-button')) {
		return;
	}

	const button = document.createElement('button');
	button.id = 'dlevel-preliminary-button';
	
	if (isYouTubeKids()) {
		// Kid-friendly button design for YouTube Kids
		button.innerHTML = '⚡ Check Video Energy Level 🎯';
		button.style.background = 'linear-gradient(135deg, #FFA726 0%, #FF7043 100%)';
		button.style.color = 'white';
		button.style.fontSize = '16px';
		button.style.fontWeight = '700';
		button.style.padding = '14px 20px';
		button.style.borderRadius = '25px';
		button.style.border = '3px solid #fff';
		button.style.boxShadow = '0 4px 15px rgba(255, 167, 38, 0.4)';
		button.style.cursor = 'pointer';
		button.style.transition = 'all 0.3s ease';
		button.style.textAlign = 'center';
		button.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		button.style.letterSpacing = '0.5px';
		
		// Hover effects
		button.onmouseenter = () => {
			button.style.transform = 'scale(1.05)';
			button.style.background = 'linear-gradient(135deg, #FF7043 0%, #FF5722 100%)';
			button.style.boxShadow = '0 6px 20px rgba(255, 112, 67, 0.6)';
		};
		button.onmouseleave = () => {
			button.style.transform = 'scale(1)';
			button.style.background = 'linear-gradient(135deg, #FFA726 0%, #FF7043 100%)';
			button.style.boxShadow = '0 4px 15px rgba(255, 167, 38, 0.4)';
		};
	} else {
		// Regular YouTube button design
		button.textContent = 'Run D-Level Analysis';
		button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--filled yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m';
		button.style.margin = '0 0 0 8px';
		button.style.background = 'linear-gradient(135deg, #FFA726 0%, #FF7043 100%)';
		button.style.color = 'white';
		button.style.border = 'none';
		button.style.transition = 'all 0.2s';
		
		// Hover effect for regular YouTube
		button.onmouseenter = () => {
			button.style.background = 'linear-gradient(135deg, #FF7043 0%, #FF5722 100%)';
		};
		button.onmouseleave = () => {
			button.style.background = 'linear-gradient(135deg, #FFA726 0%, #FF7043 100%)';
		};
	}

	button.onclick = () => {
		if (!isExtensionContextValid()) {
			console.error('Extension context is invalid');
			showExtensionReloadMessage();
			return;
		}

		let title, description, channel, viewCount, uploadDate, likes, topComments;

		if (isYouTubeKids()) {
			// YouTube Kids selectors
			const titleElement = document.querySelector('h1#video-title.ytk-slim-video-metadata-renderer') || 
			                     document.querySelector('h1#video-title');
			const channelElement = document.querySelector('span#video-owner') ||
			                      document.querySelector('#owner-data-container span');
			
			title = titleElement?.textContent?.trim() || 'No Title';
			channel = channelElement?.textContent?.trim() || 'Unknown Channel';
			description = 'YouTube Kids - description not available';
			viewCount = 'Not shown on YouTube Kids';
			uploadDate = 'Not shown on YouTube Kids';
			likes = 'Not shown on YouTube Kids';
			topComments = 'Comments disabled on YouTube Kids';
		} else {
			// Regular YouTube selectors
			const titleElement = document.querySelector('h1.ytd-watch-metadata');
			const descriptionContainer = document.querySelector('#description-inline-expander');
			const channelElement = document.querySelector('ytd-channel-name a');
			const viewCountElement = document.querySelector('ytd-video-view-count-renderer span.view-count');
			const uploadDateElement = document.querySelector('#info-strings yt-formatted-string');
			const likesElement = document.querySelector('like-button-view-model button[aria-label*="like"]');
			
			const commentsSection = document.querySelector('#comments');
			topComments = '';
			if (commentsSection) {
				const commentElements = commentsSection.querySelectorAll('#content-text');
				const comments = Array.from(commentElements).slice(0, 5);
				topComments = comments.map((el, i) => `Comment ${i + 1}: ${el.textContent?.trim() || ''}`).join('\n');
			}

			title = titleElement?.textContent?.trim() || 'No Title';
			description = descriptionContainer?.textContent?.trim() || 'No Description';
			channel = channelElement?.textContent?.trim() || 'Unknown Channel';
			viewCount = viewCountElement?.textContent?.trim() || 'Unknown views';
			uploadDate = uploadDateElement?.textContent?.trim() || 'Unknown date';
			likes = likesElement?.getAttribute('aria-label') || 'Likes unavailable';
		}

		const textToAnalyze = `VIDEO TITLE:
${title}

CHANNEL:
${channel}

VIEWS: ${viewCount}
UPLOADED: ${uploadDate}
${likes}

DESCRIPTION:
${description}

${topComments ? `TOP COMMENTS:\n${topComments}` : 'Comments not loaded yet'}`;

		try {
			console.log('[Content] 🔘 Button clicked - sending messages synchronously');
			
			// CRITICAL: NO AWAIT before OPEN_SIDE_PANEL to preserve user gesture
			// Send all messages synchronously (fire-and-forget)
			chrome.runtime.sendMessage({ type: 'CLEAR_SIDEPANEL' });
			chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
			
			// Small delay before sending analysis data to ensure sidepanel is ready
			setTimeout(() => {
				chrome.runtime.sendMessage({
					type: 'RUN_CLIENT_ANALYSIS',
					text: textToAnalyze,
				});
			}, 150);
			
			console.log('[Content] ✅ All messages sent');
		} catch (error) {
			console.error('[Content] ❌ Extension context error:', error);
			showExtensionReloadMessage();
		}
	};

	let target;
	
	if (isYouTubeKids()) {
		// YouTube Kids: inject into metadata container or subscribe container
		target = document.querySelector('#subscribe-container') ||
		         document.querySelector('#metadata-container') ||
		         document.querySelector('ytk-slim-video-metadata-renderer');
		
		if (target) {
			// Additional layout adjustments for YouTube Kids
			button.style.margin = '16px 0';
			button.style.width = '100%';
			button.style.display = 'block';
			
			target.appendChild(button);
		}
	} else {
		// Regular YouTube: inject into actions menu
		target = document.querySelector('#actions #menu #top-level-buttons-computed');
		if (target) {
			target.appendChild(button);
		}
	}
}

const observer = new MutationObserver(() => {
	if (window.location.pathname === '/watch') {
		injectPreliminaryButton();
	}
});

observer.observe(document.body, { childList: true, subtree: true });

if (window.location.pathname === '/watch') {
	const interval = setInterval(() => {
		let checkSelector;
		
		if (isYouTubeKids()) {
			checkSelector = document.querySelector('ytk-slim-video-metadata-renderer') ||
			               document.querySelector('#metadata-container');
		} else {
			checkSelector = document.querySelector('#actions #menu #top-level-buttons-computed');
		}
		
		if (checkSelector) {
			injectPreliminaryButton();
			clearInterval(interval);
		}
	}, 500);
}
