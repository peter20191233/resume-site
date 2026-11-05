/* Author: Petr Korytov. Native scrolling remains available without JavaScript. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('#screenshot-viewer');
  let activeImages = [];
  let activeIndex = 0;
  const renderImage = () => {
    const figure = activeImages[activeIndex];
    const image = figure.querySelector('img');
    const link = figure.querySelector('a');
    const full = dialog.querySelector('.screenshot-full');
    full.src = image.src;
    full.alt = image.alt;
    dialog.querySelector('#screenshot-title').textContent = figure.querySelector('figcaption').textContent;
    dialog.querySelector('[data-screenshot-count]').textContent = `${activeIndex + 1} / ${activeImages.length}`;
    dialog.querySelector('[data-screenshot-original]').href = link.href;
  };
  const changeImage = (step) => {
    activeIndex = (activeIndex + step + activeImages.length) % activeImages.length;
    renderImage();
  };
  if (dialog && typeof dialog.showModal === 'function') {
    dialog.querySelector('[data-close-screenshot]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-screenshot-prev]').addEventListener('click', () => changeImage(-1));
    dialog.querySelector('[data-screenshot-next]').addEventListener('click', () => changeImage(1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        changeImage(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
  }
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const track = gallery.querySelector('.gallery-track');
    const slides = [...track.querySelectorAll('.game-shot')];
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const count = gallery.querySelector('[data-gallery-count]');
    let scheduled = false;
    const update = () => {
      const rect = track.getBoundingClientRect();
      const visible = slides.map((slide, index) => ({ index, rect: slide.getBoundingClientRect() }))
        .filter(slide => slide.rect.right > rect.left + 12 && slide.rect.left < rect.right - 12);
      const first = (visible[0]?.index ?? 0) + 1;
      const last = (visible[visible.length - 1]?.index ?? 0) + 1;
      count.textContent = `${first === last ? first : `${first}–${last}`} / ${slides.length}`;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      scheduled = false;
    };
    const move = step => {
      const gap = parseFloat(getComputedStyle(track).gap) || 18;
      track.scrollBy({ left: step * (slides[0].getBoundingClientRect().width + gap), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    };
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        track.scrollTo({ left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      }
    });
    track.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    else window.addEventListener('resize', update);
    slides.forEach((figure, index) => figure.querySelector('a').addEventListener('click', event => {
      if (!dialog || typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activeImages = slides;
      activeIndex = index;
      renderImage();
      dialog.showModal();
    }));
    update();
  });
})();
