(() => {
  const scene = document.querySelector('.orbit-scene');
  const hero = document.querySelector('.hero');
  if (!scene || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  const update = () => {
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
    scene.style.transform = `translate3d(0, calc(-50% + ${progress * 46}px), 0) rotate(${progress * 7}deg) scale(${1 + progress * .09})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();