/* KYRO — motion system
   Built from original code, informed by the scroll choreography and starfield
   techniques in Sea of Stars and ORBIT. No scroll hijacking. */

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.orbit-scene');
  const nav = document.querySelector('.topbar');

  // Smooth scrolling: Lenis is optional; native scrolling remains the fallback.
  let lenis = null;
  if (!reduced && window.Lenis && window.gsap) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', () => window.ScrollTrigger?.update());
    if (window.ScrollTrigger) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // Real-time starfield inspired by the Three.js particle layers in the references.
  const canvas = document.getElementById('webgl');
  if (canvas && window.THREE && !reduced) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    const world = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1600);
    camera.position.z = 430;

    const makeLayer = (count, spread, size, color, opacity) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.62;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.55;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color, size, transparent: true, opacity,
        depthWrite: false, sizeAttenuation: true
      });
      return new THREE.Points(geometry, material);
    };

    const far = makeLayer(1700, 1500, 1.05, 0xd8d4c9, 0.48);
    const mid = makeLayer(420, 1050, 1.8, 0xb8a47c, 0.38);
    world.add(far, mid);

    let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
    window.addEventListener('pointermove', (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 18;
      pointerY = (event.clientY / window.innerHeight - 0.5) * -10;
    }, { passive: true });

    const resize = () => {
      const width = hero?.clientWidth || window.innerWidth;
      const height = hero?.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let frame = 0;
    const render = () => {
      requestAnimationFrame(render);
      if (document.hidden) return;
      frame += 0.00035;
      smoothX += (pointerX - smoothX) * 0.025;
      smoothY += (pointerY - smoothY) * 0.025;
      far.rotation.y = frame * 0.34;
      mid.rotation.y = frame * 0.62;
      far.rotation.x = frame * 0.08;
      camera.position.x = smoothX;
      camera.position.y = smoothY;
      camera.lookAt(world.position);
      renderer.render(world, camera);
    };
    render();
  } else if (canvas) {
    canvas.hidden = true;
  }

  // Scroll progress subtly moves the orbital illustration; content stays readable.
  if (hero && scene && !reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(scene, {
      y: 68, rotate: 8, scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
    gsap.to('.hero-copy', {
      y: -54, opacity: 0.42, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
  }

  // Editorial reveals: restrained, one-time, and disabled for reduced-motion users.
  const revealTargets = document.querySelectorAll(
    '.intro-grid, .section-head, .work-row, .statement h2, .footer-top'
  );
  revealTargets.forEach((element) => element.classList.add('reveal'));
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });
    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  }

  // Small navigation state, without adding a heavy fixed overlay.
  const updateNav = () => nav?.classList.toggle('is-scrolled', window.scrollY > 32);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Keep anchor navigation compatible with Lenis and reduced motion.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });
})();