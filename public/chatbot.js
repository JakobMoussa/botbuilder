/* Dialogue website widget. No credentials or internal settings are delivered here. */
(() => {
  'use strict';
  const script = document.currentScript;
  const botId = script && script.getAttribute('data-bot-id');
  if (!script || !botId || document.querySelector(`[data-dialogue-widget="${CSS.escape(botId)}"]`)) return;
  const base = new URL(script.src).origin;
  const host = document.createElement('div');
  host.setAttribute('data-dialogue-widget', botId);
  const shadow = host.attachShadow({ mode: 'open' });
  (document.body || document.documentElement).append(host);
  const style = document.createElement('style');
  style.textContent = `:host{all:initial;position:fixed;width:min(370px,calc(100vw - 28px));pointer-events:none;z-index:2147483000;bottom:22px;right:22px;font:14px/1.6 Arial,sans-serif;color:#30273b}*{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer}button:disabled{opacity:.5;cursor:wait}button:focus-visible,input:focus-visible{outline:3px solid #c3b1f4;outline-offset:2px}.launcher{pointer-events:auto;border:0;border-radius:50%;background:var(--primary,#7360df);color:var(--on-primary,#fff);height:57px;width:57px;display:flex;align-items:center;justify-content:center;box-shadow:0 5px 24px #2c174133;margin-left:auto}.panel{pointer-events:auto;width:100%;height:550px;max-height:calc(100dvh - 105px);display:flex;flex-direction:column;background:var(--surface,#fff);color:var(--text,#483b55);border:1px solid #9e8ab326;border-radius:var(--radius,20px);box-shadow:0 10px 55px #30134a29;margin-bottom:14px;overflow:hidden}.panel[hidden]{display:none}.header{display:flex;align-items:center;gap:10px;padding:17px;background:var(--primary,#7360df);color:var(--on-primary,#fff)}.avatar{height:37px;width:37px;border-radius:10px;background:#ffffff26;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:23px}.avatar img{width:100%;height:100%;object-fit:cover}.heading{flex:1;min-width:0}.name{font-weight:bold;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status{font-size:10px;opacity:.8}.header button{border:0;background:transparent;color:inherit;font-size:20px;padding:4px}.messages{overflow-y:auto;flex:1;padding:20px 17px;display:flex;flex-direction:column;gap:15px;overscroll-behavior:contain}.bubble{border-radius:0 12px 12px;max-width:87%;padding:11px 14px;background:var(--bubble,#f5f1fa);color:var(--text,#65516f);font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere}.bubble.user{align-self:flex-end;border-radius:12px 12px 0 12px;background:var(--primary,#7360df);color:var(--on-primary,#fff)}.form{display:flex;gap:8px;margin:10px 14px;border:1px solid #b19bc733;border-radius:9px;padding:7px}.input{border:0;background:transparent;color:inherit;min-width:0;flex:1;padding:5px;font-size:12px;outline:none}.send{border:0;border-radius:6px;background:var(--primary,#7360df);color:var(--on-primary,#fff);height:32px;width:32px;font-size:18px}.footer{text-align:center;font-size:9px;opacity:.55;padding:0 12px 12px;display:flex;align-items:center;justify-content:center;gap:5px}.footer img{max-height:18px;max-width:60px;object-fit:contain}.error{font-size:11px;color:#ba6868;padding:10px 15px}.feedback{display:flex;gap:5px;margin-top:-7px}.feedback button{border:1px solid #b29cc629;background:transparent;color:inherit;border-radius:5px;font-size:10px;padding:3px 8px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}@media(max-width:430px){:host{bottom:14px;right:14px;left:14px}.panel{width:100%;height:540px;max-height:calc(100dvh - 100px)}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}`;
  shadow.append(style);
  function element(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text) el.textContent = text; return el; }
  const panel = element('section', 'panel'); panel.hidden = true; panel.setAttribute('aria-label', 'Website-Assistent');
  const header = element('div', 'header'), avatar = element('div', 'avatar', '✦'), heading = element('div', 'heading'), name = element('div', 'name', 'Assistent'), status = element('div', 'status', 'Für dich da');
  heading.append(name, status);
  const reset = element('button', '', '↺'); reset.setAttribute('aria-label', 'Neue Unterhaltung'); reset.title = 'Neue Unterhaltung';
  const close = element('button', '', '×'); close.setAttribute('aria-label', 'Chat schließen');
  header.append(avatar, heading, reset, close);
  const messages = element('div', 'messages'); messages.setAttribute('role', 'log'); messages.setAttribute('aria-live', 'polite');
  const error = element('div', 'error'); error.hidden = true; error.setAttribute('role', 'alert');
  const form = element('form', 'form'), input = element('input', 'input'), send = element('button', 'send', '↑');
  input.placeholder = 'Stelle deine Frage …'; input.maxLength = 4000; input.setAttribute('aria-label', 'Deine Nachricht'); send.setAttribute('aria-label', 'Nachricht senden'); send.type = 'submit';
  form.append(input, send);
  const footer = element('div', 'footer', 'Powered by dialogue ✦');
  panel.append(header, messages, error, form, footer);
  const launcher = element('button', 'launcher', '✦'); launcher.setAttribute('aria-label', 'Chat öffnen'); launcher.setAttribute('aria-expanded', 'false');
  shadow.append(panel, launcher);
  let config, busy = false, session = {};
  function toggle(open) { panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open)); launcher.setAttribute('aria-label', open ? 'Chat schließen' : 'Chat öffnen'); if (open) input.focus(); }
  launcher.onclick = () => toggle(panel.hidden); close.onclick = () => { toggle(false); launcher.focus(); };
  shadow.addEventListener('keydown', e => { if (e.key === 'Escape') { toggle(false); launcher.focus(); } });
  function bubble(role, text) { const el = element('div', `bubble ${role}`, text); messages.append(el); messages.scrollTop = messages.scrollHeight; return el; }
  reset.onclick = () => { if (busy) return; session = {}; messages.replaceChildren(); bubble('assistant', config?.greeting || 'Hallo!'); error.hidden = true; input.focus(); };
  const svg = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z"/></svg>';
  fetch(`${base}/widget/${encodeURIComponent(botId)}/config`, { credentials: 'omit' }).then(async response => {
    if (!response.ok) throw new Error('Dieser Assistent ist auf dieser Website nicht verfügbar.');
    config = await response.json();
    host.style.setProperty('--primary', config.primaryColor); host.style.setProperty('--on-primary', config.textColor); host.style.setProperty('--radius', config.radius + 'px');
    if (config.theme === 'dark') { host.style.setProperty('--surface', '#262331'); host.style.setProperty('--text', '#e9def2'); host.style.setProperty('--bubble', '#39313f'); }
    if (config.position === 'left') { host.style.left = '14px'; host.style.right = 'auto'; launcher.style.marginLeft = '0'; }
    name.textContent = config.displayName; input.placeholder = config.placeholder;
    if (config.avatarUrl) { const img = element('img'); img.src = config.avatarUrl; img.alt = ''; img.referrerPolicy = 'no-referrer'; avatar.replaceChildren(img); }
    if (config.logoUrl) { const img = element('img'); img.src = config.logoUrl; img.alt = 'Logo'; img.referrerPolicy = 'no-referrer'; footer.prepend(img); }
    if (config.buttonIcon === 'message') launcher.innerHTML = svg; // Static, trusted SVG only.
    else launcher.textContent = config.buttonIcon === 'bot' ? '☷' : '✦';
    footer.hidden = !config.branding;
    if (!config.branding) footer.style.display = 'none';
    bubble('assistant', config.greeting);
  }).catch(e => { error.textContent = e.message; error.hidden = false; input.disabled = true; send.disabled = true; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || busy || !config) return;
    busy = true; send.disabled = true; input.disabled = true; reset.disabled = true; error.hidden = true; input.value = '';
    bubble('user', message); const reply = bubble('assistant', '•••');
    let answer = '', completed = false;
    try {
      const response = await fetch(`${base}/api/public/chat`, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId, message, ...session }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Die Antwort konnte nicht geladen werden.');
      const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true }); let position;
        while ((position = buffer.indexOf('\n\n')) >= 0) {
          const frame = buffer.slice(0, position); buffer = buffer.slice(position + 2);
          if (!frame.startsWith('data: ')) continue;
          const data = JSON.parse(frame.slice(6));
          if (data.type === 'meta') session = { sessionToken: data.sessionToken, conversationId: data.conversationId };
          if (data.type === 'delta') { answer += data.text; reply.textContent = answer; messages.scrollTop = messages.scrollHeight; }
          if (data.type === 'error') throw new Error(data.message);
          if (data.type === 'done') {
            completed = true;
            if (data.messageId) {
              const feedback = element('div', 'feedback');
              for (const [label, value] of [['Hilfreich', 1], ['Nicht hilfreich', -1]]) {
                const button = element('button', '', label);
                button.onclick = async () => {
                  try { const response = await fetch(`${base}/api/public/feedback`, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId, sessionToken: session.sessionToken, messageId: data.messageId, feedback: value }) }); if (!response.ok) throw new Error(); feedback.textContent = 'Danke für dein Feedback.'; } catch { error.textContent = 'Feedback konnte nicht gespeichert werden.'; error.hidden = false; }
                }; feedback.append(button);
              }
              messages.append(feedback);
            }
          }
        }
      }
      if (!completed) throw new Error('Verbindung unterbrochen. Bitte erneut versuchen.');
    } catch (e) { if (!answer) reply.textContent = 'Die Antwort ist gerade nicht verfügbar.'; error.textContent = e.message + ' Du kannst deine Frage erneut senden oder eine neue Unterhaltung starten.'; error.hidden = false; }
    finally { busy = false; send.disabled = false; input.disabled = false; reset.disabled = false; input.focus(); }
  });
})();
