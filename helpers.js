// BASE é definido em cada página: '' na raiz do site, '../' dentro de /admin/
if (typeof BASE === "undefined") { var BASE = ""; }

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Conversor Markdown -> HTML minimalista e seguro (escapa HTML antes de
// aplicar qualquer formatação, então não é possível injetar <script>
// mesmo que o conteúdo de origem esteja corrompido). Suporta: títulos,
// negrito, itálico, links, imagens, citações e listas — o suficiente para
// notícias e páginas de projeto sem depender de bibliotecas externas.
function mdToHtml(md) {
  if (!md) return "";
  let text = escapeHtml(md);
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) =>
    `<img src="${url}" alt="${alt}" loading="lazy">`
  );
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) =>
    `<a href="${url}" target="_blank" rel="noopener">${label}</a>`
  );
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/^### (.*)$/gm, "<h4>$1</h4>");
  text = text.replace(/^## (.*)$/gm, "<h3>$1</h3>");
  text = text.replace(/^# (.*)$/gm, "<h2>$1</h2>");
  text = text.replace(/^&gt; (.*)$/gm, "<blockquote>$1</blockquote>");
  text = text.replace(/(^|\n)((?:- .*(?:\n|$))+)/g, (_m, pre, block) => {
    const items = block
      .trim()
      .split("\n")
      .map((l) => l.replace(/^- /, ""))
      .map((i) => `<li>${i}</li>`)
      .join("");
    return `${pre}<ul>${items}</ul>`;
  });
  const blockTag = /^<(h2|h3|h4|ul|blockquote|img)/;
  text = text
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (blockTag.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  return text;
}

async function loadJSON(path) {
  const res = await fetch(BASE + path + "?_=" + Date.now());
  if (!res.ok) throw new Error("Não foi possível carregar " + path);
  return res.json();
}

function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return BASE + path;
}

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDateLong(iso) {
  if (!iso) return "";
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function toast(msg, type) {
  let box = document.getElementById("toast-box");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-box";
    box.className = "toast-box";
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = "toast " + (type === "error" ? "toast-error" : "toast-ok");
  t.textContent = msg;
  box.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 3800);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function uploadImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Use JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("A imagem passa de 5MB.");
  }
  const base64 = await fileToBase64(file);
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-]+/g, "-");
  const path = `uploads/${Date.now()}-${safeName}`;
  await GH.putBinaryFile(path, base64, `Publica imagem ${safeName}`);
  return path;
}

function applySettingsBranding(settings) {
  if (!settings) return;
  if (settings.faviconEmoji) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href =
      "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>" +
      settings.faviconEmoji +
      "</text></svg>";
  }
  if (settings.accentColor) {
    document.documentElement.style.setProperty("--blue-700", settings.accentColor);
  }
}
