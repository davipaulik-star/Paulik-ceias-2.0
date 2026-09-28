(async function () {
  const ok = await requireAuth();
  if (!ok) return;
  renderAdminChrome("dashboard");

  document.getElementById("traffic-link").href = `https://github.com/${SITE_CONFIG.owner}/${SITE_CONFIG.repo}/graphs/traffic`;

  async function safeCount(path, filterFn) {
    try {
      const file = await GH.getFile(path);
      const arr = file.exists ? JSON.parse(file.content || "[]") : [];
      return filterFn ? arr.filter(filterFn).length : arr.length;
    } catch (e) {
      return "—";
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  const [news, notices, events, projects, gallery, videos] = await Promise.all([
    safeCount("data/news.json", (n) => n.published !== false),
    safeCount("data/notices.json", (n) => !n.expirationDate || n.expirationDate >= today),
    safeCount("data/events.json", (e) => (e.date || "") >= today),
    safeCount("data/projects.json"),
    safeCount("data/gallery.json"),
    safeCount("data/videos.json"),
  ]);

  const stats = [
    { label: "Notícias publicadas", num: news, href: "noticias.html" },
    { label: "Avisos ativos", num: notices, href: "avisos.html" },
    { label: "Próximos eventos", num: events, href: "eventos.html" },
    { label: "Projetos cadastrados", num: projects, href: "projetos.html" },
    { label: "Álbuns na galeria", num: gallery, href: "galeria.html" },
    { label: "Vídeos publicados", num: videos, href: "videos.html" },
  ];

  document.getElementById("stat-grid").innerHTML = stats
    .map((s) => `<a class="stat-card" href="${s.href}" style="text-decoration:none;display:block"><span class="num">${s.num}</span><span class="label">${s.label}</span></a>`)
    .join("");
})();
