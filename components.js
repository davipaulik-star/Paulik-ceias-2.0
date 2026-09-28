const SITE_NAV = [
  { href: "index.html", label: "Início" },
  { href: "o-colegio.html", label: "O Colégio" },
  { href: "noticias.html", label: "Notícias" },
  { href: "eventos.html", label: "Eventos" },
  { href: "projetos.html", label: "Projetos" },
  { href: "galeria.html", label: "Galeria" },
  { href: "videos.html", label: "Vídeos" },
  { href: "contato.html", label: "Contato" },
];

function currentFile() {
  const f = location.pathname.split("/").pop();
  return f || "index.html";
}

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const cur = currentFile();
  const isHome = cur === "index.html" || cur === "";
  const navHtml = SITE_NAV.map(
    (item) =>
      `<a href="${BASE}${item.href}" class="nav-link${item.href === cur ? " active" : ""}">${item.label}</a>`
  ).join("");

  el.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="${BASE}index.html">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-text"><strong>Colégio Estadual do Campo</strong><span>Irmã Ambrosia Sabatovish</span></span>
      </a>
      <nav class="site-nav" id="site-nav">${navHtml}</nav>
      <button class="hamburger" id="hamburger-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
    ${!isHome ? `<div class="back-bar"><button class="back-btn" id="back-btn">&larr; Voltar</button></div>` : ""}
  `;

  const burger = document.getElementById("hamburger-btn");
  const nav = document.getElementById("site-nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (document.referrer && document.referrer.startsWith(location.origin) && history.length > 1) {
        history.back();
      } else {
        location.href = BASE + "index.html";
      }
    });
  }

  window.addEventListener("scroll", () => {
    el.classList.toggle("scrolled", window.scrollY > 8);
  });
}

function renderFooter(settings) {
  const el = document.getElementById("site-footer");
  if (!el) return;
  const s = settings || {};
  const social = [
    s.facebook ? { href: s.facebook, label: "Facebook", icon: "f" } : null,
    s.instagram ? { href: s.instagram, label: "Instagram", icon: "◎" } : null,
    s.youtube ? { href: s.youtube, label: "YouTube", icon: "▶" } : null,
  ].filter(Boolean);

  el.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>Colégio Estadual do Campo<br>Irmã Ambrosia Sabatovish</h4>
          <p style="color:var(--blue-100);opacity:.85">${escapeHtml(s.tagline || "Educação do campo com qualidade e pertencimento.")}</p>
          ${social.length ? `<div class="social-row">${social.map((n) => `<a href="${escapeHtml(n.href)}" target="_blank" rel="noopener" aria-label="${n.label}">${n.icon}</a>`).join("")}</div>` : ""}
        </div>
        <div>
          <h4>Links rápidos</h4>
          <ul>
            ${SITE_NAV.filter((n) => n.href !== "index.html")
              .map((n) => `<li><a href="${BASE}${n.href}">${n.label}</a></li>`)
              .join("")}
          </ul>
        </div>
        <div>
          <h4>Contato</h4>
          <ul>
            <li>${escapeHtml(s.address || "[INSERIR ENDEREÇO]")}</li>
            <li><a href="tel:${escapeHtml(s.phone || "")}">${escapeHtml(s.phone || "[INSERIR TELEFONE]")}</a></li>
            <li><a href="mailto:${escapeHtml(s.email || "")}">${escapeHtml(s.email || "[INSERIR E-MAIL]")}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Colégio Estadual do Campo Irmã Ambrosia Sabatovish</span>
        <span>${escapeHtml(s.footerNote || "Site institucional")}</span>
      </div>
    </div>
  `;
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach((e) => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((e) => io.observe(e));
}

// Carrega as configurações do site uma vez e aplica no header/footer/branding
// de qualquer página pública. Retorna as settings para a página usar também.
async function bootPublicChrome() {
  renderHeader();
  let settings = {};
  try {
    settings = await loadJSON("data/settings.json");
  } catch (e) {
    settings = {};
  }
  applySettingsBranding(settings);
  renderFooter(settings);
  return settings;
}
