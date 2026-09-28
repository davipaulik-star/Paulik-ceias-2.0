function youtubeEmbedUrl(url) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}
function vimeoEmbedUrl(url) {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : url;
}

(async function () {
  await bootPublicChrome();
  initReveal();
  const root = document.getElementById("videos-grid");
  try {
    const videos = await loadJSON("data/videos.json");
    const sorted = [...videos].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (!sorted.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum vídeo publicado ainda.</p></div>`;
      return;
    }
    root.innerHTML = sorted
      .map((v) => {
        const embed = /vimeo/.test(v.url) ? vimeoEmbedUrl(v.url) : youtubeEmbedUrl(v.url);
        return `
        <div class="card video-card reveal">
          <iframe src="${escapeHtml(embed)}" title="${escapeHtml(v.title)}" loading="lazy" allowfullscreen></iframe>
          <div class="video-card-body">
            ${v.category ? `<span class="tag">${escapeHtml(v.category)}</span>` : ""}
            <h3 style="margin-bottom:4px">${escapeHtml(v.title)}</h3>
            <p class="muted">${formatDateBR(v.date)}</p>
            <p>${escapeHtml(v.description || "")}</p>
          </div>
        </div>`;
      })
      .join("");
    initReveal();
  } catch (e) {
    root.innerHTML = `<p class="muted">Não foi possível carregar os vídeos.</p>`;
  }
})();
