const {
  getTransactionDetail,
  getDiscountDetail,
} = require("../../services/api.js");

const cancel = document.querySelector("#cancel");
const modal = document.querySelector("#payment-modal");
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
const params = new URLSearchParams(location.search);
const transaction = params.get("transaction");
let slideIndex = 1;

if (!transaction) {
  noDataToast();
}

function noDataToast() {
  toast.innerHTML = "Data not found.";
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
    window.location.href = `../scan/index.html`;
  }, 1200);
}

function showToast() {
  toast.className = "show";

  setTimeout(function () {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function formatRupiah(number) {
  let strNumber = number.toString();

  let parts = strNumber.split(".");
  let integerPart = parts[0];

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  let result = "Rp" + integerPart;

  return result;
}

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let slides = document.getElementsByClassName("mySlides");
  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
    slides[i].classList.remove("second");
    slides[i].classList.remove("fade");
    slides[i].classList.remove("fade-second");
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
  slides[slideIndex - 1].classList.add("active");
  slides[slideIndex - 1].classList.add("fade");
  slides[next - 1].classList.add("second");
  slides[next - 1].classList.add("fade-second");
}

async function loadPayment() {
  try {
    const data = await getTransactionDetail(transaction);
    if (!data) {
      noDataToast();
    }
    userName.innerHTML = "Hi, " + data.transaction.user_name;
    subtotal.innerHTML = formatRupiah(data.transaction.total);
    quantity.innerHTML = data.transaction.quantity + " Pax";
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
    total.innerHTML = "<b>" + formatRupiah(paymentTotal);
    +"</b>";
    showSlides(1);
  } catch (e) {
    noDataToast();
  } finally {
    loader.style.display = "none";
  }
}

loadPayment();

cancel.addEventListener("click", () => {
  window.location.href = "../scan/index.html";
});

print.addEventListener("click", () => {
  modal.classList.add("show");
});

close.addEventListener("click", () => {
  modal.classList.remove("show");
});
