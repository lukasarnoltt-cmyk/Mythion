// scroll fade
window.addEventListener('scroll', () => {
  document.querySelectorAll('section').forEach(section => {
    const top = section.getBoundingClientRect().top;
    if(top < window.innerHeight - 100){
      section.style.opacity = 1;
      section.style.transform = 'translateY(0)';
    }
  });
});

// particles
const container = document.querySelector('.particles');
for(let i=0;i<60;i++){
  const span = document.createElement('span');
  span.style.left = Math.random()*100 + "vw";
  span.style.animationDelay = Math.random()*10 + "s";
  span.style.animationDuration = (8 + Math.random()*5) + "s";
  container.appendChild(span);
}

// smooth scroll
document.querySelectorAll('.menu-link').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior:'smooth' });
  });
});

// parallax
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero');
  if(hero) hero.style.backgroundPositionY = -(scrolled * 0.2) + "px";
  document.querySelectorAll('.gallery-grid img').forEach(img => {
    img.style.transform = `translateY(${scrolled * 0.1}px) scale(1.05)`;
  });
});
