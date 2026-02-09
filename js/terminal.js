(function() {
  var terminalScript = [
    { type: 'user-input', text: 'Turn on the LED and check the temperature sensor' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Analyzing request...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    led_set(1, 0, 80, 0)', comment: '<- green LED on', delay: 150 },
    { type: 'tool-call', text: '[tool-call]    gpio_read(4)', comment: '<- reading sensor pin', delay: 150 },
    { type: 'result', text: '[result]       Pin 4: analog=2847 (23.4\u00b0C)', delay: 300 },
    { type: 'response', text: '[response]     LED is on (green). Temperature reads 23.4\u00b0C. All nominal.', delay: 100 },
    { type: 'spacer' },
    { type: 'user-input', text: 'Blink 3 times then publish status via NATS' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Planning multi-step action...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    led_set(1, 0, 0, 80)', comment: '<- blue blink x3', delay: 150 },
    { type: 'tool-call', text: '[tool-call]    nats_publish("device.status", "online:23.4C")', delay: 150 },
    { type: 'result', text: '[result]       Published to device.status', delay: 300 },
    { type: 'response', text: '[response]     Done! Blinked blue 3x and published status to NATS.', delay: 100 },
  ];

  var container = document.querySelector('.hero-terminal .terminal');
  if (!container) return;

  var body = container.querySelector('.terminal-body');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatLine(line) {
    var text = escapeHtml(line.text);
    if (line.comment) {
      text += ' <span class="comment">' + escapeHtml(line.comment) + '</span>';
    }
    if (line.type === 'user-input') {
      text = '> ' + text;
    }
    return text;
  }

  function delay(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  async function renderLine(line) {
    var el = document.createElement('div');
    el.className = 'terminal-line';

    if (line.type === 'spacer') {
      el.classList.add('spacer');
      body.appendChild(el);
      await delay(200);
      return;
    }

    el.classList.add(line.type);

    if (line.type === 'user-input' && !reducedMotion) {
      body.appendChild(el);
      var cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';

      var text = line.text;
      el.textContent = '> ';
      el.appendChild(cursor);

      for (var i = 0; i < text.length; i++) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        scrollToBottom();
        await delay(30 + Math.random() * 30);
      }
      cursor.remove();
      await delay(400);
    } else {
      el.innerHTML = formatLine(line);
      body.appendChild(el);
      scrollToBottom();
      await delay(reducedMotion ? 0 : (line.delay || 80));
    }
  }

  async function run() {
    while (true) {
      body.innerHTML = '';
      for (var i = 0; i < terminalScript.length; i++) {
        await renderLine(terminalScript[i]);
      }
      await delay(3000);
    }
  }

  run();
})();
