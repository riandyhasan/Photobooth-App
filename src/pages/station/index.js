const { Html5Qrcode } = require("html5-qrcode");
var Printer = require("zuzel-printer");

let stationName;
let selectedCamera = localStorage.getItem("camera");
let cameraSelection = "";

const buttonOpen = document.querySelector("#open");
const buttonStation = document.querySelector("#stationNameButton");
const setting = document.querySelector("#setting");
const settingModal = document.querySelector("#setting-modal");
const stationModal = document.querySelector("#station-modal");
const closeSetting = document.querySelector("#close-setting");
const toast = document.querySelector("#toast");
const station = document.querySelector("#stationName");
const stationNameInput = document.querySelector("#stationNameInput");
const cameraSelect = document.querySelector("#selectCamera");

async function getActiveCamera() {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length > 0) {
      devices.map((device) => {
        cameraSelection += `<option value="${device.id}">${device.label}</option>`;
      });
    }
    cameraSelect.innerHTML = cameraSelection;
  } catch (e) {
    toast.innerHTML = "Please allow the camera access";
    showToast();
  }
}

function getActivePrinter() {
  const printers = Printer.list();
  console.log(printers);
}

function showToast() {
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

if (!stationName) {
  stationModal.style.display = "block";
} else {
  station.innerHTML = stationName;
}

getActiveCamera();
getActivePrinter();

buttonOpen.addEventListener("click", () => {
  console.log(selectedCamera);
  if (!selectedCamera) {
    toast.innerHTML = "You have not configured the camera and printer.";
    showToast();
    return;
  }
  window.location.href = "../scan/index.html";
});

setting.addEventListener("click", () => {
  settingModal.style.display = "block";
});

closeSetting.addEventListener("click", () => {
  settingModal.style.display = "none";
});

buttonStation.addEventListener("click", () => {
  const stationNameValue = stationNameInput.value;
  if (stationNameValue == "") {
    toast.innerHTML = "Please fill the station name.";
    showToast();
    return;
  }
  stationName = stationNameValue;
  localStorage.setItem("station", stationNameValue);
  stationModal.style.display = "none";
  station.innerHTML = stationNameValue;
});

stationNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const stationNameValue = stationNameInput.value;
    if (stationNameValue === "") {
      toast.innerHTML = "Please fill the station name.";
      showToast();
    } else {
      stationName = stationNameValue;
      localStorage.setItem("station", stationNameValue);
      stationModal.style.display = "none";
      station.innerHTML = stationNameValue;
    }
  }
});

cameraSelect.addEventListener("change", (event) => {
  selectedCamera = event.target.value;
  localStorage.setItem("camera", selectedCamera);
});
