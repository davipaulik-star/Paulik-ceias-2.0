(async function () {
  const ok = await requireAuth();
  if (!ok) return;
  renderAdminChrome("galeria");

  const state = { albums: [], sha: null, openAlbumId: null };

  async function load() {
    const file = await GH.getFile("data/gallery.json");
    state.albums = file.exists ? JSON.parse(file.content || "[]") : [];
    state.sha = file.sha;
  }

  async function persist(message) {
    const result = await GH.putFile("data/gallery.json", JSON.stringify(state.albums, null, 2), message, state.sha);
    state.sha = result.content.sha;
  }

  function renderAlbumList() {
    document.getElementById("album-view").hidden = true;
    document.getElementById("album-list-view").hidden = false;
    const root = document.getElementById("albums-list");
    if (!state.albums.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum álbum criado ainda.</p></div>`;
      return;
    }
    root.innerHTML = `<table class="crud-table"><thead><tr><th>Álbum</th><th>Fotos</th><th></th></tr></thead><tbody>
      ${state.albums
        .map(
          (a) => `<tr>
        <td>${escapeHtml(a.title)}</td>
        <td>${(a.images || []).length}</td>
        <td class="row-actions">
          <button class="btn btn-sm" data-open="${a.id}">Gerenciar fotos</button>
          <button class="btn btn-sm" data-edit="${a.id}">Editar</button>
          <button class="btn btn-sm btn-danger" data-del="${a.id}">Excluir</button>
        </td>
      </tr>`
        )
        .join("")}
    </tbody></table>`;
    root.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => openAlbum(b.dataset.open)));
    root.querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => openAlbumForm(state.albums.find((a) => a.id === b.dataset.edit))));
    root.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => deleteAlbum(b.dataset.del)));
  }

  async function deleteAlbum(id) {
    if (!confirm("Excluir este álbum e todas as suas fotos da lista? As imagens continuam no repositório, apenas deixam de aparecer no site.")) return;
    const backup = state.albums;
    state.albums = state.albums.filter((a) => a.id !== id);
    try {
      await persist(`Remove álbum ${id}`);
      toast("Álbum excluído.");
      renderAlbumList();
    } catch (e) {
      state.albums = backup;
      toast("Não foi possível excluir: " + e.message, "error");
    }
  }

  function openAlbumForm(album) {
    const isNew = !album;
    const item = album || { id: "album-" + Date.now().toString(36), title: "", description: "", images: [] };
    document.getElementById("album-form-title").textContent = isNew ? "Novo álbum" : "Editar álbum";
    document.getElementById("album-form-name").value = item.title;
    document.getElementById("album-form-desc").value = item.description || "";
    document.getElementById("album-form").dataset.id = item.id;
    document.getElementById("album-form-modal").classList.add("open");
  }

  document.getElementById("album-new-btn").onclick = () => openAlbumForm(null);
  document.getElementById("album-form-cancel").onclick = () => document.getElementById("album-form-modal").classList.remove("open");

  document.getElementById("album-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = e.target.dataset.id;
    const title = document.getElementById("album-form-name").value.trim();
    const description = document.getElementById("album-form-desc").value.trim();
    if (!title) { toast("Dê um nome ao álbum.", "error"); return; }
    const backup = state.albums;
    const existing = state.albums.find((a) => a.id === id);
    if (existing) {
      existing.title = title;
      existing.description = description;
    } else {
      state.albums = [{ id, title, description, images: [] }, ...state.albums];
    }
    try {
      await persist(`Salva álbum: ${title}`);
      toast("Álbum publicado com sucesso.");
      document.getElementById("album-form-modal").classList.remove("open");
      renderAlbumList();
    } catch (err) {
      state.albums = backup;
      toast("Não foi possível salvar: " + err.message, "error");
    }
  };

  function openAlbum(id) {
    state.openAlbumId = id;
    document.getElementById("album-list-view").hidden = true;
    document.getElementById("album-view").hidden = false;
    renderAlbumDetail();
  }

  function renderAlbumDetail() {
    const album = state.albums.find((a) => a.id === state.openAlbumId);
    if (!album) { renderAlbumList(); return; }
    document.getElementById("album-detail-title").textContent = album.title;
    const grid = document.getElementById("album-images-admin");
    grid.innerHTML = (album.images || [])
      .map(
        (img, i) => `
      <div class="card" style="padding:10px">
        <img src="${assetUrl(img.url)}" alt="" style="border-radius:8px;aspect-ratio:1;object-fit:cover;margin-bottom:8px">
        <input type="text" value="${escapeHtml(img.caption || "")}" placeholder="Legenda" data-caption="${i}" style="margin-bottom:8px;width:100%">
        <button class="btn btn-sm btn-danger" data-remove="${i}">Excluir foto</button>
      </div>`
      )
      .join("") || `<p class="muted">Nenhuma foto neste álbum ainda.</p>`;

    grid.querySelectorAll("[data-caption]").forEach((input) =>
      input.addEventListener("change", async () => {
        const i = Number(input.dataset.caption);
        album.images[i].caption = input.value;
        try {
          await persist(`Atualiza legenda em ${album.title}`);
          toast("Legenda atualizada.");
        } catch (e) {
          toast("Não foi possível salvar a legenda: " + e.message, "error");
        }
      })
    );
    grid.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Excluir esta foto do álbum?")) return;
        const i = Number(btn.dataset.remove);
        const backup = JSON.parse(JSON.stringify(album.images));
        album.images.splice(i, 1);
        try {
          await persist(`Remove foto de ${album.title}`);
          toast("Foto removida.");
          renderAlbumDetail();
        } catch (e) {
          album.images = backup;
          toast("Não foi possível remover: " + e.message, "error");
        }
      })
    );
  }

  document.getElementById("album-back-btn").onclick = renderAlbumList;

  document.getElementById("album-upload-btn").onclick = async () => {
    const fileInput = document.getElementById("album-upload-file");
    const captionInput = document.getElementById("album-upload-caption");
    const file = fileInput.files[0];
    if (!file) { toast("Selecione uma foto primeiro.", "error"); return; }
    const album = state.albums.find((a) => a.id === state.openAlbumId);
    const btn = document.getElementById("album-upload-btn");
    btn.disabled = true;
    btn.textContent = "Enviando...";
    try {
      const path = await uploadImageFile(file);
      album.images = album.images || [];
      album.images.push({ url: path, caption: captionInput.value.trim() });
      await persist(`Adiciona foto em ${album.title}`);
      toast("Imagem publicada com sucesso.");
      fileInput.value = "";
      captionInput.value = "";
      renderAlbumDetail();
    } catch (e) {
      toast("Não foi possível publicar a imagem.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Adicionar foto ao álbum";
    }
  };

  await load();
  renderAlbumList();
})();
