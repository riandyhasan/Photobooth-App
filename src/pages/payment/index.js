const cancel = document.querySelector("#cancel");
const modal = document.querySelector("#payment-modal");
const print = document.querySelector("#print");
const close = document.querySelector("#close");

let slideIndex = 1;
showSlides(1);
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

cancel.addEventListener("click", () => {
  window.location.href = "../scan/index.html";
});

print.addEventListener("click", () => {
  modal.classList.add("show");
});

close.addEventListener("click", () => {
  modal.classList.remove("show");
});
