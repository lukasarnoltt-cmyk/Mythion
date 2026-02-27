// scroll fade effect
window.addEventListener('scroll', () => {
  document.querySelectorAll('section').forEach(section => {
    const top = section.getBoundingClientRect().top;
    if(top < window.innerHeight - 100){
      section.style.opacity = 1;
      section.style.transform = 'translateY(0)';
    }
  });
});

// particles in hero
const particleContainer = document.querySelector('.particles');
for(let i=0;i<50;i++){
  const span = document.createElement('span');
  span.style.left = Math.random()*100 + "vw";
  span.style.animationDelay = (Math.random()*10) + "s";
  span.style.animationDuration = (8 + Math.random()*5) + "s";
  particleContainer.appendChild(span);
}

// smooth scroll menu
document.querySelectorAll('.menu-link').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    const target=document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior:'smooth' });
  });
});

// parallax effect for hero and gallery
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero');
  if(hero) hero.style.backgroundPositionY = -(scrolled * 0.2) + "px";

  document.querySelectorAll('.gallery-grid img').forEach((img,i) => {
    img.style.transform = `translateY(${scrolled * 0.1}px) scale(1.05)`;
  });
});
