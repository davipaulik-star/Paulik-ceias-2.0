(async function () {
  await bootPublicChrome();
  initReveal();

  function card(e) {
    const d = e.date ? new Date(e.date + "T00:00:00") : null;
    const day = d ? d.getDate() : "--";
    const month = d ? d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : "";
    return `
      <div class="card event-row reveal">
        <div class="event-date-badge"><span class="day">${day}</span><span class="month">${month}</span></div>
        <div>
          <h3 style="margin-bottom:4px">${escapeHtml(e.name)}</h3>
          <p class="muted" style="margin-bottom:6px">${e.time ? escapeHtml(e.time) + " · " : ""}${escapeHtml(e.location || "")}</p>
          ${e.image ? `<img src="${assetUrl(e.image)}" alt="" loading="lazy" style="border-radius:10px;margin-bottom:10px;max-height:220px;object-fit:cover;width:100%">` : ""}
          <p>${escapeHtml(e.description || "")}</p>
          ${e.link ? `<a class="link-more" href="${escapeHtml(e.link)}" target="_blank" rel="noopener">Mais informações</a>` : ""}
        </div>
      </div>`;
  }

  try {
    const events = await loadJSON("data/events.json");
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = events.filter((e) => (e.date || "") >= today).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const past = events.filter((e) => (e.date || "") < today).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const upRoot = document.getElementById("events-upcoming");
    upRoot.innerHTML = upcoming.length ? upcoming.map(card).join("") : `<div class="empty-state"><p>Nenhum evento programado no momento.</p></div>`;

    const pastSection = document.getElementById("events-past-section");
    const pastRoot = document.getElementById("events-past");
    if (past.length) {
      pastSection.style.display = "";
      pastRoot.innerHTML = past.map(card).join("");
    } else {
      pastSection.style.display = "none";
    }
    initReveal();
  } catch (e) {
    document.getElementById("events-upcoming").innerHTML = `<p class="muted">Não foi possível carregar os eventos.</p>`;
  }
})();
