(function() {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    document.querySelectorAll('.reveal, .arch-node, .led-circle, .loop-panel, .loop-connector').forEach(function(el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .arch-node, .led-circle, .loop-panel, .loop-connector').forEach(function(el) {
    observer.observe(el);
  });
})();
