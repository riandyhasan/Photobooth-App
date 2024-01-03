const fs = require('fs')
const pdfPrint = require("pdf-to-printer").print;

const {
  getTransactionDetail,
  getDiscountDetail,
  getPromoByCode,
  updateStatusTransaction,
} = require("../../services/api.js");
const { getStationById, printPaper } = require("../../services/admin-api.js");
const initDrive = require("../../services/google.js");
const {
  createInvoice,
  generateQR,
  checkStatus,
} = require("../../services/qris.js");

// Electron
const remote = require("@electron/remote");
const BrowserWindow = remote.BrowserWindow;

// DOM manipulation
const slide = document.querySelector("#slide");
const merch = document.querySelector("#merch-images");
const next = document.querySelector("#next");
const qr = document.querySelector("#qr-code");
const cancel = document.querySelector("#cancel");
const modal = document.querySelector("#payment-modal");
const printing = document.querySelector("#printing-modal");
const ty = document.querySelector("#ty-modal");
const print = document.querySelector("#print");
const close = document.querySelector("#close");
const loader = document.querySelector("#loader");
const toast = document.querySelector("#toast");
const userName = document.querySelector("#user_name");
const quantity = document.querySelector("#quantity");
const subtotal = document.querySelector("#subtotal");
const discount = document.querySelector("#discount");
const discountContainer = document.querySelector("#discount-container");
const couponNominal = document.querySelector("#coupon-nominal");
const specialPrice = document.querySelector("#special-price");
const total = document.querySelector("#total");
const couponCode = document.querySelector("#coupon");
const apply = document.querySelector("#apply-code");
const loadingMsg = document.querySelector("#loading-msg");
const slideNumber = document.querySelector("#slide-number");

// Global constants
const params = new URLSearchParams(location.search);
const transaction = params.get("transaction");
const bgImages = localStorage.getItem("bg");

// Global variables
let name = '';
let slideIndex = 1;
let isUseCode = false;
let paymentQr;
let qrImage;
let totalPayment = 0;
let paymentStatus = "unpaid";
let discountId = [];
let photos = [];
let printQt = 1;
let totalImages = 0;

if (!transaction) {
  noDataToast();
}

function changeBackgroundImage(newImageUrl) {
  if (newImageUrl && newImageUrl != "") {
    document.body.style.setProperty(
      "--background-image-url",
      `url('${newImageUrl}')`
    );
  }
}

function generateSlideImage(src) {
  return `
    <div class="mySlides fade">
      <img src="data:image/jpeg;base64,${src}" style="width:100%">
  </div>
  `;
}

function codeIsInvalid() {
  toast.innerHTML = "Code is invalid.";
  toast.className = "show";
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 1200);
}

function paymentFailed() {
  toast.innerHTML = "Payment failed, please contact admin.";
  toast.className = "show";
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 1200);
}

function printFailed() {
  toast.innerHTML = "Printing failed, please contact admin.";
  toast.className = "show";
  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 1200);
}


function noDataToast() {
  toast.innerHTML = "Data not found.";
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
    // window.location.href = `../scan/index.html`;
  }, 1200);
}

function showToast() {
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function parseRupiahString(rupiahString) {
  // Remove "Rp" and any thousands separators
  const cleanedString = rupiahString.replace(/[^\d]/g, "");

  // Convert the cleaned string to a number
  const numberValue = parseFloat(cleanedString);

  return numberValue;
}

function formatRupiah(number) {
  let strNumber = number.toString();

  let parts = strNumber.split(".");
  let integerPart = parts[0];

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  let result = "Rp" + integerPart;

  return result;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlideNumber(idx) {
  let numbers = ``;
  let start = Math.max(idx - 1, 0);
  let end = Math.min(idx + 1, totalImages - 1);

  for (let i = start; i <= end; i++) {
    numbers += `
    <div class="${i === idx ? "active-number" : "non-active-number"}">
      ${i + 1}
    </div>
    `;
  }
  slideNumber.innerHTML = numbers;
}


function showSlides(n) {
  let slides = document.getElementsByClassName("mySlides");
  if (slides.length > 0) {
    for (let i = 0; i < slides.length; i++) {
      slides[i].classList.remove("active");
      slides[i].classList.remove("second");
      slides[i].classList.remove("slide-left");
    }
    if (n > slides.length) {
      slideIndex = 1;
    } else {
      slideIndex = n;
    }
    let next = slideIndex + 1;
    if (next > slides.length) {
      next = 1;
    }
    showSlideNumber(slideIndex - 1);
    slides[slideIndex - 1].classList.add("active");
    slides[slideIndex - 1].classList.add("slide-left");
    if (slides.length > 1) {
      slides[next - 1].classList.add("second");
    }
  }
}

async function loadMerch() {
  const stationID = localStorage.getItem("stationID");
  if (!stationID) {
    return;
  }
  try {
    const data = await getStationById(stationID);
    const dataStation =  data.data.station;
    if (dataStation) {
      if (dataStation.merch_images && dataStation.merch_images.length > 0) {
        let innerMerch = '';
        for (const image of dataStation.merch_images) {
          innerMerch +=  `<img src="${image}" />`;
        }
        merch.innerHTML = innerMerch;
      }
    }
  } catch(e){

  }
}

async function loadPayment() {
  try {
    const data = await getTransactionDetail(transaction);
    if (!data) {
      noDataToast();
    }
    userName.innerHTML = "Hi, " + data.transaction.user_name;
    name = data.transaction.user_name;
    subtotal.innerHTML = formatRupiah(data.transaction.total);
    quantity.innerHTML = data.transaction.quantity + " Pax";
    printQt = data?.transaction?.quantity ?? 1;
    let discTotal = 0;
    if (data?.transaction?.discount_id) {
      const discountData = await getDiscountDetail(
        data.transaction.discount_id
      );
      if (discountData) {
        const today = new Date();
        const expired = new Date(discountData.endDate);
        if (
          data.transaction.total >= discountData.min_transaction &&
          today > expired
        ) {
          discountId.push(discountData.id);
          if (discountData.is_fixed) discTotal = discountData.value;
          else discTotal = data.transaction.total * (discountData.value / 100);
          discountContainer.style.display = "flex";
          discount.innerHTML = "- " + formatRupiah(discTotal);
        }
      }
    }
    const paymentTotal =
      data.transaction.total - discTotal < 0
        ? 0
        : data.transaction.total - discTotal;
    totalPayment = paymentTotal;
    total.innerHTML = "<b>" + formatRupiah(paymentTotal);
    +"</b>";
    specialPrice.innerHTML = `
    <div class="price-text">Special Price</div>
    <div class="price">${formatRupiah(paymentTotal)}</div>
    `;
    const { downloadFileAsBlob } = await initDrive();
    const prints = data?.prints ?? [];
    const pl = prints?.length ?? 0;
    if (pl == 1) {
      const content = document.querySelector("#content");
      content.classList.add("one-slide");
      slideNumber.classList.add("one-number");
    }
    totalImages = pl;
    if (pl < 2) {
      next.style.display = "none";
    }
    for (let idx = 0; idx < pl; idx++) {
      const image = await downloadFileAsBlob(prints[idx]["drive_id"]);
      slide.innerHTML += generateSlideImage(image);
      photos.push(`data:image/png;base64,${image}`);
    }
    showSlides(1);
  } catch (e) {
    noDataToast();
    console.log(e);
  } finally {
    loader.style.display = "none";
  }
}

async function getDiscountByCode(code) {
  try {
    const discount = await getPromoByCode(code);
    return discount;
  } catch (e) {
    codeIsInvalid();
  } finally {
    loader.style.display = "none";
  }
}

async function getPayment() {
  try {
    const qrisData = await createInvoice(transaction, 1);
    return qrisData;
  } catch (e) {
    paymentFailed();
  } finally {
  }
}

async function updateTransaction() {
  try {
    let promoCode = null;
    if (couponCode.value && couponCode.value !== "" && isUseCode){
      promoCode = couponCode.value;
    }
    const req = {
      transactionId: transaction,
      total: totalPayment,
      discountId,
      status: "PAID",
      promoCode
    };
    const updateStatus = await updateStatusTransaction(req);
    if (updateStatus) {
      modal.classList.remove("show");
      printing.classList.add("show");
      await printPhoto();
    }
  } catch (e) {
  } finally {
    loader.style.display = "none";
  }
}

async function paymentCheck() {
  try {
    if (paymentQr) {
      const reqDate = new Date(paymentQr.qris_request_date);
      const formattedDate = formatDate(reqDate);
      loader.style.display = "none";
      const status = await checkStatus(
        paymentQr.qris_invoiceid,
        1,
        formattedDate
      );
      if (status.status == "success" && status.data.qris_status == "paid") {
        paymentStatus = "paid";
      }
    }
  } catch (e) {
    paymentFailed();
  } finally {
    loader.style.display = "none";
  }
}

async function scheduleChecks() {
  let checksPerformed = 0;
  let interval = 15000; // Start with a 15-second interval

  const checkAndReschedule = async () => {
    await paymentCheck();
    if (paymentStatus == "paid") {
      await updateTransaction();
      return;
    }
    checksPerformed++;

    if (checksPerformed === 3) {
      interval = 30000;
    } else if (checksPerformed === 4) {
      interval = 45000;
    } else if (checksPerformed > 3) {
      interval = 70000;
    }

    if (checksPerformed < 30) {
      setTimeout(checkAndReschedule, interval);
    } else {
      console.log("Maximum number of checks reached.");
    }
  };

  // Start the first check
  setTimeout(checkAndReschedule, interval);
}

async function printPhoto() {
  try {
    const printerName = localStorage.getItem("printer");
    const base64Image = photos[slideIndex - 1];

    let printWindow = new BrowserWindow({
      width: 400,
      height: 600,
      show: false,
    });

    const htmlContent = `data:text/html;charset=utf-8,<head> 
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> 
    <title>Milio Photobooth</title> 
    <style type="text/css">
    @page {
      size: 4in 6in; /* Set the page size to 4x6 inches */
      margin: 0;
      width: 4in;
      height: 6in;
    }
    img {
      page-break-before: always;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
  </style>
    </head> 
    <body style="margin: 0; padding: 0;">
    <img style="margin: 0; padding: 0;" src="${base64Image}" />
    </body>`;

    await printWindow.loadURL(htmlContent);
    const pdfPath = './temp.pdf';
    const pdfData = await printWindow.webContents.printToPDF({preferCSSPageSize: true});
    await fs.promises.writeFile(pdfPath, pdfData);
    console.log(`Wrote PDF successfully to ${pdfPath}`);

    const options = {
      printer: printerName,
      paperSize: "PR (4x6)",
      silent: true,
      copies: printQt
    };
    // Print photo
    await pdfPrint(pdfPath, options);

    // Update in the 
    const stationID = localStorage.getItem("stationID");
    await printPaper(stationID, printQt);

    // Add waiting time
    const printingTime = 20000 * printQt;
    await new Promise(resolve => setTimeout(resolve, printingTime));

    await fs.promises.unlink(pdfPath);
    printing.classList.remove("show");

    // Thank you message
    const userTy = document.querySelector("#ty-name");
    userTy.innerHTML = name;
    ty.classList.add("show");

    await new Promise(resolve => setTimeout(resolve, 3000));

    window.location.href = `../scan/index.html`;
  } catch (err) {
    console.log(err);
    printFailed();
    printing.classList.remove("show");
  }
}

loadPayment();
loadMerch();

if (bgImages) {
  const bg = JSON.parse(bgImages);
  if (bg.length > 2) {
    changeBackgroundImage(bg[2]);
  }
}
couponCode.addEventListener("keyup", async (event) => {
  if (event.key === "Enter" || event.keyCode === 13) {
    const code = couponCode.value;
    const discountData = await getDiscountByCode(couponCode.value);
    if (discountData) {
      const subtotalValue = parseRupiahString(subtotal.innerHTML);
      const totalPay = parseRupiahString(total.innerHTML);
      if (
        subtotalValue >= discountData.min_transaction &&
        !code.includes(discountData.used_codes)
      ) {
        let totalDisc = 0;
        if (discountData.is_fixed) totalDisc = discountData.value;
        else totalDisc = totalPay * (discountData.value / 100);
        totalPayment = totalPay - totalDisc < 0 ? 0 : totalPay - totalDisc < 0;
        discountContainer.style.display = "flex";
        couponNominal.innerHTML = "- " + formatRupiah(totalDisc);
        specialPrice.innerHTML = `
        <div class="price-text">Special Price</div>
        <div class="price">${formatRupiah(total)}</div>
        `;
        specialPrice.style.display = "block";
        discountId.push(discountData.id);
      }
    } else {
      codeIsInvalid();
    }
  }
});

apply.addEventListener("click", async () => {
  const code = couponCode.value;
  const discountData = await getDiscountByCode(couponCode.value);
  if (discountData) {
    if (
      subtotalValue >= discountData.min_transaction &&
      !code.includes(discountData.used_codes)
    ) {
      let totalDisc = 0;
      if (discountData.is_fixed) totalDisc = discountData.value;
      else totalDisc = totalPay * (discountData.value / 100);
      totalPayment = totalPay - totalDisc < 0 ? 0 : totalPay - totalDisc < 0;
      discountContainer.style.display = "flex";
      couponNominal.innerHTML = "- " + formatRupiah(totalDisc);
      specialPrice.innerHTML = `
      <div class="price-text">Special Price</div>
      <div class="price">${formatRupiah(total)}</div>
      `;
      specialPrice.style.display = "block";
      discountId.push(discountData.id);
      isUseCode = true;
    }
  } else {
    codeIsInvalid();
  }
});

cancel.addEventListener("click", () => {
  window.location.href = "../scan/index.html";
});

print.addEventListener("click", async () => {
  if (!paymentQr) {
    loadingMsg.innerHTML = 'Preparing your payment';
    loader.style.display = "flex";
    const data = await getPayment();
    if (!data) {
      return;
    }
    paymentQr = data;
    qrImage = await generateQR(data.qris_content);
    loader.style.display = "none";
    await scheduleChecks();
  }
  qr.innerHTML = `<img src="${qrImage}" />`;
  modal.classList.add("show");
});

close.addEventListener("click", () => {
  modal.classList.remove("show");
});