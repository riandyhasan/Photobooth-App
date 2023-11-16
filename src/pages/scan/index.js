const $ = require("jquery");
const Html5QrcodeScanner = require("html5-qrcode").Html5QrcodeScanner;

const close = document.querySelector("#close");

const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 300 });

const modal = document.querySelector("#qr-modal");

const toast = document.querySelector("#toast");

scanner.render(onScanSuccess, onScanFailure);

const dashboard = document.querySelector("#reader__dashboard");

modal.querySelector(".modal-content").appendChild(dashboard);

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

close.addEventListener("click", () => {
  modal.style.display = "none";
});

console.log(scanner.getState());
