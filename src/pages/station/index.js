const { Html5Qrcode } = require("html5-qrcode");
const { getPrinters } = require("pdf-to-printer");

const remote = require("@electron/remote");
const dialog = remote.dialog;
const wnd = remote.getCurrentWindow();

const {
  checkStationName,
  createStation,
  openStation,
  closeStation,
} = require("../../services/admin-api");
const { checkPassword } = require("../../services/auth");

let stationName;
let selectedCamera = localStorage.getItem("camera");
let selectedPrinter = localStorage.getItem("printer");
let cameraSelection = "";
let printerSelection = "";

const buttonOpen = document.querySelector("#open");
const buttonStation = document.querySelector("#stationNameButton");
const buttonPassword = document.querySelector("#passwordButton");
const setting = document.querySelector("#setting");
const settingModal = document.querySelector("#setting-modal");
const stationModal = document.querySelector("#station-modal");
const confrimationModal = document.querySelector("#create-station-modal");
const settingPasswordModal = document.querySelector("#setting-password-modal");
const closeSetting = document.querySelector("#close-setting");
const toast = document.querySelector("#toast");
const station = document.querySelector("#stationName");
const stationNameInput = document.querySelector("#stationNameInput");
const passwordInput = document.querySelector("#passwordInput");
const cameraSelect = document.querySelector("#selectCamera");
const printerSelect = document.querySelector("#selectPrinter");
const confirmYes = document.querySelector("#confirmYes");
const confirmNo = document.querySelector("#confirmNo");
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
      icon: '../../assets/images/logo.ico'
    });
    if (choice.response === 0) {
      const stationID = localStorage.getItem("stationID");
      await closeStation(stationID);
      wnd.setClosable(true);
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
  // const printers = await wnd.webContents.getPrintersAsync();
  const printers = await getPrinters();
  if (printers.length > 0) {
    printers.forEach((device) => {
      printerSelection += `<option value="${device.deviceId}">${device.name}</option>`;
    });
    printerSelect.innerHTML = printerSelection;
    printerSelect.value = selectedPrinter;
  }
}

function showToast() {
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function changeBackgroundImage(newImageUrl) {
  if (newImageUrl && newImageUrl != "") {
    document.body.style.setProperty(
      "--background-image-url",
      `url('${newImageUrl}')`
    );
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

async function createNewStation() {
  const stationNameValue = stationNameInput.value;
  if (stationNameValue === "") {
    toast.innerHTML = "Please fill the station name.";
    showToast();
  }
  try {
    const data = {
      name: stationNameValue,
    };
    const response = await createStation(data);
    const dataStation = response.data.station;
    if (dataStation) {
      stationName = stationNameValue;
      localStorage.setItem("station", stationNameValue);
      localStorage.setItem("stationID", dataStation.id);
      stationModal.style.display = "none";
      station.innerHTML = stationNameValue;
      confrimationModal.style.display = "none";
    }
  } catch (e) {
    toast.innerHTML = "Connection error.";
    showToast();
  }
}

async function checkExistingStation() {
  const stationNameValue = stationNameInput.value;
  if (stationNameValue === "") {
    toast.innerHTML = "Please fill the station name.";
    showToast();
  }
  try {
    const response = await checkStationName(stationNameValue);
    const dataStation = response.data.station;
    if (dataStation) {
      stationName = stationNameValue;
      localStorage.setItem("station", stationNameValue);
      localStorage.setItem("stationID", dataStation.id);
      stationModal.style.display = "none";
      station.innerHTML = stationNameValue;
      if (
        dataStation.background_images &&
        dataStation.background_images.length > 0
      ) {
        localStorage.setItem(
          "bg",
          JSON.stringify(dataStation.background_images)
        );
        changeBackgroundImage(dataStation.background_images[0]);
      }
    } else {
      confrimationModal.style.display = "block";
    }
  } catch (e) {
    toast.innerHTML = "Connection error.";
    showToast();
  }
}

if (!stationName) {
  stationModal.style.display = "block";
} else {
  station.innerHTML = stationName;
}

getActiveCamera();
getActivePrinter();

buttonOpen.addEventListener("click", async () => {
  if (!selectedCamera && !selectedPrinter) {
    toast.innerHTML = "You have not configured the camera and printer.";
    showToast();
    return;
  }
  const stationID = localStorage.getItem("stationID");
  const response = await openStation(stationID);
  if (response) {
    window.location.href = "../scan/index.html";
  }
});

setting.addEventListener("click", () => {
  settingPasswordModal.style.display = "block";
});

closeSetting.addEventListener("click", () => {
  settingModal.style.display = "none";
});

buttonStation.addEventListener("click", async () => {
  await checkExistingStation();
});

buttonPassword.addEventListener("click", () => {
  const pass = passwordInput.value;
  openSetting(pass);
});

stationNameInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    await checkExistingStation();
  }
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

confirmYes.addEventListener("click", async () => {
  await createNewStation();
});

confirmNo.addEventListener("click", () => {
  confrimationModal.style.display = "none";
});

minimize.addEventListener("click", () => {
  wnd.minimize();
});

close.addEventListener("click", async () => {
  await confirmClose();
});

closeSettingPasswords.addEventListener("click", () => {
  settingPasswordModal.style.display = "none";
  passwordInput.value = "";
})
