(function() {
  var terminalScript = [
    { type: 'user-input', text: 'Turn on the LED and check the temperature' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Analyzing request...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    led_set(1, 0, 80, 0)', comment: '<- green LED on', delay: 150 },
    { type: 'tool-call', text: '[tool-call]    sensor_read("chip_temp")', comment: '<- reading sensor', delay: 150 },
    { type: 'result', text: '[result]       chip_temp: 34.2\u00b0C', delay: 300 },
    { type: 'response', text: '[response]     LED is green. Chip temperature is 34.2\u00b0C.', delay: 100 },
    { type: 'spacer' },
    { type: 'user-input', text: 'Alert me on Telegram when temp goes above 45' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Creating automation rule...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    rule_create("temp_alert", "chip_temp", "gt", 45, "telegram")', delay: 150 },
    { type: 'result', text: '[result]       Rule "temp_alert" active. Evaluating every loop.', delay: 300 },
    { type: 'response', text: '[response]     Done. Rule runs locally, no LLM. Survives reboots.', delay: 100 },
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
