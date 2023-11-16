const { Html5QrcodeScanType, Html5Qrcode } = require("html5-qrcode");
let config = {
  fps: 10,
  qrbox: { width: 350, height: 350 },
  rememberLastUsedCamera: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
};
let selectedCamera = localStorage.getItem("camera");
let scanner = new Html5Qrcode("reader");
const toast = document.querySelector("#toast");
const loader = document.querySelector("#loader");
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
