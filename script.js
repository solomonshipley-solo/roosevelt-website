// Scroll-in reveals
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => {
  if (reduceMotion) { el.classList.add('in'); return; }
  revealObserver.observe(el);
});

// safety sweep: anything at or above the current view is revealed,
// so nav jumps and reloads mid-page never leave sections invisible
let sweepQueued = false;
function sweepReveals() {
  sweepQueued = false;
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('in');
  });
}
window.addEventListener('scroll', () => {
  if (!sweepQueued) { sweepQueued = true; requestAnimationFrame(sweepReveals); }
}, { passive: true });

// Stat bars: grow and count up when the stats section scrolls into view
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const bars = document.querySelector('.bars');
if (bars) {
  if (reduceMotion) {
    bars.classList.add('grown');
    bars.querySelectorAll('.num').forEach((n) => {
      n.textContent = n.dataset.count + (n.dataset.suffix || '');
    });
  } else {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          bars.classList.add('grown');
          bars.querySelectorAll('.num').forEach(countUp);
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.35 });
    statsObserver.observe(bars);
  }
}

// Until a photo exists in images/, show a labeled placeholder in its spot
function markMissing(img) {
  const figure = img.closest('.photo');
  if (!figure || figure.classList.contains('missing')) return;
  figure.classList.add('missing');
  const box = document.createElement('div');
  box.className = 'ph-box';
  box.innerHTML = '<span class="star">&#9733;</span><span>add images/' + img.dataset.ph + '</span>';
  figure.prepend(box);
}

document.querySelectorAll('img[data-ph]').forEach((img) => {
  img.addEventListener('error', () => markMissing(img));
  // the image may have already failed before this script ran
  if (img.complete && img.naturalWidth === 0) markMissing(img);
});
