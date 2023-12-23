const { Html5QrcodeScanType, Html5Qrcode } = require("html5-qrcode");
const {
  closeStation,
} = require("../../services/admin-api");
const { checkPassword } = require("../../services/auth");

// Electron
const remote = require("@electron/remote");
const dialog = remote.dialog;
const wnd = remote.getCurrentWindow();

// Scanner
let config = {
  fps: 10,
  qrbox: { width: 350, height: 350 },
  rememberLastUsedCamera: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
};
let scanner = new Html5Qrcode("reader");

// Camera and printer
let selectedCamera = localStorage.getItem("camera");
let selectedPrinter = localStorage.getItem("printer");
let cameraSelection = "";
let printerSelection = "";

const toast = document.querySelector("#toast");
const loader = document.querySelector("#loader");
const bgImages = localStorage.getItem("bg");

//Settings
const buttonPassword = document.querySelector("#passwordButton");
const setting = document.querySelector("#setting");
const settingModal = document.querySelector("#setting-modal");
const settingPasswordModal = document.querySelector("#setting-password-modal");
const closeSetting = document.querySelector("#close-setting");
const passwordInput = document.querySelector("#passwordInput");
const cameraSelect = document.querySelector("#selectCamera");
const printerSelect = document.querySelector("#selectPrinter");
const minimize = document.querySelector("#minimize");
const close = document.querySelector("#close");
const closeSettingPasswords = document.querySelector("#close-setting-password");

async function confirmClose() {
  try {
    const choice = await dialog.showMessageBox(wnd, {
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirmation",
      message: "Are you sure you want to close the application?",
    });
    if (choice.response === 0) {
      const stationID = localStorage.getItem("stationID");
      await closeStation(stationID);
      wnd.close();
    }
  } catch (e) {
    console.error(e);
  }
}

async function getActiveCamera() {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length > 0) {
      devices.map((device) => {
        cameraSelection += `<option value="${device.id}">${device.label}</option>`;
      });
    }
    cameraSelect.innerHTML = cameraSelection;
    cameraSelect.value = selectedCamera;
  } catch (e) {
    toast.innerHTML = "Please allow the camera access";
    showToast();
  }
}

async function getActivePrinter() {
  const printers = await wnd.webContents.getPrintersAsync();
  if (printers.length > 0) {
    printers.forEach((device) => {
      printerSelection += `<option value="${device.name}">${device.displayName}</option>`;
    });
    printerSelect.innerHTML = printerSelection;
    printerSelect.value = selectedPrinter;
  }
}

function openSetting(password) {
  const isAuth = checkPassword(password);
  if (isAuth){
    settingModal.style.display = "block";
    settingPasswordModal.style.display = "none";
    passwordInput.value = "";
  } else {
    toast.innerHTML = "Wrong password.";
    showToast();
  }
}
function changeBackgroundImage(newImageUrl) {
  if (newImageUrl && newImageUrl != "") {
    document.body.style.setProperty(
      "--background-image-url",
      `url('${newImageUrl}')`
    );
  }
}

async function loadScanner() {
  try {
    if (!selectedCamera) {
      window.location.href = `../station/index.html`;
    }
    await scanner.start(selectedCamera, config, onScanSuccess, onScanFailure);
  } catch (e) {
    console.log(e);
    // window.location.href = `../station/index.html`;
  }
}

function showToast() {
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function onScanSuccess(decodedText, decodedResult) {
  console.log(decodedText);
  if (decodedText && decodedText != "") {
    window.location.href = `../payment/index.html?transaction=${decodedText}`;
  } else {
    showToast();
  }
}

function onScanFailure(error) {}

loadScanner();
getActiveCamera();
getActivePrinter();

if (bgImages) {
  const bg = JSON.parse(bgImages);
  if (bg.length > 1) {
    changeBackgroundImage(bg[1]);
  }
}

setting.addEventListener("click", () => {
  settingPasswordModal.style.display = "block";
});

closeSetting.addEventListener("click", () => {
  settingModal.style.display = "none";
});

closeSettingPasswords.addEventListener("click", () => {
  settingPasswordModal.style.display = "none";
  passwordInput.value = "";
})

buttonPassword.addEventListener("click", () => {
  const pass = passwordInput.value;
  openSetting(pass);
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    openSetting(event.target.value);
  }
});

cameraSelect.addEventListener("change", (event) => {
  selectedCamera = event.target.value;
  localStorage.setItem("camera", selectedCamera);
});

printerSelect.addEventListener("change", async (event) => {
  selectedPrinter = event.target.value;
  localStorage.setItem("printer", selectedPrinter);
});

minimize.addEventListener("click", () => {
  wnd.minimize();
});

close.addEventListener("click", async () => {
  await confirmClose();
});
