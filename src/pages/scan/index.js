const $ = require("jquery");
const Html5QrcodeScanner = require("html5-qrcode").Html5QrcodeScanner;

const close = document.querySelector("#close");

const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 300 });

const modal = document.querySelector("#qr-modal");

scanner.render(onScanSuccess, onScanFailure);

const dashboard = document.querySelector("#reader__dashboard");

modal.querySelector(".modal-content").appendChild(dashboard);

function onScanSuccess(decodedText, decodedResult) {
  window.location.href = "../payment/index.html";

  // You can choose to stop scanning after a successful scan
  // scanner.clear();
}

function onScanFailure(error) {
  // console.error(error);
}

close.addEventListener("click", () => {
  modal.style.display = "none";
});
