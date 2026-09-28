(async function () {
  await bootPublicChrome();
  initReveal();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const root = document.getElementById("news-detail");
  try {
    const news = await loadJSON("data/news.json");
    const item = news.find((n) => n.id === id && n.published !== false);
    if (!item) {
      root.innerHTML = `<div class="empty-state"><p>Notícia não encontrada ou ainda não publicada.</p><a class="btn btn-secondary" href="noticias.html">Ver todas as notícias</a></div>`;
      return;
    }
    document.title = item.title + " — Colégio Estadual do Campo Irmã Ambrosia Sabatovish";
    root.innerHTML = `
      ${item.category ? `<span class="tag">${escapeHtml(item.category)}</span>` : ""}
      <h1>${escapeHtml(item.title)}</h1>
      <p class="muted">${formatDateLong(item.date)}${item.author ? " · " + escapeHtml(item.author) : ""}</p>
      ${item.coverImage ? `<img src="${assetUrl(item.coverImage)}" alt="${escapeHtml(item.title)}" style="border-radius:16px;margin:22px 0" loading="lazy">` : ""}
      <div class="news-body">${mdToHtml(item.content || item.summary || "")}</div>
      ${(item.gallery || []).length ? `<div class="grid grid-3" style="margin-top:28px">${item.gallery.map((g) => `<img src="${assetUrl(g)}" loading="lazy" style="border-radius:12px" alt="">`).join("")}</div>` : ""}
    `;
  } catch (e) {
    root.innerHTML = `<p class="muted">Não foi possível carregar esta notícia.</p>`;
  }
})();
