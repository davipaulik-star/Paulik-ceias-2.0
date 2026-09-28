(async function () {
  const settings = await bootPublicChrome();
  initReveal();
  initCountdown();

  // ---- Hero -------------------------------------------------------
  const heroPhoto = document.getElementById("hero-photo");
  const heroNote = document.getElementById("hero-placeholder-note");
  if (settings.heroImage) {
    heroPhoto.src = assetUrl(settings.heroImage);
    heroPhoto.style.display = "block";
    if (heroNote) heroNote.style.display = "none";
  } else if (heroNote) {
    heroNote.style.display = "inline-block";
  }
  const heroSub = document.getElementById("hero-subtitle");
  if (heroSub) heroSub.textContent = settings.homeSubtitle || "";

  // ---- Info cards ---------------------------------------------------
  const infoRoot = document.getElementById("info-cards");
  if (infoRoot) {
    const cards = settings.infoCards || [];
    infoRoot.innerHTML = cards
      .map(
        (c) => `
      <a class="card reveal" href="${assetUrl(c.link || "#")}" style="text-decoration:none;display:block">
        <span class="card-icon" aria-hidden="true">${c.icon || "•"}</span>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.text)}</p>
      </a>`
      )
      .join("");
  }

  // ---- Avisos importantes -------------------------------------------
  try {
    const notices = await loadJSON("data/notices.json");
    const today = new Date().toISOString().slice(0, 10);
    const active = notices
      .filter((n) => !n.expirationDate || n.expirationDate >= today)
      .sort((a, b) => {
        const order = { alta: 0, media: 1, baixa: 2 };
        const p = (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
        return p !== 0 ? p : (b.date || "").localeCompare(a.date || "");
      })
      .slice(0, 4);
    const section = document.getElementById("section-avisos");
    const root = document.getElementById("avisos-list");
    if (active.length === 0) {
      section.style.display = "none";
    } else {
      root.innerHTML = active
        .map(
          (n) => `
        <div class="card notice-card reveal">
          <span class="notice-priority ${n.priority || "baixa"}"></span>
          <div>
            <p class="notice-date">${formatDateBR(n.date)}</p>
            <h3 style="margin-bottom:6px">${escapeHtml(n.title)}</h3>
            <p>${escapeHtml(n.message)}</p>
            ${n.link ? `<a class="link-more" href="${escapeHtml(n.link)}" target="_blank" rel="noopener">Saiba mais</a>` : ""}
          </div>
        </div>`
        )
        .join("");
    }
  } catch (e) {
    document.getElementById("section-avisos").style.display = "none";
  }

  // ---- Últimas notícias ----------------------------------------------
  try {
    const news = await loadJSON("data/news.json");
    const published = news
      .filter((n) => n.published !== false)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 3);
    const root = document.getElementById("news-list");
    if (published.length === 0) {
      root.innerHTML = `<div class="empty-state"><p>Nenhuma notícia publicada ainda.</p></div>`;
    } else {
      root.innerHTML = published.map((n) => newsCardHtml(n)).join("");
    }
  } catch (e) {
    document.getElementById("news-list").innerHTML = `<p class="muted">Não foi possível carregar as notícias.</p>`;
  }

  // ---- Próximos eventos -----------------------------------------------
  try {
    const events = await loadJSON("data/events.json");
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = events
      .filter((e) => (e.date || "") >= today)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
      .slice(0, 3);
    const root = document.getElementById("events-list");
    if (upcoming.length === 0) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum evento programado no momento.</p></div>`;
    } else {
      root.innerHTML = upcoming.map((e) => eventCardHtml(e)).join("");
    }
  } catch (e) {
    document.getElementById("events-list").innerHTML = `<p class="muted">Não foi possível carregar os eventos.</p>`;
  }

  // ---- Projetos em destaque -------------------------------------------
  try {
    const projects = await loadJSON("data/projects.json");
    const latest = [...projects].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 3);
    const root = document.getElementById("projects-list");
    if (latest.length === 0) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum projeto cadastrado ainda.</p></div>`;
    } else {
      root.innerHTML = latest
        .map(
          (p) => `
        <a class="card media-card reveal" href="projeto.html?id=${encodeURIComponent(p.id)}" style="text-decoration:none">
          ${p.image ? `<img src="${assetUrl(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">` : ""}
          <div class="media-card-body">
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml((p.description || "").slice(0, 110))}${(p.description || "").length > 110 ? "…" : ""}</p>
          </div>
        </a>`
        )
        .join("");
    }
  } catch (e) {
    document.getElementById("projects-list").innerHTML = `<p class="muted">Não foi possível carregar os projetos.</p>`;
  }

  // ---- Galeria (prévia) -------------------------------------------------
  try {
    const albums = await loadJSON("data/gallery.json");
    const root = document.getElementById("gallery-preview");
    if (!albums.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum álbum criado ainda.</p></div>`;
    } else {
      root.innerHTML = albums
        .slice(0, 4)
        .map(
          (a) => `
        <a class="card album-card reveal" href="galeria.html?album=${encodeURIComponent(a.id)}" style="text-decoration:none">
          ${a.images && a.images[0] ? `<img src="${assetUrl(a.images[0].url)}" alt="${escapeHtml(a.title)}" loading="lazy">` : `<div style="aspect-ratio:4/3;background:var(--blue-100)"></div>`}
          <div class="album-card-body"><h3 style="margin:0">${escapeHtml(a.title)}</h3><p class="muted" style="margin:4px 0 0">${(a.images || []).length} foto(s)</p></div>
        </a>`
        )
        .join("");
    }
  } catch (e) {
    document.getElementById("gallery-preview").innerHTML = `<p class="muted">Não foi possível carregar a galeria.</p>`;
  }

  // ---- Vídeos (prévia) ----------------------------------------------------
  try {
    const videos = await loadJSON("data/videos.json");
    const root = document.getElementById("videos-preview");
    const latest = [...videos].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 3);
    if (!latest.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum vídeo publicado ainda.</p></div>`;
    } else {
      root.innerHTML = latest.map((v) => videoCardHtml(v)).join("");
    }
  } catch (e) {
    document.getElementById("videos-preview").innerHTML = `<p class="muted">Não foi possível carregar os vídeos.</p>`;
  }
})();

function newsCardHtml(n) {
  return `
    <a class="card media-card reveal" href="noticia.html?id=${encodeURIComponent(n.id)}" style="text-decoration:none">
      ${n.coverImage ? `<img src="${assetUrl(n.coverImage)}" alt="${escapeHtml(n.title)}" loading="lazy">` : ""}
      <div class="media-card-body">
        ${n.category ? `<span class="tag">${escapeHtml(n.category)}</span>` : ""}
        <h3>${escapeHtml(n.title)}</h3>
        <p>${escapeHtml(n.summary || "")}</p>
        <time>${formatDateBR(n.date)}${n.author ? " · " + escapeHtml(n.author) : ""}</time>
      </div>
    </a>`;
}

function eventCardHtml(e) {
  const d = e.date ? new Date(e.date + "T00:00:00") : null;
  const day = d ? d.getDate() : "--";
  const month = d ? d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : "";
  return `
    <div class="card event-row reveal">
      <div class="event-date-badge"><span class="day">${day}</span><span class="month">${month}</span></div>
      <div>
        <h3 style="margin-bottom:4px">${escapeHtml(e.name)}</h3>
        <p class="muted" style="margin-bottom:6px">${e.time ? escapeHtml(e.time) + " · " : ""}${escapeHtml(e.location || "")}</p>
        <p>${escapeHtml((e.description || "").slice(0, 100))}${(e.description || "").length > 100 ? "…" : ""}</p>
        <a class="link-more" href="eventos.html">Ver detalhes</a>
      </div>
    </div>`;
}

function youtubeEmbed(url) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

function videoCardHtml(v) {
  const embed = /youtu/.test(v.url) ? youtubeEmbed(v.url) : v.url;
  return `
    <div class="card video-card reveal">
      <iframe src="${escapeHtml(embed)}" title="${escapeHtml(v.title)}" loading="lazy" allowfullscreen></iframe>
      <div class="video-card-body">
        <h3 style="margin-bottom:4px">${escapeHtml(v.title)}</h3>
        <p class="muted">${formatDateBR(v.date)}</p>
      </div>
    </div>`;
}
