(function () {
  // Se já existe uma sessão válida, pula direto para o dashboard.
  const existing = AUTH.get();
  if (existing) {
    GH.init(SITE_CONFIG.owner, SITE_CONFIG.repo, existing, SITE_CONFIG.branch);
    GH.checkAccess().then((access) => {
      if (access.ok && access.canPush) location.href = "dashboard.html";
    });
  }

  const configWarning = document.getElementById("config-warning");
  if (SITE_CONFIG.owner.startsWith("[INSERIR") || SITE_CONFIG.repo.startsWith("[INSERIR")) {
    configWarning.hidden = false;
  }

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = document.getElementById("login-token").value.trim();
    const errorBox = document.getElementById("login-error");
    const btn = document.getElementById("login-submit");
    errorBox.hidden = true;
    if (!token) return;
    btn.disabled = true;
    btn.textContent = "Verificando...";
    try {
      GH.init(SITE_CONFIG.owner, SITE_CONFIG.repo, token, SITE_CONFIG.branch);
      const access = await GH.checkAccess();
      if (!access.ok) {
        throw new Error("Não foi possível acessar o repositório com este token. Confira o token e as configurações em site-config.js.");
      }
      if (!access.canPush) {
        throw new Error("Este token não tem permissão de escrita neste repositório.");
      }
      AUTH.save(token);
      location.href = "dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = "Entrar";
    }
  });
})();
