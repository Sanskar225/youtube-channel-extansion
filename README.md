# FocusYT – Stay Focused on YouTube

**FocusYT** is a lightweight Chrome extension that helps you stay focused on YouTube by only showing videos from specific, whitelisted channels. Eliminate distractions and keep your feed clean by hiding all other content.

---

## 🚀 Features

- ✅ Whitelist your favorite educational/productive YouTube channels
- 🚫 Hide videos from all non-whitelisted channels
- 🔄 Works across Home, Search, and Sidebar suggestions
- 🧠 Persistent storage using Chrome Sync
- 🖱️ Easy-to-use popup interface to add/remove channels

---

## 📦 Installation

1. Clone or download this repository.
2. Open **Google Chrome** and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked**.
5. Select the `focusyt-extension/` folder.
6. Pin the extension and start focusing!

---

## 🛠️ Folder Structure


---

## 🧪 How It Works

- The extension uses a **content script** to scan all videos on YouTube pages.
- It reads your saved whitelist of allowed channels from Chrome Sync Storage.
- If a video is **not from an allowed channel**, it hides the entire video element.
- A **popup UI** lets you easily manage your list of allowed channels.

---

## 💡 Planned Features

- [ ] Toggle Focus Mode on/off
- [ ] Whitelist by channel URL or ID
- [ ] Time-based activation (e.g., Focus Hours)
- [ ] Statistics dashboard of time spent


## 👨‍💻 Contributing

PRs and suggestions are welcome! Here’s how you can help:

- Report bugs
- Suggest new features
- Contribute to the code (fork, commit, PR)

Built with ❤️ by SANSKAR SINHA
