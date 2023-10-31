const $ = require("jquery");
const Html5QrcodeScanner = require("html5-qrcode").Html5QrcodeScanner;

const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 300 });

const modal = document.querySelector("#qr-modal");

scanner.render(onScanSuccess, onScanFailure);

const dashboard = document.querySelector("#reader__dashboard");

modal.querySelector(".modal-content").appendChild(dashboard);

function onScanSuccess(decodedText, decodedResult) {
  console.log(decodedText);
  window.location.href = "../payment/index.html";

  // You can choose to stop scanning after a successful scan
  // scanner.clear();
}

function onScanFailure(error) {
  // console.error(error);
}

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(function (stream) {
    stream.getTracks().forEach((track) => track.stop());
  })
  .catch(function (error) {
    modal.style.display = "block";
    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      console.log("Camera access denied");
    } else if (
      error.name === "NotFoundError" ||
      error.name === "SourceUnavailableError"
    ) {
      console.log("No camera found or the camera is not available");
    } else {
      console.error("Error while checking camera access:", error);
    }
  });
