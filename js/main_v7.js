// Particle fade-in
const sections = document.querySelectorAll('section');
const buttons = document.querySelectorAll('.hero-content .buttons button');

// Na začátku zobrazíme "join" sekci
document.getElementById('join').classList.add('active');

// Přepínání sekcí přes tlačítka
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-section');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Fade-in sekce při scrollu (pro jiné sekce)
window.addEventListener('scroll', () => {
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if(top < window.innerHeight - 100) {
      section.style.opacity = 1;
      section.style.transform = 'translateY(0)';
    }
  });
});
