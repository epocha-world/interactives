(function () {
  const config = window.EPOCHA_CONFIG;
  const letters = [['E','Empathy'],['P','Presence'],['O','Opinion'],['C','Creativity'],['H','Hope'],['A','Artificial Intelligence']];
  const spin = document.getElementById('spin'), more = document.getElementById('more');
  const answer = document.getElementById('step'), pin = document.getElementById('pin');
  const question = document.getElementById('qtxt'), result = document.getElementById('res');
  const dialog = document.getElementById('consent-dialog');
  const checkbox = document.getElementById('consent-checkbox'), agree = document.getElementById('consent-continue');
  const notice = document.getElementById('submit-status'), wheel = document.getElementById('sw');
  let consent = false, busy = false, sending = false, current = null, index = 0, rotation = 0;
  function point(angle, radius) {
    const radians = angle * Math.PI / 180;
    return [100 + radius * Math.sin(radians), 110 - radius * Math.cos(radians)];
  }
  letters.forEach(([letter], i) => {
    const start = point(i * 60, 88), end = point((i + 1) * 60, 88), center = point(i * 60 + 30, 58);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M100,110 L' + start + ' A88,88 0 0 1 ' + end + ' Z');
    path.setAttribute('fill', letter === 'A' ? 'var(--brand)' : 'var(--brand-ink)');
    path.setAttribute('stroke', 'var(--panel)'); path.setAttribute('stroke-width', '2');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', center[0]); text.setAttribute('y', center[1] + 9); text.setAttribute('text-anchor', 'middle');
    text.style.cssText = 'font:700 26px "Bricolage Grotesque",sans-serif;fill:' + (letter === 'A' ? 'var(--brand-ink)' : 'var(--brand)');
    text.textContent = letter; wheel.append(path, text);
  });
  function controls() {
    spin.disabled = busy || sending;
    more.disabled = busy || sending || !current || config.questions[current[0]].length < 2;
    answer.disabled = busy || sending || !current;
    pin.disabled = busy || sending || !consent || !current || !answer.value.trim();
  }
  function show() {
    question.textContent = config.questions[current[0]][index];
    document.getElementById('preset-hint').textContent = 'Example action: ' + config.presets[current[0]] + ' Adapt it to your experience and add a timeframe.';
    notice.textContent = ''; controls();
  }
  function startSpin() {
    if (!consent || busy || sending) return;
    // A draft must stay attached to its original category and question.
    if (answer.value.trim()) {
      notice.textContent = 'Submit your current action or clear it before spinning again.'; return;
    }
    busy = true; current = null; controls(); question.textContent = 'Your reflection question will appear after the spin.';
    const selected = Math.floor(Math.random() * letters.length);
    rotation = Math.ceil(rotation / 360) * 360 + 1800 - (selected * 60 + 30) + Math.random() * 40 - 20;
    wheel.style.transform = 'rotate(' + rotation + 'deg)'; result.textContent = 'Spinning…';
    setTimeout(() => {
      current = letters[selected]; index = Math.floor(Math.random() * config.questions[current[0]].length);
      busy = false; spin.textContent = 'Spin again'; result.textContent = 'You landed on ' + current[0] + ': ' + current[1]; show();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 4100);
  }
  spin.onclick = () => {
    if (consent) startSpin();
    else { checkbox.checked = false; agree.disabled = true; dialog.showModal(); }
  };
  checkbox.onchange = () => { agree.disabled = !checkbox.checked; };
  document.getElementById('consent-cancel').onclick = () => { dialog.close(); spin.focus(); };
  agree.onclick = () => { if (!checkbox.checked) return; consent = true; dialog.close(); startSpin(); };
  more.onclick = () => {
    if (busy || sending || !current) return;
    if (answer.value.trim()) { notice.textContent = 'Submit your current action or clear it before changing the question.'; return; }
    index = (index + 1) % config.questions[current[0]].length; show();
  };
  answer.oninput = controls;
  pin.onclick = async () => {
    if (pin.disabled || !consent || !current) return;
    sending = true; controls(); pin.textContent = 'Submitting…'; notice.textContent = '';
    try {
      await window.submitVisionStep(current[0], question.textContent, answer.value);
      answer.value = ''; notice.textContent = 'Your next step is on the board. Thank you!';
    } catch (_) { notice.textContent = 'Could not submit. Your answer is still here. Please try again.'; }
    finally { sending = false; pin.textContent = 'Add to vision board'; controls(); }
  };
  controls();
})();
