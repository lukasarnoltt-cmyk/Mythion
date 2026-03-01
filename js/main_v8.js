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
