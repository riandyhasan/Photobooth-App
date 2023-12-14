const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
require('@electron/remote/main').initialize();
const path = require('path');
const { closeStation } = require('./services/admin-api');

let mainWindow;

async function confirmClose(e) {
  dialog
    .showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirmation',
      message: 'Are you sure you want to close the application?',
    })
    .then(async (result) => {
      if (result.response === 0) {
        const stationID = await mainWindow.webContents.executeJavaScript("localStorage.getItem('stationID');");
        await closeStation(stationID);
        mainWindow = null;
      } else e.preventDefault();
    })
    .catch((error) => {
      console.error('Error showing message box:', error.message);
    });
  // mainWindow = null;
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width,
    height,
    autoHideMenuBar: true,
    frame: true,
    icon: './src/assets/images/logo.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  require('@electron/remote/main').enable(mainWindow.webContents);

  mainWindow.loadFile(__dirname + '/pages/station/index.html');
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('closed', (e) => {
    confirmClose(e);
  });
}

app.whenReady().then(createWindow);

app.on('closed', (e) => {
  if (process.platform !== 'darwin') {
    confirmClose(e);
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('open-file-dialog', (event) => {
  dialog
    .showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
    })
    .then((files) => {
      if (files) event.sender.send('selected-file', files.filePaths[0]);
    });
});
