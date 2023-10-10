const $ = require("jquery");
const Html5QrcodeScanner = require("html5-qrcode").Html5QrcodeScanner;

const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

$("#start-btn").on("click", () => {
  scanner.render(onScanSuccess, onScanFailure);
});

function onScanSuccess(decodedText, decodedResult) {
  $("#result").text(decodedText);
  // You can choose to stop scanning after a successful scan
  // scanner.clear();
}

function onScanFailure(error) {
  console.error(error);
}
