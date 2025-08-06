document.addEventListener('DOMContentLoaded', () => {
  const channelInput = document.getElementById('channelInput');
  const addBtn = document.getElementById('addBtn');
  const channelList = document.getElementById('channelList');
  const toggle = document.getElementById('toggleExtension');
  const toggleStatus = document.getElementById('toggleStatus');
  const statsCount = document.getElementById('statsCount');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('fileInput');

  // Load saved data
  chrome.storage.sync.get({ channels: [], enabled: true }, (data) => {
    renderChannels(data.channels);
    toggle.checked = data.enabled;
    updateToggleStatus(data.enabled);
  });

  // Toggle extension
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ enabled }, () => {
      updateToggleStatus(enabled);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'filter' });
      });
    });
  });

  // Add channel
  addBtn.addEventListener('click', addChannel);
  channelInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addChannel();
  });

  function addChannel() {
    const input = channelInput.value.trim();
    if (!input) return;

    const channelData = {
      id: extractChannelId(input),
      name: extractChannelName(input),
      url: input.includes('youtube.com') ? input : null
    };

    if (!channelData.id) {
      alert('Invalid channel URL. Please use a full YouTube channel URL.');
      return;
    }

    chrome.storage.sync.get({ channels: [] }, (data) => {
      const exists = data.channels.some(ch => ch.id === channelData.id);
      if (exists) {
        alert('This channel is already in your list!');
        return;
      }

      const updatedChannels = [...data.channels, channelData];
      chrome.storage.sync.set({ channels: updatedChannels }, () => {
        renderChannels(updatedChannels);
        channelInput.value = '';
        refreshContent();
      });
    });
  }

  // Export/import
  exportBtn.addEventListener('click', exportChannels);
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', importChannels);

  function exportChannels() {
    chrome.storage.sync.get({ channels: [] }, (data) => {
      const blob = new Blob([JSON.stringify(data.channels, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'youtube_channels_whitelist.json';
      a.click();
    });
  }

  function importChannels(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const channels = JSON.parse(event.target.result);
        if (Array.isArray(channels)) {
          chrome.storage.sync.set({ channels }, () => {
            renderChannels(channels);
            refreshContent();
            alert(`Successfully imported ${channels.length} channels!`);
          });
        }
      } catch (err) {
        alert('Error importing channels. Invalid file format.');
      }
    };
    reader.readAsText(file);
  }

  // Helper functions
  function extractChannelId(input) {
    const patterns = [
      /youtube\.com\/channel\/([^\/\?\&]+)/,
      /youtube\.com\/(?:c\/|user\/|@)([^\/\?\&]+)/
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  function extractChannelName(input) {
    const urlMatch = input.match(/youtube\.com\/(?:channel\/|@)([^\/\?\&]+)/);
    if (urlMatch) return urlMatch[1];
    return input.split('/').pop().replace('@', '');
  }

  function renderChannels(channels) {
    channelList.innerHTML = '';
    channels.forEach((channel, index) => {
      const div = document.createElement('div');
      div.className = 'channel-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = channel.name || channel.id;
      nameSpan.title = channel.id;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        const updated = channels.filter((_, i) => i !== index);
        chrome.storage.sync.set({ channels: updated }, () => {
          renderChannels(updated);
          refreshContent();
        });
      });
      
      div.appendChild(nameSpan);
      div.appendChild(deleteBtn);
      channelList.appendChild(div);
    });
  }

  function updateToggleStatus(enabled) {
    toggleStatus.textContent = enabled ? 'Enabled' : 'Disabled';
    toggleStatus.style.color = enabled ? 'green' : 'red';
  }

  function refreshContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'filter' });
      }
    });
  }

  // Listen for stats updates
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'stats') {
      statsCount.textContent = request.count;
    }
  });
});