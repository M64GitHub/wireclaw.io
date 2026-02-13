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
    { type: 'user-input', text: 'Every day at 6 PM, send me the chip temp on Telegram' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Creating scheduled rule...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    rule_create("evening_report", "clock_hhmm", "eq", 1800, "telegram", "Temp: {chip_temp}\u00b0C")', delay: 150 },
    { type: 'result', text: '[result]       Rule "evening_report" active. Fires daily at 18:00.', delay: 300 },
    { type: 'response', text: '[response]     Done. You\'ll get the live temp at 6 PM. No LLM needed.', delay: 100 },
    { type: 'spacer' },
    { type: 'user-input', text: 'Remember that my favorite color is blue' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Storing preference...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    file_write("/memory.txt", "Favorite color: blue")', delay: 150 },
    { type: 'result', text: '[result]       Written to /memory.txt (21 bytes)', delay: 300 },
    { type: 'response', text: '[response]     Got it. I\'ll remember that across reboots.', delay: 100 },
    { type: 'spacer' },
    { type: 'spacer' },
    { type: 'thinking', text: '              --- reboot ---', delay: 1200 },
    { type: 'spacer' },
    { type: 'user-input', text: 'Set the LED to my favorite color' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Checking memory... favorite color is blue.', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    led_set(1, 0, 0, 255)', comment: '<- blue', delay: 150 },
    { type: 'result', text: '[result]       LED set to (0, 0, 255)', delay: 300 },
    { type: 'response', text: '[response]     Done. LED is blue — your favorite.', delay: 100 },
    { type: 'spacer' },
    { type: 'user-input', text: 'Register a NATS sensor called "room_temp" on subject "home.room.temp" with unit C' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Registering NATS sensor...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    device_register("room_temp", "nats_value", "home.room.temp", "C")', delay: 150 },
    { type: 'result', text: '[result]       Subscribed \'room_temp\' -> home.room.temp', delay: 150 },
    { type: 'result', text: '[result]       Registered nats_value sensor \'room_temp\' on subject \'home.room.temp\'', delay: 300 },
    { type: 'response', text: '[response]     The NATS sensor "room_temp" has been registered on "home.room.temp" with unit "C".', delay: 100 },
    { type: 'spacer' },
    { type: 'user-input', text: 'Send me a Telegram message when the room temperature reaches 30 degrees' },
    { type: 'spacer' },
    { type: 'thinking', text: '[thinking...]  Creating rule...', delay: 600 },
    { type: 'tool-call', text: '[tool-call]    rule_create(rule_name="Room Temp Alert", sensor_name="room_temp", condition="gt", threshold=30, on_action="telegram", on_telegram_message="Room temperature has reached {value}\u00b0C.")', delay: 150 },
    { type: 'result', text: '[result]       Rule created: rule_01 \'Room Temp Alert\' - room_temp > 30 (every 5s)', delay: 300 },
    { type: 'response', text: '[response]     Done. You\'ll get a Telegram message when room temperature exceeds 30\u00b0C.', delay: 1500 },
    { type: 'result', text: '[result]       [Rule] rule_01 \'Room Temp Alert\' TRIGGERED (reading=45, threshold=30)', delay: 300 },
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
