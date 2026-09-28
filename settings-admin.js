(async function () {
  const ok = await requireAuth();
  if (!ok) return;
  renderAdminChrome("configuracoes");

  let settings = {};
  let sha = null;

  const textFields = [
    "schoolName", "tagline", "homeSubtitle", "phone", "email", "address",
    "mapEmbedUrl", "officeHours", "facebook", "instagram", "youtube",
    "whatsapp", "formEndpoint", "footerNote", "accentColor", "faviconEmoji",
  ];

  function fillForm() {
    textFields.forEach((key) => {
      const el = document.getElementById("field-" + key);
      if (el) el.value = settings[key] || "";
    });
    document.getElementById("field-aboutText").value = settings.aboutText || "";
    renderLogoPreview();
    renderHeroPreview();
    renderInfoCards();
  }

  function renderLogoPreview() {
    document.getElementById("logo-preview").innerHTML = settings.logo
      ? `<img src="${assetUrl(settings.logo)}" alt="" style="max-width:160px;border-radius:8px">`
      : `<span class="muted">Nenhum logo enviado</span>`;
  }

  function renderHeroPreview() {
    document.getElementById("hero-preview").innerHTML = settings.heroImage
      ? `<img src="${assetUrl(settings.heroImage)}" alt="" style="max-width:320px;border-radius:10px">`
      : `<span class="muted">Nenhuma imagem principal enviada</span>`;
    const restoreBtn = document.getElementById("hero-restore-btn");
    restoreBtn.hidden = !(settings.heroImageHistory && settings.heroImageHistory.length);
  }

  function renderInfoCards() {
    const root = document.getElementById("info-cards-list");
    const cards = settings.infoCards || [];
    root.innerHTML = cards
      .map(
        (c, i) => `
      <div class="admin-card" style="margin-bottom:14px">
        <div class="grid grid-2">
          <label class="field"><span>Ícone (emoji)</span><input type="text" value="${escapeHtml(c.icon || "")}" data-ic-icon="${i}"></label>
          <label class="field"><span>Título</span><input type="text" value="${escapeHtml(c.title || "")}" data-ic-title="${i}"></label>
        </div>
        <label class="field"><span>Texto</span><textarea rows="2" data-ic-text="${i}">${escapeHtml(c.text || "")}</textarea></label>
        <label class="field"><span>Link (página do site)</span><input type="text" value="${escapeHtml(c.link || "")}" data-ic-link="${i}"></label>
        <button type="button" class="btn btn-sm btn-danger" data-ic-remove="${i}">Remover card</button>
      </div>`
      )
      .join("");
    root.querySelectorAll("[data-ic-icon]").forEach((el) => el.addEventListener("input", () => (cards[Number(el.dataset.icIcon)].icon = el.value)));
    root.querySelectorAll("[data-ic-title]").forEach((el) => el.addEventListener("input", () => (cards[Number(el.dataset.icTitle)].title = el.value)));
    root.querySelectorAll("[data-ic-text]").forEach((el) => el.addEventListener("input", () => (cards[Number(el.dataset.icText)].text = el.value)));
    root.querySelectorAll("[data-ic-link]").forEach((el) => el.addEventListener("input", () => (cards[Number(el.dataset.icLink)].link = el.value)));
    root.querySelectorAll("[data-ic-remove]").forEach((el) =>
      el.addEventListener("click", () => {
        cards.splice(Number(el.dataset.icRemove), 1);
        renderInfoCards();
      })
    );
  }

  document.getElementById("add-info-card-btn").onclick = () => {
    settings.infoCards = settings.infoCards || [];
    settings.infoCards.push({ icon: "•", title: "", text: "", link: "" });
    renderInfoCards();
  };

  document.getElementById("logo-upload-btn").onclick = async () => {
    const file = document.getElementById("logo-upload-file").files[0];
    if (!file) { toast("Selecione um arquivo primeiro.", "error"); return; }
    try {
      settings.logo = await uploadImageFile(file);
      renderLogoPreview();
      toast("Imagem publicada com sucesso.");
    } catch (e) {
      toast("Não foi possível publicar a imagem.", "error");
    }
  };

  document.getElementById("hero-upload-btn").onclick = async () => {
    const file = document.getElementById("hero-upload-file").files[0];
    if (!file) { toast("Selecione um arquivo primeiro.", "error"); return; }
    try {
      const newPath = await uploadImageFile(file);
      settings.heroImageHistory = settings.heroImageHistory || [];
      if (settings.heroImage) settings.heroImageHistory.push(settings.heroImage);
      settings.heroImage = newPath;
      renderHeroPreview();
      toast("Imagem publicada com sucesso. Salve para aplicar na Home.");
    } catch (e) {
      toast("Não foi possível publicar a imagem.", "error");
    }
  };

  document.getElementById("hero-restore-btn").onclick = () => {
    if (!settings.heroImageHistory || !settings.heroImageHistory.length) return;
    const previous = settings.heroImageHistory.pop();
    if (settings.heroImage) settings.heroImageHistory.push(settings.heroImage);
    settings.heroImage = previous;
    renderHeroPreview();
    toast("Imagem anterior restaurada. Salve para aplicar na Home.");
  };

  document.getElementById("settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    textFields.forEach((key) => {
      const el = document.getElementById("field-" + key);
      if (el) settings[key] = el.value;
    });
    settings.aboutText = document.getElementById("field-aboutText").value;
    const btn = document.getElementById("settings-save-btn");
    btn.disabled = true;
    btn.textContent = "Salvando...";
    try {
      const result = await GH.putFile("data/settings.json", JSON.stringify(settings, null, 2), "Atualiza configurações do site", sha);
      sha = result.content.sha;
      toast("Configurações publicadas com sucesso.");
    } catch (err) {
      toast("Não foi possível salvar: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Salvar configurações";
    }
  });

  wireFieldWidgets([{ key: "aboutText", type: "markdown" }]);

  async function load() {
    const file = await GH.getFile("data/settings.json");
    settings = file.exists ? JSON.parse(file.content || "{}") : {};
    sha = file.sha;
    fillForm();
  }

  await load();
})();
