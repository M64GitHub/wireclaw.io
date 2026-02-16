(function() {
  var viewport = document.querySelector('.gallery-viewport');
  if (!viewport) return;

  var images = viewport.querySelectorAll('img');
  var dots = document.querySelectorAll('.gallery-dot');
  var caption = document.querySelector('.gallery-caption');
  var hasDataCaptions = images[0] && images[0].getAttribute('data-caption');
  var captions = hasDataCaptions
    ? Array.prototype.map.call(images, function(img) { return img.getAttribute('data-caption') || ''; })
    : [
      'Telegram: register sensor \u2192 ask temperature \u2192 set alert \u2192 get notification',
      'Serial log: NATS subscribe, LLM tool calls, rule trigger + clear',
      'Any machine: nats pub home.room.temp "45.3" \u2192 rule fires'
    ];
  var current = 0;
  var timer;

  function show(index) {
    current = index;
    images.forEach(function(img, i) { img.classList.toggle('active', i === index); });
    dots.forEach(function(dot, i) { dot.classList.toggle('active', i === index); });
    if (caption) caption.innerHTML = captions[index] || '';
  }

  function advance() { show((current + 1) % images.length); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(advance, 5000);
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { show(i); startTimer(); });
  });

  show(0);
  startTimer();
})();
