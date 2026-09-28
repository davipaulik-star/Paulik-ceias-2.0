const ADMIN_NAV = [
  { href: "dashboard.html", label: "Dashboard", key: "dashboard" },
  { href: "noticias.html", label: "Notícias", key: "noticias" },
  { href: "avisos.html", label: "Avisos", key: "avisos" },
  { href: "eventos.html", label: "Eventos", key: "eventos" },
  { href: "projetos.html", label: "Projetos", key: "projetos" },
  { href: "galeria.html", label: "Galeria", key: "galeria" },
  { href: "videos.html", label: "Vídeos", key: "videos" },
  { href: "calendario.html", label: "Calendário escolar", key: "calendario" },
  { href: "configuracoes.html", label: "Configurações", key: "configuracoes" },
];

function renderAdminChrome(activeKey) {
  const el = document.getElementById("admin-header");
  if (!el) return;
  el.innerHTML = `
    <div class="admin-topbar">
      <a class="admin-brand" href="dashboard.html">Painel · Colégio Irmã Ambrosia Sabatovish</a>
      <div class="admin-topbar-actions">
        <a href="../index.html" target="_blank" class="btn btn-ghost btn-sm">Ver site</a>
        <button id="admin-logout" class="btn btn-ghost btn-sm">Sair</button>
      </div>
    </div>
    <nav class="admin-nav">
      ${ADMIN_NAV.map((i) => `<a href="${i.href}" class="${i.key === activeKey ? "active" : ""}">${i.label}</a>`).join("")}
    </nav>
  `;
  document.getElementById("admin-logout").addEventListener("click", () => {
    AUTH.clear();
    location.href = "index.html";
  });
}
