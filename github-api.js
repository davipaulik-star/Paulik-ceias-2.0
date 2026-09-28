/*
  Camada de acesso à API do GitHub (Contents API).
  Todo o "backend" deste site é o próprio repositório GitHub: publicar
  conteúdo = fazer commit de um arquivo. Isso funciona porque a API do
  GitHub aceita chamadas autenticadas diretamente do navegador (CORS) —
  não existe servidor intermediário, então o token nunca é enviado a
  nada além de api.github.com.
*/
const GH = {
  owner: null,
  repo: null,
  branch: "main",
  token: null,

  init(owner, repo, token, branch) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.branch = branch || "main";
  },

  _url(path) {
    return `https://api.github.com/repos/${this.owner}/${this.repo}${path}`;
  },

  _headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
    };
  },

  // Lê um arquivo do repositório. Retorna {exists, sha, content} com o
  // conteúdo já decodificado como texto (UTF-8).
  async getFile(path) {
    const res = await fetch(
      this._url(`/contents/${path}?ref=${encodeURIComponent(this.branch)}`),
      { headers: this._headers() }
    );
    if (res.status === 404) return { exists: false, sha: null, content: null };
    if (!res.ok) throw new Error(`Erro ao ler ${path} (HTTP ${res.status})`);
    const json = await res.json();
    const content = decodeURIComponent(
      escape(atob((json.content || "").replace(/\n/g, "")))
    );
    return { exists: true, sha: json.sha, content };
  },

  // Cria ou atualiza um arquivo de texto (JSON, etc). Exige o sha atual
  // quando o arquivo já existe (controle de concorrência do próprio Git).
  async putFile(path, textContent, message, sha) {
    const body = {
      message,
      branch: this.branch,
      content: btoa(unescape(encodeURIComponent(textContent))),
    };
    if (sha) body.sha = sha;
    const res = await fetch(this._url(`/contents/${path}`), {
      method: "PUT",
      headers: { ...this._headers(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Falha ao salvar ${path} (HTTP ${res.status}) ${detail}`);
    }
    return res.json();
  },

  // Envia um arquivo binário (imagem) já em base64.
  async putBinaryFile(path, base64Content, message) {
    const body = { message, branch: this.branch, content: base64Content };
    const res = await fetch(this._url(`/contents/${path}`), {
      method: "PUT",
      headers: { ...this._headers(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Falha ao enviar imagem (HTTP ${res.status}) ${detail}`);
    }
    return res.json();
  },

  async deleteFile(path, message, sha) {
    const res = await fetch(this._url(`/contents/${path}`), {
      method: "DELETE",
      headers: { ...this._headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ message, sha, branch: this.branch }),
    });
    if (!res.ok) throw new Error(`Falha ao excluir ${path}`);
    return res.json();
  },

  // Verifica se o token tem permissão de escrita neste repositório.
  async checkAccess() {
    const res = await fetch(this._url(""), { headers: this._headers() });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    const perms = json.permissions || {};
    return { ok: true, canPush: !!perms.push, fullName: json.full_name };
  },
};
