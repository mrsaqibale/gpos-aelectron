const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Disable Chrome sandbox to avoid permission issues on Linux
// These must be called before app.whenReady()
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-setuid-sandbox');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
// Disable GPU acceleration to avoid GPU-related warnings
app.commandLine.appendSwitch('--disable-gpu');
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('--disable-renderer-backgrounding');

const { registerFoodIpcHandlers } = require('./ipchandler/foodipc.cjs');
const { registerTableIpcHandlers } = require('./ipchandler/table.cjs');
const { registerFloorIpcHandlers } = require('./ipchandler/floor.cjs');
const { registerEmployeeIpcHandlers } = require('./ipchandler/employee.cjs');
const { registerCustomerIpcHandlers } = require('./ipchandler/customer.cjs');
const { registerOrdersIpcHandlers } = require('./ipchandler/orders.cjs');

async function createWindow() {
  // Get screen dimensions
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  // Calculate window size with 10% margin from all sides
  const marginPercent = 0.10;
  const windowWidth = Math.floor(screenWidth * (1 - 2 * marginPercent));
  const windowHeight = Math.floor(screenHeight * (1 - 2 * marginPercent));
  
  // Calculate position to center the window
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    // Remove default frame to create custom window controls
    frame: false,
    // Make window always on top (optional - remove if not needed)
    // alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false // Disable sandbox to avoid permission issues
    },
  });

  // Always try to load the Vite dev server first
  const http = require('http');
  const checkPort = (port) => {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        req.destroy();
        resolve(res.statusCode === 200);
      });
      req.on('error', () => {
        req.destroy();
        resolve(false);
      });
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  };

  // Try common Vite ports - check from lowest to highest
  const ports = [5173, 5174, 5175, 5176, 5177, 5178];
  let devServerPort = null;

  for (const port of ports) {
    console.log(`Checking port ${port}...`);
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      devServerPort = port;
      console.log(`Found Vite dev server on port ${devServerPort}`);
      break;
    }
  }

  if (devServerPort) {
    console.log(`Loading Vite dev server on port ${devServerPort}`);
    win.loadURL(`http://localhost:${devServerPort}/`);
    win.webContents.openDevTools();
  } else {
    console.log('Vite dev server not found, loading production build');
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  // Set environment for IPC handlers
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  
  // Expose window control functions to renderer
  win.webContents.on('did-finish-load', () => {
    // Simple window control setup
    console.log('Window loaded successfully');
  });
  
  return win;
}

// Remove the default application menu (File, Edit, View, etc.)
Menu.setApplicationMenu(null);

app.whenReady().then(async () => {
  const win = await createWindow();

  // Register IPC handlers
  registerFoodIpcHandlers();
  registerTableIpcHandlers();
  registerFloorIpcHandlers();
  registerEmployeeIpcHandlers();
  registerCustomerIpcHandlers();
  registerOrdersIpcHandlers();

  // Window control IPC handlers
  const { ipcMain } = require('electron');
  
  ipcMain.on('window:minimize', () => {
    win.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    win.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return win.isMaximized();
  });

  // Handle maximize/unmaximize events
  win.on('maximize', () => {
    console.log('Window maximized');
  });

  win.on('unmaximize', () => {
    console.log('Window unmaximized');
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
