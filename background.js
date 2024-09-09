// Object to store tab count for each window
let windowTabCounts = {};

// Function to update the toolbar icon for the current window
async function updateToolbarIcon(windowId) {
  // Query tabs in the current window
  let tabs = await browser.tabs.query({windowId: windowId});
  
  // Ensure the tab count is calculated correctly
  let tabCount = tabs.length.toString();

  // Store the tab count for the window
  windowTabCounts[windowId] = tabCount;

  // Create a canvas to draw the icon
  let canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  let context = canvas.getContext('2d');

  // Draw a transparent background
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the border (5px wide)
  context.strokeStyle = '#4da9ff';
  context.lineWidth = 5;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  // Set font properties for the tab count text
  context.font = 'bold 18px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#FFFFFF'; // Black text color

  // Draw the tab count in the center of the icon
  context.fillText(tabCount, canvas.width / 2, canvas.height / 2);

  // Convert the canvas to an image data URL
  let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // Update the browser action icon for the specific window
  browser.browserAction.setIcon({imageData: imageData, windowId: windowId});
}

// Listener for when a tab is created
browser.tabs.onCreated.addListener((tab) => {
  updateToolbarIcon(tab.windowId);
});

// Listener for when a tab is removed
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // Delay the update slightly to ensure the tab is fully removed before recounting
  setTimeout(() => {
    updateToolbarIcon(removeInfo.windowId);
  }, 100);
});

// Listener for when a tab is detached (i.e., moved to another window)
browser.tabs.onDetached.addListener((tabId, detachInfo) => {
  updateToolbarIcon(detachInfo.oldWindowId);
});

// Listener for when a tab is attached to a new window
browser.tabs.onAttached.addListener((tabId, attachInfo) => {
  updateToolbarIcon(attachInfo.newWindowId);
});

// Listener for when the window focus changes
browser.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== browser.windows.WINDOW_ID_NONE) {
    let tabCount = windowTabCounts[windowId] || "0";
    updateToolbarIcon(windowId);
  }
});

// Listener for when a window is created
browser.windows.onCreated.addListener((window) => {
  updateToolbarIcon(window.id);
});

// Listener for when a window is removed to clean up stored tab counts
browser.windows.onRemoved.addListener((windowId) => {
  delete windowTabCounts[windowId];
});

// Initialize toolbar icon for all open windows
async function initializeToolbarIcon() {
  let windows = await browser.windows.getAll({windowTypes: ['normal', 'popup']});
  for (let window of windows) {
    updateToolbarIcon(window.id);
  }
}

initializeToolbarIcon();
