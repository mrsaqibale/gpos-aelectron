const { app, BrowserWindow, Menu, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

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
const { registerCouponIpcHandlers } = require('./ipchandler/coupon.cjs');
const { registerVoucherIpcHandlers } = require('./ipchandler/voucher.cjs');
const { registerHotelIpcHandlers } = require('./ipchandler/hotel.cjs');
const { initDatabase } = require('./init-database.cjs');

async function createWindow() {
  // Get screen dimensions
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
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
      sandbox: false, // Disable sandbox to avoid permission issues
      webSecurity: false // Allow local file access
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
  // Register custom protocol for serving local files
  protocol.registerFileProtocol('local-file', (request, callback) => {
    const filePath = request.url.replace('local-file://', '');
    const absolutePath = path.resolve(__dirname, '../src/database', filePath);
    
    // Security check: ensure the file is within the uploads directory
    const uploadsDir = path.resolve(__dirname, '../src/database/uploads');
    if (!absolutePath.startsWith(uploadsDir)) {
      callback({ error: 403 });
      return;
    }
    
    // Check if file exists
    if (fs.existsSync(absolutePath)) {
      callback({ path: absolutePath });
    } else {
      callback({ error: 404 });
    }
  });

  const win = await createWindow();

  // Register IPC handlers
  registerFoodIpcHandlers();
  registerTableIpcHandlers();
  registerFloorIpcHandlers();
  registerEmployeeIpcHandlers();
  registerCustomerIpcHandlers();
  registerOrdersIpcHandlers();
  registerCouponIpcHandlers();
  registerVoucherIpcHandlers();
  registerHotelIpcHandlers();
  
  // Initialize database tables
  initDatabase();

  // Window control IPC handlers
  const { ipcMain } = require('electron');
  
  ipcMain.on('window:minimize', () => {
    win.minimize();
  });

  // Only allow minimize - no maximize or close from main window
  // ipcMain.on('window:maximize', () => {
  //   if (win.isMaximized()) {
  //     win.unmaximize();
  //   } else {
  //     win.maximize();
  //   }
  // });

  // Close handler for login pages only
  ipcMain.on('window:close', () => {
    win.close();
  });

  // ipcMain.handle('window:isMaximized', () => {
  //   return win.isMaximized();
  // });

  // Handle maximize/unmaximize events
  // win.on('maximize', () => {
  //   console.log('Window maximized');
  // });

  // win.on('unmaximize', () => {
  //   console.log('Window unmaximized');
  // });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
