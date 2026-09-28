(async function () {
  await bootPublicChrome();
  initReveal();
  const id = new URLSearchParams(location.search).get("id");
  const root = document.getElementById("project-detail");
  try {
    const projects = await loadJSON("data/projects.json");
    const item = projects.find((p) => p.id === id);
    if (!item) {
      root.innerHTML = `<div class="empty-state"><p>Projeto não encontrado.</p><a class="btn btn-secondary" href="projetos.html">Ver todos os projetos</a></div>`;
      return;
    }
    document.title = item.title + " — Colégio Estadual do Campo Irmã Ambrosia Sabatovish";
    root.innerHTML = `
      <h1>${escapeHtml(item.title)}</h1>
      <p class="muted">${formatDateLong(item.date)}</p>
      ${item.image ? `<img src="${assetUrl(item.image)}" alt="${escapeHtml(item.title)}" style="border-radius:16px;margin:20px 0" loading="lazy">` : ""}
      <div>${mdToHtml(item.description || "")}</div>
      ${item.teachers ? `<p><strong>Professores envolvidos:</strong> ${escapeHtml(item.teachers)}</p>` : ""}
      ${item.students ? `<p><strong>Alunos participantes:</strong> ${escapeHtml(item.students)}</p>` : ""}
      ${(item.gallery || []).length ? `<h3 style="margin-top:32px">Galeria do projeto</h3><div class="grid grid-3">${item.gallery.map((g) => `<img src="${assetUrl(g)}" loading="lazy" style="border-radius:12px" alt="">`).join("")}</div>` : ""}
      ${(item.videos || []).length ? `<h3 style="margin-top:32px">Vídeos do projeto</h3><div class="grid grid-2">${item.videos.map((v) => `<div class="card video-card"><iframe src="${escapeHtml(v)}" loading="lazy" allowfullscreen></iframe></div>`).join("")}</div>` : ""}
    `;
  } catch (e) {
    root.innerHTML = `<p class="muted">Não foi possível carregar este projeto.</p>`;
  }
})();
