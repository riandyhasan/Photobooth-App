const $ = require("jquery");
const Html5QrcodeScanner = require("html5-qrcode").Html5QrcodeScanner;

const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 300 });

scanner.render(onScanSuccess, onScanFailure);

function onScanSuccess(decodedText, decodedResult) {
  console.log(decodedText);
  window.location.href = "../payment/index.html";

  // You can choose to stop scanning after a successful scan
  // scanner.clear();
}

function onScanFailure(error) {
  // console.error(error);
}
