// Slider
const slides = document.querySelector('.slides');
const slide = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
let index = 0;

function showSlide(i) {
  if (i >= slide.length) index = 0;
  else if (i < 0) index = slide.length - 1;
  else index = i;
  slides.style.transform = `translateX(${-index * 100}%)`;
}

nextBtn.addEventListener('click', () => {
  index++;
  showSlide(index);
});

prevBtn.addEventListener('click', () => {
  index--;
  showSlide(index);
});

setInterval(() => {
  index++;
  showSlide(index);
}, 5000);

// Side Menu Toggle
const sideMenu = document.getElementById("side-menu");
const menuToggle = document.getElementById("menu-toggle");
const closeMenu = document.getElementById("close-menu");

menuToggle.addEventListener("click", () => {
  sideMenu.style.width = "250px";
});

closeMenu.addEventListener("click", () => {
  sideMenu.style.width = "0";
});

// Optional: Close menu when clicking outside
document.addEventListener("click", (event) => {
  if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
    sideMenu.style.width = "0";
  }
});
