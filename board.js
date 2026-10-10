(function () {
  const config = window.EPOCHA_CONFIG;
  const labels = {E:'Empathy',P:'Presence',O:'Opinion',C:'Creativity',H:'Hope',A:'Artificial Intelligence'};
  const board = document.getElementById('board');
  const status = document.getElementById('board-status');
  const shared = Boolean(config.supabaseUrl && config.publishableKey);
  const storageKey = 'epocha-board-' + config.eventId;
  let rows = [], pending = null;
  if (!shared) try { rows = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (_) {}
  if (!Array.isArray(rows)) rows = [];
  const columns = new Map();
  const tiles = new Map();
  function render() {
    const activeIds = new Set(rows.map(row => row.id));
    for (const [id, entry] of tiles) {
      if (!activeIds.has(id)) { entry.tile.remove(); tiles.delete(id); }
    }
    Object.entries(labels).forEach(([key, label]) => {
      if (!columns.has(key)) {
        const column = document.createElement('section'); column.className = 'board-column';
        const heading = document.createElement('h3'); column.append(heading);
        const preset = document.createElement('article'); preset.className = 'tile preset';
        const presetLabel = document.createElement('span'); presetLabel.className = 'preset-label'; presetLabel.textContent = 'Example action';
        const example = document.createElement('p'); example.textContent = config.presets[key]; preset.append(presetLabel, example); column.append(preset);
        board.append(column); columns.set(key, {column, heading, preset});
      }
      const {column, heading, preset} = columns.get(key);
      const entries = rows.filter(row => row.category === key);
      const title = key + ' · ' + label + ' (' + entries.length + ')';
      if (heading.textContent !== title) heading.textContent = title;
      let previous = preset;
      entries.forEach(row => {
        let entry = tiles.get(row.id);
        if (!entry) {
          const tile = document.createElement('article'); tile.className = 'tile';
          const body = document.createElement('p'); tile.append(body);
          entry = {tile, body, details:null, question:null}; tiles.set(row.id, entry);
        }
        if (entry.body.textContent !== row.body) entry.body.textContent = row.body;
        if (row.question && !entry.details) {
          const details = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p');
          summary.textContent = 'Reflection question'; details.append(summary, text); entry.tile.append(details);
          entry.details = details; entry.question = text;
        }
        if (row.question && entry.question.textContent !== row.question) entry.question.textContent = row.question;
        if (!row.question && entry.details) { entry.details.remove(); entry.details = null; entry.question = null; }
        if (previous.nextSibling !== entry.tile) column.insertBefore(entry.tile, previous.nextSibling);
        previous = entry.tile;
      });
    });
    const count = document.getElementById('response-count');
    const total = rows.length + ' next steps';
    if (count.textContent !== total) count.textContent = total;
  }
  async function request(query, options = {}) {
    const response = await fetch(config.supabaseUrl.replace(/\/$/, '') + '/rest/v1/vision_steps' + query, {
      ...options, headers: {apikey:config.publishableKey, 'Content-Type':'application/json', ...options.headers}, signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Board request failed');
    return response.status === 204 ? null : response.json();
  }
  let loading = false;
  async function refresh() {
    if (!shared || loading) return;
    loading = true;
    try {
      const result = [];
      for (let offset = 0; ; offset += 1000) {
        const page = await request('?event_id=eq.' + encodeURIComponent(config.eventId) + '&select=id,category,question,body,created_at&order=created_at.desc,id.desc&limit=1000&offset=' + offset);
        result.push(...page); if (page.length < 1000) break;
      }
      rows = result; render(); status.textContent = 'Live board · updates every 2 seconds';
    } catch (_) { status.textContent = 'Connection interrupted · reconnecting…'; }
    finally { loading = false; }
  }
  window.submitVisionStep = async function(category, question, body) {
    if (!labels[category] || !body.trim() || body.trim().length > 500) throw new Error('Choose a category and write 1–500 characters.');
    if (!config.questions[category].includes(question)) throw new Error('Choose a valid reflection question.');
    if (!pending || pending.category !== category || pending.question !== question || pending.body !== body.trim()) pending = {id:crypto.randomUUID(),event_id:config.eventId,category,question,body:body.trim()};
    if (shared) {
      await request('?on_conflict=id', {method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify(pending)});
      pending = null; await refresh();
    } else {
      const next = [{...pending,created_at:new Date().toISOString()}, ...rows];
      localStorage.setItem(storageKey, JSON.stringify(next)); rows = next; pending = null; render();
    }
  };
  if (!shared) {
    status.textContent = 'Preview mode · responses saved in this browser only';
    window.addEventListener('storage', event => { if (event.key === storageKey) { try { rows = JSON.parse(event.newValue || '[]'); render(); } catch (_) {} } });
  }
  render(); refresh(); setInterval(refresh, 2000);
})();
