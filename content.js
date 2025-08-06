// YouTube Channel Focus - Content Script
let hiddenCount = 0;
let isEnabled = true;

// Main filtering function
function filterContent() {
  chrome.storage.sync.get({ channels: [], enabled: true }, (data) => {
    isEnabled = data.enabled;
    if (!isEnabled) {
      showAllVideos();
      return;
    }

    const whitelist = data.channels;
    const allVideos = document.querySelectorAll(
      'ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer'
    );

    hiddenCount = 0;

    allVideos.forEach(video => {
      const channelLink = video.querySelector(
        'a[href*="/channel/"], a[href*="/user/"], a[href*="/c/"], a[href*="/@"]'
      );
      
      if (channelLink) {
        const channelUrl = channelLink.href;
        const channelName = channelLink.textContent.trim();
        const channelId = extractChannelId(channelUrl);

        const isAllowed = whitelist.some(channel => {
          return (
            channel.id === channelId ||
            channel.name.toLowerCase() === channelName.toLowerCase() ||
            channelUrl.includes(channel.id) ||
            channelUrl.includes(channel.name)
          );
        });

        if (whitelist.length > 0 && !isAllowed) {
          hideVideo(video);
          hiddenCount++;
        } else {
          showVideo(video);
        }
      }
    });

    updateStatsDisplay();
  });
}

// Helper functions
function extractChannelId(url) {
  const patterns = [
    /\/channel\/([^\/\?\&]+)/,
    /\/(?:c\/|user\/|@)([^\/\?\&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function hideVideo(video) {
  video.style.opacity = '0.3';
  video.style.pointerEvents = 'none';
  video.style.position = 'relative';
  
  const marker = document.createElement('div');
  marker.style.position = 'absolute';
  marker.style.top = '0';
  marker.style.left = '0';
  marker.style.right = '0';
  marker.style.backgroundColor = 'rgba(255,0,0,0.5)';
  marker.style.color = 'white';
  marker.style.padding = '2px';
  marker.style.fontSize = '12px';
  marker.style.textAlign = 'center';
  marker.style.zIndex = '1000';
  marker.textContent = 'Hidden by YouTube Channel Focus';
  
  video.appendChild(marker);
}

function showVideo(video) {
  video.style.opacity = '';
  video.style.pointerEvents = '';
  const marker = video.querySelector('div');
  if (marker) marker.remove();
}

function showAllVideos() {
  document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer').forEach(video => {
    showVideo(video);
  });
  hiddenCount = 0;
  updateStatsDisplay();
}

function updateStatsDisplay() {
  let statsDiv = document.getElementById('ytcf-stats');
  if (!statsDiv) {
    statsDiv = document.createElement('div');
    statsDiv.id = 'ytcf-stats';
    statsDiv.style.position = 'fixed';
    statsDiv.style.bottom = '10px';
    statsDiv.style.right = '10px';
    statsDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    statsDiv.style.color = 'white';
    statsDiv.style.padding = '5px 10px';
    statsDiv.style.borderRadius = '4px';
    statsDiv.style.zIndex = '9999';
    document.body.appendChild(statsDiv);
  }
  statsDiv.textContent = `${hiddenCount} videos hidden`;
}

// MutationObserver to handle dynamic content
const observer = new MutationObserver(filterContent);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial run
filterContent();

// Listen for changes from popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'filter') {
    filterContent();
  }
});