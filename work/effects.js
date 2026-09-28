/* Progressive enhancement: the complete page stays visible without JavaScript. */
(() => {
  const sections = document.querySelectorAll('.work-section');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const spotlightAllowed = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const animations = new Set();
  let observer;

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (reducedMotion.matches || typeof target.animate !== 'function') return;
        const animation = target.animate([
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 650,
          delay: Number(target.dataset.revealDelay || 0),
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards'
        });
        animations.add(animation);
        animation.onfinish = animation.oncancel = () => animations.delete(animation);
      });
    }, { threshold: 0.12 });

    sections.forEach(section => {
      section.querySelectorAll('.work-section__title, .work-entry').forEach((item, index) => {
        item.dataset.revealDelay = String(Math.min(index, 3) * 80);
        observer.observe(item);
      });
    });
  }

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  });

  sections.forEach(section => {
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const resetSpotlight = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      section.classList.remove('is-spotlit');
    };

    section.addEventListener('pointermove', event => {
      if (!spotlightAllowed.matches || event.pointerType === 'touch') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty('--spotlight-x', `${pointerX - rect.left}px`);
        section.style.setProperty('--spotlight-y', `${pointerY - rect.top}px`);
        section.classList.add('is-spotlit');
        frame = 0;
      });
    }, { passive: true });
    section.addEventListener('pointerleave', resetSpotlight);
    section.addEventListener('pointercancel', resetSpotlight);
    spotlightAllowed.addEventListener('change', resetSpotlight);
  });
})();
