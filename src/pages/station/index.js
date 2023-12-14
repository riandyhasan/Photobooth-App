const { Html5Qrcode } = require('html5-qrcode');
const remote = require('@electron/remote');
const BrowserWindow = remote.BrowserWindow;
const wnd = remote.getCurrentWindow();

const { checkStationName, createStation, openStation } = require('../../services/admin-api');
let stationName;
let selectedCamera = localStorage.getItem('camera');
let selectedPrinter = localStorage.getItem('printer');
let cameraSelection = '';
let printerSelection = '';

const buttonOpen = document.querySelector('#open');
const buttonStation = document.querySelector('#stationNameButton');
const setting = document.querySelector('#setting');
const settingModal = document.querySelector('#setting-modal');
const stationModal = document.querySelector('#station-modal');
const confrimationModal = document.querySelector('#create-station-modal');
const closeSetting = document.querySelector('#close-setting');
const toast = document.querySelector('#toast');
const station = document.querySelector('#stationName');
const stationNameInput = document.querySelector('#stationNameInput');
const cameraSelect = document.querySelector('#selectCamera');
const printerSelect = document.querySelector('#selectPrinter');
const confirmYes = document.querySelector('#confirmYes');
const confirmNo = document.querySelector('#confirmNo');

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
    toast.innerHTML = 'Please allow the camera access';
    showToast();
  }
}

async function getActivePrinter() {
  const printers = await wnd.webContents.getPrintersAsync();
  console.log(printers);
  if (printers.length > 0) {
    let printerSelection = '';
    printers.forEach((device) => {
      printerSelection += `<option value="${device.name}">${device.displayName}</option>`;
    });
    printerSelect.innerHTML = printerSelection;
    printerSelect.value = selectedPrinter;
  }
}

function showToast() {
  toast.className = 'show';

  setTimeout(function () {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

function changeBackgroundImage(newImageUrl) {
  document.body.style.setProperty('--background-image-url', `url('${newImageUrl}')`);
}

async function createNewStation() {
  const stationNameValue = stationNameInput.value;
  if (stationNameValue === '') {
    toast.innerHTML = 'Please fill the station name.';
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
      localStorage.setItem('station', stationNameValue);
      localStorage.setItem('stationID', dataStation.id);
      stationModal.style.display = 'none';
      station.innerHTML = stationNameValue;
      confrimationModal.style.display = 'none';
    }
  } catch (e) {
    toast.innerHTML = 'Connection error.';
    showToast();
  }
}

async function checkExistingStation() {
  const stationNameValue = stationNameInput.value;
  if (stationNameValue === '') {
    toast.innerHTML = 'Please fill the station name.';
    showToast();
  }
  try {
    const response = await checkStationName(stationNameValue);
    const dataStation = response.data.station;
    if (dataStation) {
      stationName = stationNameValue;
      localStorage.setItem('station', stationNameValue);
      localStorage.setItem('stationID', dataStation.id);
      stationModal.style.display = 'none';
      station.innerHTML = stationNameValue;
      if (dataStation.background_images && dataStation.background_images.length > 0) {
        localStorage.setItem('bg', JSON.stringify(dataStation.background_images));
        changeBackgroundImage(dataStation.background_images[0]);
      }
    } else {
      confrimationModal.style.display = 'block';
    }
  } catch (e) {
    toast.innerHTML = 'Connection error.';
    showToast();
  }
}

if (!stationName) {
  stationModal.style.display = 'block';
} else {
  station.innerHTML = stationName;
}

getActiveCamera();
getActivePrinter();

buttonOpen.addEventListener('click', async () => {
  if (!selectedCamera || !selectedPrinter) {
    toast.innerHTML = 'You have not configured the camera and printer.';
    showToast();
    return;
  }
  const stationID = localStorage.getItem('stationID');
  const response = await openStation(stationID);
  if (response) {
    window.location.href = '../scan/index.html';
  }
});

setting.addEventListener('click', () => {
  settingModal.style.display = 'block';
});

closeSetting.addEventListener('click', () => {
  settingModal.style.display = 'none';
});

buttonStation.addEventListener('click', async () => {
  await checkExistingStation();
});

stationNameInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    await checkExistingStation();
  }
});

cameraSelect.addEventListener('change', (event) => {
  selectedCamera = event.target.value;
  localStorage.setItem('camera', selectedCamera);
});

printerSelect.addEventListener('change', async (event) => {
  selectedPrinter = event.target.value;
  localStorage.setItem('printer', selectedPrinter);
});

confirmYes.addEventListener('click', async () => {
  await createNewStation();
});

confirmNo.addEventListener('click', () => {
  confrimationModal.style.display = 'none';
});
