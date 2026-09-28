(async function () {
  await bootPublicChrome();
  initReveal();
  const root = document.getElementById("projects-grid");
  try {
    const projects = await loadJSON("data/projects.json");
    const sorted = [...projects].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (!sorted.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum projeto cadastrado ainda.</p></div>`;
      return;
    }
    root.innerHTML = sorted
      .map(
        (p) => `
      <a class="card media-card reveal" href="projeto.html?id=${encodeURIComponent(p.id)}" style="text-decoration:none">
        ${p.image ? `<img src="${assetUrl(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">` : ""}
        <div class="media-card-body">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml((p.description || "").slice(0, 120))}${(p.description || "").length > 120 ? "…" : ""}</p>
          <time>${formatDateBR(p.date)}</time>
        </div>
      </a>`
      )
      .join("");
    initReveal();
  } catch (e) {
    root.innerHTML = `<p class="muted">Não foi possível carregar os projetos.</p>`;
  }
})();
