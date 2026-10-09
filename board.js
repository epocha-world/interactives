(function () {
  const config = window.EPOCHA_CONFIG;
  const labels = {E:'Empathy',P:'Presence',O:'Opinion',C:'Creativity',H:'Hope',A:'Artificial Intelligence'};
  const board = document.getElementById('board');
  const status = document.getElementById('board-status');
  const shared = Boolean(config.supabaseUrl && config.publishableKey);
  const storageKey = 'epocha-board-' + config.eventId;
  let rows = [], pending = null;
  try { rows = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (_) {}
  if (!Array.isArray(rows)) rows = [];
  function render() {
    board.replaceChildren();
    Object.entries(labels).forEach(([key, label]) => {
      const column = document.createElement('section'); column.className = 'board-column';
      const heading = document.createElement('h3');
      const entries = rows.filter(row => row.category === key);
      heading.textContent = key + ' · ' + label + ' (' + entries.length + ')';
      column.append(heading);
      if (!entries.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Be the first to share a next step.'; column.append(empty); }
      entries.forEach(row => { const tile = document.createElement('article'); tile.className = 'tile'; const p = document.createElement('p'); p.textContent = row.body; tile.append(p); column.append(tile); });
      board.append(column);
    });
    document.getElementById('response-count').textContent = rows.length + ' next steps';
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
        const page = await request('?event_id=eq.' + encodeURIComponent(config.eventId) + '&select=id,category,body,created_at&order=created_at.desc,id.desc&limit=1000&offset=' + offset);
        result.push(...page); if (page.length < 1000) break;
      }
      rows = result; render(); status.textContent = 'Live board · updates every 2 seconds';
    } catch (_) { status.textContent = 'Connection interrupted · reconnecting…'; }
    finally { loading = false; }
  }
  window.submitVisionStep = async function(category, body) {
    if (!labels[category] || !body.trim() || body.trim().length > 500) throw new Error('Choose a category and write 1–500 characters.');
    if (!pending || pending.category !== category || pending.body !== body.trim()) pending = {id:crypto.randomUUID(),event_id:config.eventId,category,body:body.trim()};
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
