/*
  Motor genérico de CRUD. Cada página admin (noticias.html, avisos.html,
  eventos.html, projetos.html, videos.html) só declara os campos da sua
  coleção e chama initCrudPage(config) — toda a lógica de listar, criar,
  editar, publicar e excluir vive aqui uma única vez.
*/
function renderField(f, value) {
  const id = "field-" + f.key;
  switch (f.type) {
    case "textarea":
      return `<label class="field"><span>${f.label}${f.required ? " *" : ""}</span><textarea id="${id}" data-key="${f.key}" rows="3">${escapeHtml(value || "")}</textarea></label>`;
    case "markdown":
      return `<label class="field field-markdown"><span>${f.label}${f.required ? " *" : ""}</span>
        <div class="md-toolbar">
          <button type="button" data-md="bold">Negrito</button>
          <button type="button" data-md="italic">Itálico</button>
          <button type="button" data-md="h2">Título</button>
          <button type="button" data-md="list">Lista</button>
          <button type="button" data-md="quote">Citação</button>
          <button type="button" data-md="link">Link</button>
          <button type="button" data-md="image">Imagem</button>
          <button type="button" data-md-preview="1">Pré-visualizar</button>
        </div>
        <textarea id="${id}" data-key="${f.key}" rows="10">${escapeHtml(value || "")}</textarea>
        <div id="${id}-preview" class="md-preview" hidden></div>
      </label>`;
    case "date":
      return `<label class="field"><span>${f.label}${f.required ? " *" : ""}</span><input type="date" id="${id}" data-key="${f.key}" value="${value || ""}"></label>`;
    case "time":
      return `<label class="field"><span>${f.label}</span><input type="time" id="${id}" data-key="${f.key}" value="${value || ""}"></label>`;
    case "boolean":
      return `<label class="field field-checkbox"><input type="checkbox" id="${id}" data-key="${f.key}" ${value ? "checked" : ""}><span>${f.label}</span></label>`;
    case "select":
      return `<label class="field"><span>${f.label}${f.required ? " *" : ""}</span><select id="${id}" data-key="${f.key}">${f.options.map((o) => `<option value="${o}" ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select></label>`;
    case "image":
      return `<div class="field field-image"><span>${f.label}</span>
        <input type="hidden" id="${id}" data-key="${f.key}" value="${value || ""}">
        <div class="image-current" id="${id}-preview">${value ? `<img src="${assetUrl(value)}" alt="">` : '<span class="muted">Nenhuma imagem enviada</span>'}</div>
        <input type="file" id="${id}-file" accept="image/png,image/jpeg,image/webp,image/gif">
        <button type="button" class="btn btn-sm" id="${id}-upload">Enviar imagem</button>
        <p class="hint">JPG, PNG, WEBP ou GIF, até 5MB.</p>
      </div>`;
    case "number":
      return `<label class="field"><span>${f.label}${f.required ? " *" : ""}</span><input type="number" id="${id}" data-key="${f.key}" value="${value ?? ""}"></label>`;
    case "url":
      return `<label class="field"><span>${f.label}${f.required ? " *" : ""}</span><input type="url" id="${id}" data-key="${f.key}" placeholder="https://" value="${escapeHtml(value || "")}"></label>`;
    default:
      return `<label class="field"><span>${f.label}${f.required ? " *" : ""}</span><input type="text" id="${id}" data-key="${f.key}" value="${escapeHtml(value || "")}"></label>`;
  }
}

function collectFieldValues(fields) {
  const out = {};
  fields.forEach((f) => {
    const el = document.getElementById("field-" + f.key);
    if (!el) return;
    if (f.type === "boolean") out[f.key] = el.checked;
    else if (f.type === "number") out[f.key] = el.value === "" ? null : Number(el.value);
    else out[f.key] = el.value;
  });
  return out;
}

function insertMarkdown(ta, kind) {
  const start = ta.selectionStart,
    end = ta.selectionEnd;
  const sel = ta.value.slice(start, end);
  let before = "",
    after = "",
    placeholder = "";
  if (kind === "bold") { before = "**"; after = "**"; placeholder = "texto em negrito"; }
  else if (kind === "italic") { before = "*"; after = "*"; placeholder = "texto em itálico"; }
  else if (kind === "h2") { before = "## "; placeholder = "Título"; }
  else if (kind === "list") { before = "- "; placeholder = "item da lista"; }
  else if (kind === "quote") { before = "> "; placeholder = "citação"; }
  else if (kind === "link") { before = "["; after = "](https://)"; placeholder = "texto do link"; }
  else if (kind === "image") { before = "!["; after = "](https://)"; placeholder = "descrição da imagem"; }
  const text = sel || placeholder;
  ta.focus();
  ta.setRangeText(before + text + after, start, end, "end");
}

function wireFieldWidgets(fields) {
  fields
    .filter((f) => f.type === "markdown")
    .forEach((f) => {
      const id = "field-" + f.key;
      const ta = document.getElementById(id);
      const preview = document.getElementById(id + "-preview");
      const wrap = ta.closest(".field-markdown");
      wrap.querySelectorAll("[data-md]").forEach((btn) => btn.addEventListener("click", () => insertMarkdown(ta, btn.dataset.md)));
      const previewBtn = wrap.querySelector("[data-md-preview]");
      previewBtn.addEventListener("click", () => {
        const showingPreview = !preview.hidden;
        if (showingPreview) {
          preview.hidden = true;
          ta.hidden = false;
          previewBtn.textContent = "Pré-visualizar";
        } else {
          preview.innerHTML = mdToHtml(ta.value);
          preview.hidden = false;
          ta.hidden = true;
          previewBtn.textContent = "Editar texto";
        }
      });
    });

  fields
    .filter((f) => f.type === "image")
    .forEach((f) => {
      const id = "field-" + f.key;
      const fileInput = document.getElementById(id + "-file");
      const uploadBtn = document.getElementById(id + "-upload");
      uploadBtn.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) { toast("Selecione um arquivo primeiro.", "error"); return; }
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Enviando...";
        try {
          const path = await uploadImageFile(file);
          document.getElementById(id).value = path;
          document.getElementById(id + "-preview").innerHTML = `<img src="${assetUrl(path)}" alt="">`;
          toast("Imagem publicada com sucesso.");
        } catch (e) {
          toast("Não foi possível publicar a imagem.", "error");
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = "Enviar imagem";
        }
      });
    });
}

function formatColumn(item, col) {
  const val = item[col.key];
  if (col.type === "boolean") return val ? "Sim" : "Não";
  if (col.type === "date") return val ? formatDateBR(val) : "—";
  if (typeof val === "string" && val.length > 60) return escapeHtml(val.slice(0, 60)) + "…";
  return val != null && val !== "" ? escapeHtml(String(val)) : "—";
}

async function initCrudPage(config) {
  const ok = await requireAuth();
  if (!ok) return;
  renderAdminChrome(config.key);

  document.getElementById("crud-title").textContent = config.title;
  document.getElementById("crud-intro").textContent = config.intro || "";

  const state = { items: [], sha: null };

  function emptyItem() {
    const obj = { id: "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) };
    config.fields.forEach((f) => (obj[f.key] = f.default ?? (f.type === "boolean" ? false : "")));
    return obj;
  }

  async function load() {
    document.getElementById("crud-list").innerHTML = `<p class="muted">Carregando…</p>`;
    try {
      const file = await GH.getFile(config.dataFile);
      state.items = file.exists ? JSON.parse(file.content || "[]") : [];
      state.sha = file.sha;
      renderList();
    } catch (e) {
      document.getElementById("crud-list").innerHTML = `<p class="muted">Não foi possível carregar os dados: ${escapeHtml(e.message)}</p>`;
    }
  }

  async function persist(message) {
    const body = JSON.stringify(state.items, null, 2);
    const result = await GH.putFile(config.dataFile, body, message, state.sha);
    state.sha = result.content.sha;
  }

  function renderList() {
    const root = document.getElementById("crud-list");
    if (!state.items.length) {
      root.innerHTML = `<div class="empty-state"><p>Nenhum item cadastrado ainda.</p><button class="btn btn-primary" id="empty-new">Criar o primeiro</button></div>`;
      document.getElementById("empty-new").onclick = () => openForm(emptyItem());
      return;
    }
    const sortKey = config.sortKey || "date";
    const sorted = [...state.items].sort((a, b) => String(b[sortKey] || "").localeCompare(String(a[sortKey] || "")));
    root.innerHTML = `<table class="crud-table"><thead><tr>${config.listColumns.map((c) => `<th>${c.label}</th>`).join("")}<th></th></tr></thead><tbody>
      ${sorted
        .map(
          (item) => `<tr>
        ${config.listColumns.map((c) => `<td>${formatColumn(item, c)}</td>`).join("")}
        <td class="row-actions">
          <button class="btn btn-sm" data-edit="${item.id}">Editar</button>
          <button class="btn btn-sm btn-danger" data-del="${item.id}">Excluir</button>
        </td>
      </tr>`
        )
        .join("")}
    </tbody></table>`;
    root.querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => openForm(state.items.find((i) => i.id === b.dataset.edit))));
    root.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => removeItem(b.dataset.del)));
  }

  async function removeItem(id) {
    if (!confirm("Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.")) return;
    const backup = state.items;
    state.items = state.items.filter((i) => i.id !== id);
    try {
      await persist(`Remove item de ${config.title} (${id})`);
      toast("Excluído com sucesso.");
      renderList();
    } catch (e) {
      state.items = backup;
      toast("Não foi possível excluir: " + e.message, "error");
    }
  }

  function openForm(item) {
    const isNew = !state.items.some((i) => i.id === item.id);
    document.getElementById("crud-form-title").textContent = (isNew ? "Nova entrada — " : "Editar — ") + config.title;
    document.getElementById("crud-form-fields").innerHTML = config.fields.map((f) => renderField(f, item[f.key])).join("");
    wireFieldWidgets(config.fields);
    document.getElementById("crud-form").dataset.itemId = item.id;
    document.getElementById("crud-form-modal").classList.add("open");
  }

  function closeForm() {
    document.getElementById("crud-form-modal").classList.remove("open");
  }

  document.getElementById("crud-new-btn").onclick = () => openForm(emptyItem());
  document.getElementById("crud-form-cancel").onclick = closeForm;

  document.getElementById("crud-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = e.target.dataset.itemId;
    const values = collectFieldValues(config.fields);
    for (const f of config.fields) {
      if (f.required && !values[f.key]) {
        toast(`Preencha o campo obrigatório: ${f.label}`, "error");
        return;
      }
    }
    const idx = state.items.findIndex((i) => i.id === id);
    const record = { id, ...values };
    const backup = state.items;
    state.items = idx >= 0 ? state.items.map((i) => (i.id === id ? record : i)) : [record, ...state.items];
    const submitBtn = document.getElementById("crud-form-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Salvando...";
    try {
      await persist(`${idx >= 0 ? "Atualiza" : "Cria"} item em ${config.title}: ${record[config.titleKey || "title"] || record.id}`);
      toast("Publicado com sucesso.");
      closeForm();
      renderList();
    } catch (err) {
      state.items = backup;
      toast("Não foi possível publicar: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publicar";
    }
  };

  await load();
}
