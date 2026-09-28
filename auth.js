/*
  "Login" do painel = fornecer um GitHub Personal Access Token com
  permissão de escrita neste repositório. Não existe servidor para guardar
  senhas com segurança em um site 100% estático — então a autenticação real
  é a do próprio GitHub. O token só existe na sessionStorage do navegador
  do administrador (some ao fechar a aba) e nunca é gravado no repositório
  nem enviado a qualquer lugar além de api.github.com.
*/
const AUTH = {
  KEY: "cesias_admin_token",
  save(token) {
    sessionStorage.setItem(this.KEY, token);
  },
  get() {
    return sessionStorage.getItem(this.KEY);
  },
  clear() {
    sessionStorage.removeItem(this.KEY);
  },
};

// basePrefix: '' quando a página já está em /admin/, aponta sempre para
// admin/index.html em caso de falha.
async function requireAuth() {
  const token = AUTH.get();
  if (!token) {
    location.href = "index.html";
    return false;
  }
  GH.init(SITE_CONFIG.owner, SITE_CONFIG.repo, token, SITE_CONFIG.branch);
  try {
    const access = await GH.checkAccess();
    if (!access.ok || !access.canPush) {
      AUTH.clear();
      alert(
        "Este token não tem permissão de publicação neste repositório. Faça login novamente."
      );
      location.href = "index.html";
      return false;
    }
    return true;
  } catch (e) {
    alert("Não foi possível validar o acesso ao GitHub agora. Tente novamente.");
    location.href = "index.html";
    return false;
  }
}
