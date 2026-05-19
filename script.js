const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const settingsButton = document.getElementById('settingsButton');
const settingsPanel = document.getElementById('settingsPanel');
const settingsClose = document.getElementById('settingsClose');
const discordButton = document.getElementById('discordButton');
const hotbarButtons = document.querySelectorAll('.hotbar-item');
const taskButtons = document.querySelectorAll('.task-icon');
const browserFrame = document.getElementById('browserFrame');
const browserShell = document.getElementById('browserShell');
const browserStatus = document.getElementById('browserStatus');
const themeButtons = document.querySelectorAll('.theme-swatch');
const wallpaperButtons = document.querySelectorAll('.wallpaper-thumb');
const locationButtons = document.querySelectorAll('.location-button');
const wallpaperUpload = document.getElementById('wallpaperUpload');
const locationLabel = document.getElementById('locationLabel');
const adblockLabel = document.getElementById('adblockLabel');
const clearBrowser = document.getElementById('clearBrowser');
const toggleAdblock = document.getElementById('toggleAdblock');
const homeButton = document.getElementById('homeButton');
const minimizeBtn = document.getElementById('minimizeBtn');
const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
const closeBtn = document.getElementById('closeBtn');
const desktopWallpaper = document.getElementById('desktopWallpaper');
const desktop = document.getElementById('desktop');
const gameModeButton = document.getElementById('gameModeButton');
const gamePanel = document.getElementById('gamePanel');
const gameGrid = document.getElementById('gameGrid');

let currentTheme = 'midnight';
let currentWallpaper = 'nebula';
let cursorAccent = false;
let adblockEnabled = true;
let customWallpaperVideo;
let currentLocation = 'Global';

const themeConfig = {
  midnight: {
    '--bg': '#06030a',
    '--bg-alt': '#0b0713',
    '--panel': 'rgba(18, 9, 28, 0.94)',
    '--panel-strong': 'rgba(25, 12, 42, 0.96)',
    '--primary': '#9d6cff',
    '--primary-strong': '#d294ff',
    '--accent': '#7a5dff',
  },
  violet: {
    '--bg': '#090319',
    '--bg-alt': '#11072e',
    '--panel': 'rgba(22, 11, 40, 0.96)',
    '--panel-strong': 'rgba(30, 14, 52, 0.97)',
    '--primary': '#b56aff',
    '--primary-strong': '#f5b4ff',
    '--accent': '#8a6dff',
  },
  indigo: {
    '--bg': '#070512',
    '--bg-alt': '#10092b',
    '--panel': 'rgba(18, 10, 32, 0.94)',
    '--panel-strong': 'rgba(25, 13, 48, 0.96)',
    '--primary': '#5f6cff',
    '--primary-strong': '#a5b3ff',
    '--accent': '#4c79ff',
  },
  teal: {
    '--bg': '#061012',
    '--bg-alt': '#0a1720',
    '--panel': 'rgba(17, 14, 34, 0.93)',
    '--panel-strong': 'rgba(24, 18, 43, 0.95)',
    '--primary': '#3cd1d1',
    '--primary-strong': '#7ef9f9',
    '--accent': '#4bc4d2',
  }
};

const wallpaperConfig = {
  nebula: 'wallpaper-nebula',
  purple: 'wallpaper-purple',
  grid: 'wallpaper-grid',
  video: 'wallpaper-video'
};

const builtInGames = [
  { name: 'Minecraft Classic', url: 'https://classic.minecraft.net/' },
  { name: 'Kirka.io', url: 'https://kirka.io' },
  { name: 'Krunker.io', url: 'https://krunker.io' },
  { name: 'Agar.io', url: 'https://agar.io' },
  { name: 'Slither.io', url: 'https://slither.io' },
  { name: 'Surviv.io', url: 'https://surviv.io' },
  { name: 'Shell Shockers', url: 'https://shellshock.io' },
  { name: 'Geometry Dash', url: 'https://www.crazygames.com/game/geometry-dash' },
  { name: 'Paper.io 2', url: 'https://paper-io.com/' },
  { name: 'Cookie Clicker', url: 'https://orteil.dashnet.org/cookieclicker/' }
];

function setStatus(message) {
  browserStatus.textContent = message;
}

function setActiveButton(buttons, clicked, activeClass = 'active') {
  buttons.forEach((button) => button.classList.toggle(activeClass, button === clicked));
}

function applyTheme(name) {
  currentTheme = name;
  Object.entries(themeConfig[name]).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
  themeButtons.forEach((button) => button.classList.toggle('active', button.dataset.theme === name));
}

function applyWallpaper(choice) {
  currentWallpaper = choice;
  wallpaperButtons.forEach((button) => button.classList.toggle('active', button.dataset.wallpaper === choice));
  desktopWallpaper.className = 'desktop-wallpaper ' + wallpaperConfig[choice];

  if (choice === 'video') {
    if (!customWallpaperVideo) {
      customWallpaperVideo = document.createElement('video');
      customWallpaperVideo.className = 'wallpaper-video';
      customWallpaperVideo.autoplay = true;
      customWallpaperVideo.loop = true;
      customWallpaperVideo.muted = true;
      customWallpaperVideo.playsInline = true;
      customWallpaperVideo.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      desktop.appendChild(customWallpaperVideo);
    }
    customWallpaperVideo.classList.add('active');
    desktopWallpaper.style.backgroundImage = 'none';
  } else if (customWallpaperVideo) {
    customWallpaperVideo.classList.remove('active');
  }
}

function setLocation(location) {
  currentLocation = location;
  locationLabel.textContent = `Location: ${location}`;
  locationButtons.forEach((button) => button.classList.toggle('active', button.dataset.location === location));
  setStatus(`Proxy location set to ${location}.`);
}

function updateAdblockState() {
  adblockEnabled = !adblockEnabled;
  const stateText = adblockEnabled ? 'On' : 'Off';
  toggleAdblock.textContent = `Adblock: ${stateText}`;
  adblockLabel.textContent = `Adblock: ${stateText}`;
  setStatus(`Adblocker turned ${stateText}.`);
}

function proxyPath(url) {
  const encoded = encodeURIComponent(url);
  const region = encodeURIComponent(currentLocation);
  const adblock = adblockEnabled ? '1' : '0';
  return `/proxy?url=${encoded}&adblock=${adblock}&region=${region}`;
}

function loadURL(url, label = 'Void Client') {
  if (url === 'about:blank') {
    browserFrame.src = 'about:blank';
    setStatus('Void Client home loaded. Search or choose a site from the hotbar.');
    return;
  }

  const target = url.startsWith('/proxy') ? url : proxyPath(url);
  browserFrame.src = target;
  setStatus(`Loading ${label} through VoidOS proxy...`);
}

function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    setStatus('Enter a site or game name to search.');
    return;
  }

  const normalized = query.toLowerCase();
  if (normalized.includes('krunker')) {
    loadURL('https://krunker.io', 'Krunker.io');
    setActiveButton(hotbarButtons, document.querySelector('.hotbar-item[data-url="https://krunker.io"]'));
    return;
  }
  if (normalized.includes('kirka')) {
    loadURL('https://kirka.io', 'Kirka.io');
    setActiveButton(hotbarButtons, document.querySelector('.hotbar-item[data-url="https://kirka.io"]'));
    return;
  }
  if (normalized.includes('minecraft')) {
    loadURL('https://classic.minecraft.net/', 'Minecraft Classic');
    return;
  }
  if (normalized.includes('agar')) {
    loadURL('https://agar.io', 'Agar.io');
    return;
  }
  if (normalized.includes('slither')) {
    loadURL('https://slither.io', 'Slither.io');
    return;
  }
  if (normalized.includes('discord')) {
    window.open('https://discord.com/invite/GPmAvaKDcF', '_blank');
    setStatus('Discord opened in a new tab.');
    return;
  }
  if (query.startsWith('http://') || query.startsWith('https://')) {
    loadURL(query, query);
    return;
  }
  if (normalized.includes('.com') || normalized.includes('.io')) {
    loadURL(`https://${query.replace(/^https?:\/\//, '')}`, query);
    return;
  }

  setStatus('Void search does not use Google. Enter a game, site, or URL to proxy.');
}

function buildGameGrid() {
  gameGrid.innerHTML = '';
  builtInGames.forEach((game) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <h4>${game.name}</h4>
      <p>Launch ${game.name} inside VoidOS game mode.</p>
      <button class="button secondary">Play</button>
    `;
    const button = card.querySelector('button');
    button.addEventListener('click', () => loadURL(game.url, game.name));
    gameGrid.appendChild(card);
  });
}

function init() {
  applyTheme(currentTheme);
  applyWallpaper(currentWallpaper);
  setLocation(currentLocation);
  buildGameGrid();

  setTimeout(() => {
    document.getElementById('loadingScreen').style.display = 'none';
    setStatus('Loaded VoidOS home.');
  }, 1200);

  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSearch();
  });

  settingsButton.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
  settingsClose.addEventListener('click', () => settingsPanel.classList.add('hidden'));
  discordButton.addEventListener('click', () => window.open('https://discord.com/invite/GPmAvaKDcF', '_blank'));

  hotbarButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const url = button.dataset.url;
      loadURL(url, button.textContent.trim());
      setActiveButton(hotbarButtons, button);
    });
  });

  taskButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const url = button.dataset.url;
      loadURL(url, button.textContent.trim());
      taskButtons.forEach((item) => item.classList.toggle('active', item === button));
    });
  });

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.theme));
  });

  wallpaperButtons.forEach((button) => {
    button.addEventListener('click', () => applyWallpaper(button.dataset.wallpaper));
  });

  locationButtons.forEach((button) => {
    button.addEventListener('click', () => setLocation(button.dataset.location));
  });

  wallpaperUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
      applyWallpaper('video');
      if (!customWallpaperVideo) {
        customWallpaperVideo = document.createElement('video');
        customWallpaperVideo.className = 'wallpaper-video active';
        customWallpaperVideo.autoplay = true;
        customWallpaperVideo.loop = true;
        customWallpaperVideo.muted = true;
        customWallpaperVideo.playsInline = true;
        desktop.appendChild(customWallpaperVideo);
      }
      customWallpaperVideo.src = url;
      customWallpaperVideo.classList.add('active');
      desktopWallpaper.style.backgroundImage = 'none';
    } else {
      applyWallpaper('nebula');
      desktopWallpaper.style.backgroundImage = `url('${url}')`;
      if (customWallpaperVideo) {
        customWallpaperVideo.classList.remove('active');
      }
    }
    setStatus('Custom wallpaper applied.');
  });

  clearBrowser.addEventListener('click', () => {
    loadURL('about:blank', 'Void Client');
  });

  toggleAdblock.addEventListener('click', updateAdblockState);
  gameModeButton.addEventListener('click', () => gamePanel.classList.toggle('hidden'));
  homeButton.addEventListener('click', () => {
    loadURL('about:blank', 'Void Client');
    setStatus('Returned to VoidOS home.');
  });

  minimizeBtn.addEventListener('click', () => browserShell.classList.toggle('hidden'));
  closeBtn.addEventListener('click', () => browserShell.classList.add('hidden'));
  toggleFullscreenBtn.addEventListener('click', () => browserShell.classList.toggle('browser-fullscreen'));

  browserFrame.addEventListener('load', () => {
    if (browserFrame.src.includes('about:blank')) {
      setStatus('Void Client is ready.');
    } else {
      setStatus(`Visited: ${browserFrame.src}`);
    }
  });

  setInterval(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clockLabel').textContent = `${hours}:${minutes}`;
  }, 1000);
}

init();
