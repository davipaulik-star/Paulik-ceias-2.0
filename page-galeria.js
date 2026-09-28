(async function () {
  await bootPublicChrome();
  initReveal();

  const albumId = new URLSearchParams(location.search).get("album");
  const gridSection = document.getElementById("albums-grid-section");
  const albumSection = document.getElementById("album-view-section");

  let albums = [];
  try {
    albums = await loadJSON("data/gallery.json");
  } catch (e) {
    document.getElementById("albums-grid").innerHTML = `<p class="muted">Não foi possível carregar a galeria.</p>`;
    return;
  }

  if (albumId) {
    const album = albums.find((a) => a.id === albumId);
    gridSection.style.display = "none";
    albumSection.style.display = "";
    if (!album) {
      document.getElementById("album-view").innerHTML = `<div class="empty-state"><p>Álbum não encontrado.</p><a class="btn btn-secondary" href="galeria.html">Ver todos os álbuns</a></div>`;
      return;
    }
    document.title = album.title + " — Galeria — Colégio Estadual do Campo Irmã Ambrosia Sabatovish";
    const images = album.images || [];
    document.getElementById("album-view").innerHTML = `
      <a class="link-more" href="galeria.html">&larr; Todos os álbuns</a>
      <h1 style="margin-top:14px">${escapeHtml(album.title)}</h1>
      ${album.description ? `<p>${escapeHtml(album.description)}</p>` : ""}
      <div class="gallery-grid" id="album-images" style="margin-top:20px"></div>
    `;
    const imgRoot = document.getElementById("album-images");
    imgRoot.innerHTML = images
      .map(
        (img, i) => `<button type="button" data-index="${i}" aria-label="Ampliar foto ${i + 1}"><img src="${assetUrl(img.url)}" alt="${escapeHtml(img.caption || album.title)}" loading="lazy"></button>`
      )
      .join("");

    let current = 0;
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");

    function openLightbox(i) {
      current = i;
      showCurrent();
      lightbox.classList.add("open");
    }
    function showCurrent() {
      const img = images[current];
      lightboxImg.src = assetUrl(img.url);
      lightboxImg.alt = img.caption || "";
      lightboxCaption.textContent = img.caption || "";
    }
    function closeLightbox() {
      lightbox.classList.remove("open");
    }
    function next() {
      current = (current + 1) % images.length;
      showCurrent();
    }
    function prev() {
      current = (current - 1 + images.length) % images.length;
      showCurrent();
    }

    imgRoot.querySelectorAll("button[data-index]").forEach((btn) =>
      btn.addEventListener("click", () => openLightbox(Number(btn.dataset.index)))
    );
    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    document.getElementById("lightbox-next").addEventListener("click", next);
    document.getElementById("lightbox-prev").addEventListener("click", prev);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
  } else {
    gridSection.style.display = "";
    albumSection.style.display = "none";
    const root = document.getElementById("albums-grid");
    if (!albums.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum álbum criado ainda.</p></div>`;
      return;
    }
    root.innerHTML = albums
      .map(
        (a) => `
      <a class="card album-card reveal" href="galeria.html?album=${encodeURIComponent(a.id)}" style="text-decoration:none">
        ${a.images && a.images[0] ? `<img src="${assetUrl(a.images[0].url)}" alt="${escapeHtml(a.title)}" loading="lazy">` : `<div style="aspect-ratio:4/3;background:var(--blue-100)"></div>`}
        <div class="album-card-body"><h3 style="margin:0">${escapeHtml(a.title)}</h3><p class="muted" style="margin:4px 0 0">${(a.images || []).length} foto(s)</p></div>
      </a>`
      )
      .join("");
    initReveal();
  }
})();
