const { app, BrowserWindow, dialog, ipcMain, protocol } = require('electron');
const path = require('path');
const { URL } = require('url');
const fs = require('fs');

// Determinar si estamos en desarrollo
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false
  });

  // Manejar la carga de la aplicación
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar desde el mismo directorio
    const indexPath = path.join(__dirname, 'index.html');
    console.log('Loading from:', indexPath);
    
    // Verificar que el archivo existe
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error('Index file not found:', indexPath);
      console.log('__dirname is:', __dirname);
      console.log('Files in __dirname:', fs.readdirSync(__dirname));
      // Fallback: crear HTML básico
      mainWindow.loadURL(`data:text/html;charset=utf-8,<html><body><h1>Error: No se pudo cargar la aplicación</h1><p>Archivo no encontrado: ${indexPath}</p><p>__dirname: ${__dirname}</p></body></html>`);
    }
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Debug en caso de errores
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Más debug
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
    // No abrir DevTools en producción
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('Console:', message);
  });
}

// Manejo de diálogos de archivos
ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog({
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  });
  return result;
});

ipcMain.handle('select-signature-image', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }
    ]
  });
  return result;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});