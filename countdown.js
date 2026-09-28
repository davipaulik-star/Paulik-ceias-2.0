/*
  Contador regressivo para o fim das aulas. A data nunca fica fixa no
  código — vem sempre de data/calendar.json, editável em
  /admin/calendario.html. Já preparado para, no futuro, contar apenas
  dias letivos (exclui fins de semana e datas marcadas como não letivas),
  mas por padrão conta dias corridos.
*/
function businessDaysBetween(from, to, excludedIso) {
  const excluded = new Set(excludedIso || []);
  let count = 0;
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur < end) {
    const dow = cur.getDay();
    const iso = cur.toISOString().slice(0, 10);
    if (dow !== 0 && dow !== 6 && !excluded.has(iso)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

async function initCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;

  let cal;
  try {
    cal = await loadJSON("data/calendar.json");
  } catch (e) {
    el.innerHTML = `<p class="countdown-note">Não foi possível carregar o calendário escolar agora.</p>`;
    return;
  }

  if (!cal || !cal.endDate) {
    el.innerHTML = `
      <p class="countdown-label">Contagem regressiva</p>
      <p class="countdown-big-message">Calendário escolar ainda não configurado</p>
      <p class="countdown-note">Defina a data de fim das aulas em Painel administrativo → Calendário escolar.</p>
    `;
    return;
  }

  function render() {
    const now = new Date();
    const end = new Date(cal.endDate + "T23:59:59");
    const diff = end - now;

    if (diff <= 0) {
      const todayIso = now.toISOString().slice(0, 10);
      const message = todayIso === cal.endDate ? "Último dia de aula!" : "Aulas encerradas";
      el.innerHTML = `
        <p class="countdown-label">Contagem regressiva</p>
        <p class="countdown-big-message">${message}</p>
      `;
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let leadDays = days;
    let note = "";
    if (cal.countMode === "letivos") {
      leadDays = businessDaysBetween(now, end, cal.excludedDates);
      note = `<p class="countdown-note">Considerando apenas dias letivos (dias úteis, exceto os períodos não letivos configurados).</p>`;
    }

    el.innerHTML = `
      <p class="countdown-label">Contagem regressiva</p>
      <p class="countdown-lead">Faltam <strong>${leadDays}</strong> dias para o fim das aulas</p>
      <div class="countdown-grid">
        <div><span>${String(days).padStart(2, "0")}</span><small>dias</small></div>
        <div><span>${String(hours).padStart(2, "0")}</span><small>horas</small></div>
        <div><span>${String(minutes).padStart(2, "0")}</span><small>minutos</small></div>
        <div><span>${String(seconds).padStart(2, "0")}</span><small>segundos</small></div>
      </div>
      ${note}
    `;
  }

  render();
  setInterval(render, 1000);
}
