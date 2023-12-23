const { app, BrowserWindow, ipcMain, dialog, screen } = require("electron");
require("@electron/remote/main").initialize();
const path = require("path");


function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width,
    height,
    autoHideMenuBar: true,
    frame: false,
    icon: path.join(__dirname, '/assets/images/logo.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  require("@electron/remote/main").enable(mainWindow.webContents);

  mainWindow.loadFile(__dirname + "/pages/station/index.html");
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on("closed", (e) => {
  if (process.platform !== "darwin") {
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("open-file-dialog", (event) => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
    })
    .then((files) => {
      if (files) event.sender.send("selected-file", files.filePaths[0]);
    });
});
