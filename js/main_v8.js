// Fade-in a přepínání sekcí
const sections = document.querySelectorAll('section.tab-section');
const buttons = document.querySelectorAll('.hero-content .buttons button');

// Zobrazíme Join na začátku
document.getElementById('join').classList.add('active');

// Přepínání sekcí
buttons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const target = btn.getAttribute('data-section');
    sections.forEach(sec=>sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

// Fade-in při scrollu
window.addEventListener('scroll',()=>{
  sections.forEach(section=>{
    const top = section.getBoundingClientRect().top;
    if(top<window.innerHeight-100){section.style.opacity=1;section.style.transform='translateY(0)';}
  });
});
const particlesContainer = document.querySelector('.particles');

for (let i = 0; i < 40; i++) {
  const p = document.createElement('div');
  p.classList.add('particle');
  p.style.left = Math.random() * 100 + 'vw';
  p.style.animationDuration = (5 + Math.random() * 10) + 's';
  p.style.animationDelay = Math.random() * 5 + 's';
  particlesContainer.appendChild(p);
}
