const { app, BrowserWindow, Menu, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

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

const { registerHotelIpcHandlers } = require('./ipchandler/hotel.cjs');
const { registerFoodIpcHandlers } = require('./ipchandler/foodipc.cjs');
const { registerTableIpcHandlers } = require('./ipchandler/table.cjs');
const { registerFloorIpcHandlers } = require('./ipchandler/floor.cjs');
// Import employee IPC handlers
// Current location: electron/main.cjs
// Target: electron/ipchandler/employee.cjs (same level, into ipchandler folder)
const { registerEmployeeIpcHandlers } = require('./ipchandler/employee.cjs');
const { registerCustomerIpcHandlers } = require('./ipchandler/customer.cjs');
const { registerReservationIpcHandlers } = require('./ipchandler/reservation.cjs');
const { registerOrdersIpcHandlers } = require('./ipchandler/orders.cjs');
const { registerOrderDetailsIpcHandlers } = require('./ipchandler/orderDetails.cjs');
const { registerCouponIpcHandlers } = require('./ipchandler/coupon.cjs');
const { registerVoucherIpcHandlers } = require('./ipchandler/voucher.cjs');
const { registerSettingsIpcHandlers } = require('./ipchandler/settings.cjs');

// Import new attendance management IPC handlers
require('./ipchandler/attendance.cjs');
require('./ipchandler/salaryPayments.cjs');
require('./ipchandler/leaveRequests.cjs');
// const { initDatabase } = require('./init-database.cjs');

// Counter HTTP Server
let counterServer = null;
const COUNTER_PORT = 3001;

function startCounterServer() {
  if (counterServer) {
    console.log('Counter server already running on port', COUNTER_PORT);
    return { success: true, port: COUNTER_PORT, alreadyRunning: true };
  }

  counterServer = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Enable CORS for network access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Serve the counter HTML file
    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/counter') {
      const appPath = app.getAppPath();
      const counterHtmlPath = path.join(appPath, 'src', 'counter.html');
      
      fs.readFile(counterHtmlPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading counter.html:', err);
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial; padding: 20px;">
                <h1>Counter Not Found</h1>
                <p>Could not find counter.html file at: ${counterHtmlPath}</p>
                <p>Make sure the file exists in the src folder.</p>
              </body>
            </html>
          `);
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1>GPOS Counter Server</h1>
            <p>Available routes:</p>
            <ul>
              <li><a href="/">Counter</a></li>
              <li><a href="/counter">Counter (alternative)</a></li>
            </ul>
          </body>
        </html>
      `);
    }
  });

  return new Promise((resolve, reject) => {
    counterServer.listen(COUNTER_PORT, '0.0.0.0', () => {
      const networkInterfaces = require('os').networkInterfaces();
      let localIP = 'localhost';
      
      // Find the first non-internal IPv4 address
      for (const name of Object.keys(networkInterfaces)) {
        for (const interface of networkInterfaces[name]) {
          if (interface.family === 'IPv4' && !interface.internal) {
            localIP = interface.address;
            break;
          }
        }
        if (localIP !== 'localhost') break;
      }
      
      console.log(`🎯 Counter server running on:`);
      console.log(`   Local:  http://localhost:${COUNTER_PORT}`);
      console.log(`   Network: http://${localIP}:${COUNTER_PORT}`);
      console.log(`📱 Access the counter from any device on your network!`);
      
      resolve({ 
        success: true, 
        port: COUNTER_PORT, 
        localUrl: `http://localhost:${COUNTER_PORT}`,
        networkUrl: `http://${localIP}:${COUNTER_PORT}`,
        localIP 
      });
    });

    counterServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${COUNTER_PORT} is already in use. Trying next port...`);
        counterServer.close();
        resolve({ success: false, error: 'Port in use' });
      } else {
        console.error('Counter server error:', err);
        reject(err);
      }
    });
  });
}

function stopCounterServer() {
  if (counterServer) {
    counterServer.close(() => {
      console.log('Counter server stopped');
      counterServer = null;
    });
    return true;
  }
  return false;
}

function getCounterServerStatus() {
  return {
    isRunning: counterServer !== null,
    port: COUNTER_PORT
  };
}

async function createWindow() {
  // Get screen dimensions
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Set default window size to 1080x768
  const windowWidth = 1080;
  const windowHeight = 768;
  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: 0,
    y: 0,
    minWidth: 800,
    minHeight: 740,
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

  // Check if we're in development or production
  // In built app, __dirname will be inside app.asar, so we check for that
  const devDbPath = path.join(__dirname, '../src/database/pos.db');
  const prodDbPath = path.join(process.resourcesPath || '', 'database/pos.db');
  const isDev = !__dirname.includes('app.asar') && fs.existsSync(devDbPath);
  
  console.log('Environment check:', {
    isDev,
    __dirname,
    hasDevDatabase: fs.existsSync(devDbPath),
    hasProdDatabase: fs.existsSync(prodDbPath),
    devDbPath,
    prodDbPath,
    resourcesPath: process.resourcesPath
  });
  
  if (isDev) {
    // Development mode - use port 5173 directly
    console.log('Development mode - trying to load Vite dev server on port 5173');
    try {
      win.loadURL('http://localhost:5173/');
      console.log('Successfully loaded Vite dev server');
      win.webContents.openDevTools();
    } catch (error) {
      console.error('Failed to load Vite dev server:', error);
      console.log('Falling back to production build');
      win.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  } else {
    // Production mode - always load the built files
    console.log('Production mode - loading built files');
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  
  // Set environment for IPC handlers
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  
  // Enhanced debugging for React and DOM loading
  win.webContents.on('did-finish-load', () => {
    console.log('✅ Window loaded successfully');
    
    // Check if React is loaded by injecting a script
    win.webContents.executeJavaScript(`
      console.log('🔍 Checking React availability...');
      if (typeof React !== 'undefined') {
        console.log('✅ React is loaded:', React.version);
      } else {
        console.log('❌ React not found');
      }
      
      if (typeof window !== 'undefined') {
        console.log('✅ Window object available');
      }
      
      if (document.body && document.body.children.length > 0) {
        console.log('✅ DOM has content:', document.body.children.length, 'children');
      } else {
        console.log('❌ DOM appears empty or body not ready');
      }
      
      return {
        hasReact: typeof React !== 'undefined',
        reactVersion: typeof React !== 'undefined' ? React.version : null,
        bodyChildren: document.body ? document.body.children.length : 0,
        bodyHTML: document.body ? document.body.innerHTML.substring(0, 200) : 'No body'
      };
    `).then(result => {
      console.log('📊 React/DOM Status:', result);
    }).catch(error => {
      console.error('❌ Error checking React status:', error);
    });
  });
  
  // Add debugging for white screen issues
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });
  
  win.webContents.on('dom-ready', () => {
    console.log('📄 DOM ready - checking for content...');
    
    // Check if there's actual content loaded
    win.webContents.executeJavaScript(`
      return {
        title: document.title,
        bodyExists: !!document.body,
        bodyEmpty: !document.body || document.body.innerHTML.trim() === '',
        hasRootDiv: !!document.getElementById('root'),
        rootContent: document.getElementById('root') ? document.getElementById('root').innerHTML.substring(0, 100) : 'No root div'
      };
    `).then(result => {
      console.log('📊 DOM Content Check:', result);
    }).catch(error => {
      console.error('❌ Error checking DOM content:', error);
    });
  });
  
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`💬 Console [${level}]:`, message);
  });
  
  // Additional debugging for page loading
  win.webContents.on('did-start-loading', () => {
    console.log('🔄 Page started loading...');
  });
  
  win.webContents.on('did-stop-loading', () => {
    console.log('⏹️ Page stopped loading');
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
  registerHotelIpcHandlers();
  registerFoodIpcHandlers();
  registerTableIpcHandlers();
  registerFloorIpcHandlers();
  registerEmployeeIpcHandlers();
  registerCustomerIpcHandlers();
  registerReservationIpcHandlers();
  registerOrdersIpcHandlers();
  registerOrderDetailsIpcHandlers();
  registerCouponIpcHandlers();
  registerVoucherIpcHandlers();
  registerSettingsIpcHandlers();
  
  // Initialize database tables
  // initDatabase();

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

  // Shell operations
  ipcMain.handle('shell:openExternal', async (event, url) => {
    const { shell } = require('electron');
    return shell.openExternal(url);
  });

  // Path operations
  ipcMain.handle('path:join', async (event, ...args) => {
    return path.join(...args);
  });

  // App path operations
  ipcMain.handle('app:getAppPath', async () => {
    return app.getAppPath();
  });

  // File existence check
  ipcMain.handle('file:exists', async (event, filePath) => {
    return fs.existsSync(filePath);
  });

  // Get counter file path
  ipcMain.handle('counter:getPath', async () => {
    const appPath = app.getAppPath();
    const counterPath = path.join(appPath, 'src', 'counter.html');
    return {
      appPath,
      counterPath,
      exists: fs.existsSync(counterPath)
    };
  });

  // Counter server operations
  ipcMain.handle('counter:startServer', async () => {
    try {
      const result = await startCounterServer();
      return result;
    } catch (error) {
      console.error('Error starting counter server:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('counter:stopServer', async () => {
    return stopCounterServer();
  });

  ipcMain.handle('counter:getServerStatus', async () => {
    return getCounterServerStatus();
  });

  ipcMain.handle('counter:openInBrowser', async () => {
    const status = getCounterServerStatus();
    if (status.isRunning) {
      const { shell } = require('electron');
      return shell.openExternal(`http://localhost:${COUNTER_PORT}`);
    } else {
      throw new Error('Counter server is not running');
    }
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

// Cleanup when app is quitting
app.on('before-quit', () => {
  stopCounterServer();
});

// Handle app termination
process.on('SIGINT', () => {
  stopCounterServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopCounterServer();
  process.exit(0);
});
