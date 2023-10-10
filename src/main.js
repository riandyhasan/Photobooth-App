const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(__dirname + "/index.html");
  mainWindow.on("closed", () => (mainWindow = null));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
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
