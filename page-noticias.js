(async function () {
  await bootPublicChrome();
  initReveal();
  const root = document.getElementById("news-grid");
  try {
    const news = await loadJSON("data/news.json");
    const published = news.filter((n) => n.published !== false).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (!published.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhuma notícia publicada ainda.</p></div>`;
      return;
    }
    root.innerHTML = published
      .map(
        (n) => `
      <a class="card media-card reveal" href="noticia.html?id=${encodeURIComponent(n.id)}" style="text-decoration:none">
        ${n.coverImage ? `<img src="${assetUrl(n.coverImage)}" alt="${escapeHtml(n.title)}" loading="lazy">` : ""}
        <div class="media-card-body">
          ${n.category ? `<span class="tag">${escapeHtml(n.category)}</span>` : ""}
          <h3>${escapeHtml(n.title)}</h3>
          <p>${escapeHtml(n.summary || "")}</p>
          <time>${formatDateBR(n.date)}${n.author ? " · " + escapeHtml(n.author) : ""}</time>
        </div>
      </a>`
      )
      .join("");
    initReveal();
  } catch (e) {
    root.innerHTML = `<p class="muted">Não foi possível carregar as notícias agora.</p>`;
  }
})();
