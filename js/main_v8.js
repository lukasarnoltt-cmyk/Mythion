document.addEventListener("DOMContentLoaded", function () {

  // ====== PŘEPÍNÁNÍ SEKCÍ ======
  const buttons = document.querySelectorAll("[data-target]");
  const sections = document.querySelectorAll(".content-section");

  // výchozí sekce
  const defaultSection = document.getElementById("join");
  if (defaultSection) {
    defaultSection.classList.add("active");
  }

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      const target = this.getAttribute("data-target");

   sections.forEach(section => {
  section.classList.remove("active");
});

setTimeout(() => {
  const activeSection = document.getElementById(target);
  if (activeSection) {
    activeSection.classList.add("active");
  }
}, 200);

      const activeSection = document.getElementById(target);
      if (activeSection) {
        activeSection.classList.add("active");
      }

      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth"
      });
    });
  });

  // ====== PARTICLES ======
  const particlesContainer = document.querySelector(".particles");

  if (particlesContainer) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.classList.add("particle");
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = (5 + Math.random() * 10) + "s";
      p.style.animationDelay = Math.random() * 5 + "s";
      particlesContainer.appendChild(p);
    }
  }

  // ====== NAVBAR GLOW ======
  window.addEventListener("scroll", () => {
    const nav = document.querySelector(".navbar");
    if (nav) {
      if (window.scrollY > 50) {
        nav.style.boxShadow = "0 0 20px rgba(255,215,0,0.5)";
      } else {
        nav.style.boxShadow = "none";
      }
    }
  });

});
const flash = document.querySelector(".section-flash");
flash.classList.add("active");

setTimeout(() => {
  flash.classList.remove("active");
}, 300);
const counters = document.querySelectorAll('.counter');

counters.forEach(counter => {
  const updateCount = () => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const increment = target / 100;

    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      setTimeout(updateCount, 20);
    } else {
      counter.innerText = target;
    }
  };

  updateCount();
});
document.addEventListener('DOMContentLoaded', () => {
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.raid-progress p');

  let width = 0;
  const target = 75; // cílové %
  const interval = setInterval(() => {
    if(width >= target){
      clearInterval(interval);
    } else {
      width++;
      progressFill.style.width = width + '%';
      progressText.textContent = width + '% Vyčištěno';
    }
  }, 20); // rychlost animace
});
document.addEventListener("DOMContentLoaded", () => {
  const progressFill = document.querySelector(".progress-fill");
  const progressNumber = document.getElementById("progress-number");

  let progress = 0;
  const target = 0; // zatím 0%

  const interval = setInterval(() => {
    if (progress >= target) {
      clearInterval(interval);
    } else {
      progress++;
      progressFill.style.width = progress + "%";
      progressNumber.textContent = progress;
    }
  }, 20);
});
document.addEventListener("DOMContentLoaded", () => {

  animateProgress("normal", "normal-number", 0);   // změň číslo podle progresu
  animateProgress("heroic", "heroic-number", 0);
  animateProgress("mythic", "mythic-number", 0);

});

function animateProgress(className, numberId, target) {
  const bar = document.querySelector("." + className);
  const number = document.getElementById(numberId);

  let progress = 0;

  const interval = setInterval(() => {
    if (progress >= target) {
      clearInterval(interval);
    } else {
      progress++;
      bar.style.width = progress + "%";
      number.textContent = progress;
    }
  }, 20);
}
