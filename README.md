# Site — Colégio Estadual do Campo Irmã Ambrosia Sabatovish

Site institucional real e funcional, feito para rodar **100% no GitHub**
(GitHub Pages + GitHub como armazenamento de conteúdo e imagens), sem
precisar de servidor, banco de dados externo ou custo de hospedagem.

Leia este arquivo antes de publicar — ele explica como o sistema funciona
e o passo a passo para colocar no ar.

---

## 1. Como este site funciona (leia antes de tudo)

Você pediu hospedagem no GitHub. O GitHub Pages só serve arquivos
estáticos (HTML/CSS/JS) — ele não roda um backend, não tem banco de dados
e não guarda senhas com segurança. Para que o painel administrativo fosse
**real** (e não uma simulação) dentro dessa limitação, a arquitetura é:

- **"Banco de dados"** → arquivos JSON dentro da pasta `data/`. Cada
  notícia, evento, aviso etc. é um registro nesses arquivos. Isso tem uma
  vantagem: todo o histórico de alterações já fica versionado no Git.
- **"Backend"** → o próprio GitHub. Publicar conteúdo = o painel faz um
  **commit real** no seu repositório usando a API do GitHub, diretamente
  do navegador (a API do GitHub aceita chamadas autenticadas via CORS,
  então não existe servidor intermediário).
- **"Login"** → em vez de usuário e senha (que exigiriam um servidor para
  guardar com segurança), o administrador entra com um **GitHub Personal
  Access Token** com permissão de escrita neste repositório. É uma
  autenticação real, garantida pelo próprio GitHub — só quem tiver um
  token válido consegue publicar qualquer coisa.
- **Imagens** → enviadas pelo painel vão direto para a pasta `uploads/`
  do repositório via commit. Não existe passo manual de "subir pro
  GitHub" porque, nessa arquitetura, o GitHub já é o destino final.

Tudo o que foi pedido em "regra mais importante" foi seguido: todo botão
do painel faz uma ação real (cria, edita, publica ou exclui de verdade no
repositório).

---

## 2. Passo a passo para publicar

### 2.1. Criar o repositório
1. Crie um repositório novo no GitHub (pode ser público ou privado).
2. Envie todos os arquivos desta pasta para a raiz do repositório
   (pela interface web do GitHub — arraste os arquivos — ou por
   `git add . && git commit -m "Site inicial" && git push`).

### 2.2. Configurar o repositório no código (uma vez só)
Abra `assets/js/site-config.js` e preencha:
```js
const SITE_CONFIG = {
  owner: "seu-usuario-github",
  repo: "nome-do-repositorio",
  branch: "main",
};
```
Suba essa alteração para o GitHub.

### 2.3. Ativar o GitHub Pages
No repositório: **Settings → Pages → Build and deployment → Source:
"Deploy from a branch" → Branch: `main` / `root`** → Save. Em alguns
minutos o site estará em `https://seu-usuario.github.io/nome-do-repositorio/`.

### 2.4. Criar seu token de acesso (para o painel)
1. Acesse [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).
2. Escolha **Fine-grained token**, dê um nome, defina uma validade.
3. Em "Repository access", selecione **Only select repositories** e
   escolha este repositório.
4. Em "Permissions", dê a `Contents` permissão **Read and write**.
5. Gere o token e guarde-o em local seguro (ele só aparece uma vez).

### 2.5. Entrar no painel
Acesse `https://seu-usuario.github.io/nome-do-repositorio/admin/` e cole
o token. Ele fica salvo só no seu navegador (sessionStorage) e some ao
fechar a aba — em nenhum momento ele é gravado no repositório.

### 2.6. Preencher o conteúdo real
Todo texto que não foi informado no pedido original aparece como
`[INSERIR INFORMAÇÃO]` — nada foi inventado. Substitua tudo isso em
**Painel → Configurações** (endereço, telefone, e-mail, redes sociais,
texto "Sobre o colégio") e em **Painel → Calendário escolar** (datas do
ano letivo — é isso que alimenta o contador da Home).

### 2.7. Formulário de contato (opcional, mas recomendado)
Um site 100% estático não consegue *receber* o envio de um formulário
sozinho. A solução padrão do mercado é usar um serviço gratuito só para
essa parte:
1. Crie uma conta gratuita em [formspree.io](https://formspree.io) (ou
   [web3forms.com](https://web3forms.com)).
2. Copie a URL/endpoint do formulário.
3. Cole em **Painel → Configurações → Endpoint do formulário de contato**.
Enquanto isso não for feito, o formulário cai automaticamente em um link
de e-mail (`mailto:`) como alternativa — ele continua funcionando, só que
abrindo o app de e-mail da pessoa.

---

## 3. Quem pode publicar (colaboradores)

Qualquer pessoa com um token válido com permissão de escrita neste
repositório consegue usar o painel. Para controlar isso:
- **Settings → Collaborators and teams**: adicione só quem for
  administrar o conteúdo, e remova quem não deveria ter acesso.
- Cada pessoa deve gerar o **seu próprio token** (não compartilhe o
  mesmo token entre várias pessoas) — assim dá pra revogar o acesso de
  alguém sem afetar os demais.
- Se preferir mais privacidade, o repositório pode ficar **privado** —
  o site publicado pelo GitHub Pages continua público normalmente.

---

## 4. Editar o código

Não existe build, compilador ou dependências para instalar — é HTML, CSS
e JavaScript puros. Para alterar qualquer coisa:
1. Abra a pasta em qualquer editor (VS Code, por exemplo).
2. Edite o arquivo desejado.
3. Suba a alteração pro GitHub (`git push` ou pela interface web).
O GitHub Pages atualiza o site automaticamente em cerca de 1 minuto.

---

## 5. Estrutura de pastas

```
index.html, o-colegio.html, noticias.html, noticia.html,
eventos.html, projetos.html, projeto.html, galeria.html,
videos.html, contato.html        → páginas públicas
assets/css/style.css             → todo o design (cores, tipografia, layout)
assets/js/site-config.js         → owner/repo do GitHub (editar 1x)
assets/js/github-api.js          → camada de acesso à API do GitHub
assets/js/auth.js                → sessão do painel (token)
assets/js/helpers.js             → utilidades (markdown, datas, upload, toasts)
assets/js/components.js          → cabeçalho, rodapé, menu, animações
assets/js/countdown.js           → contador regressivo do fim das aulas
assets/js/page-*.js              → lógica de cada página pública
data/*.json                      → todo o conteúdo do site ("banco de dados")
uploads/                         → imagens enviadas pelo painel
admin/                           → painel administrativo completo
```

## 6. Campos de conteúdo (equivalente às "tabelas" pedidas)

Cada arquivo em `data/` é uma coleção, com os campos abaixo:

- **news.json**: title, summary, content, coverImage, category, author, date, published
- **notices.json**: title, message, date, priority, image, link, expirationDate
- **events.json**: name, date, time, location, description, image, link
- **projects.json**: title, description, image, date, teachers, students (gallery/videos podem ser adicionados manualmente ao registro JSON — ver seção 7)
- **gallery.json**: álbuns, cada um com title, description e uma lista de images (url, caption)
- **videos.json**: title, url (YouTube/Vimeo), description, category, date
- **calendar.json**: startDate, endDate, recessStart, recessReturn, countMode, excludedDates, otherPeriods
- **settings.json**: identidade, contato, redes sociais, textos, cards da Home, imagem principal (com histórico para "restaurar imagem anterior")

---

## 7. Limitações conhecidas (honestidade sobre o que ficou de fora)

- **Login por token, não usuário/senha**: é a forma segura de autenticar
  num site sem servidor. Cada admin deve ter seu próprio token.
- **Contador de "dias letivos"**: já funciona (desconta fins de semana e
  as datas marcadas como não letivas em Calendário escolar), mas é um
  cálculo simples — não importa feriados nacionais automaticamente.
- **Galeria/vídeos dentro de um projeto**: o formulário de Projetos cobre
  título, descrição, imagem, data, professores e alunos. Se quiser anexar
  uma galeria ou vídeos a um projeto específico, isso pode ser adicionado
  editando o registro em `data/projects.json` diretamente (campos
  `"gallery": ["uploads/foto.jpg"]` e `"videos": ["https://..."]`) — a
  página pública já sabe exibir isso, só falta um editor visual para eles
  no painel.
- **Notícias/projetos usam `?id=`** em vez de uma URL própria por artigo
  — mais simples de manter sem servidor, mas menos ideal para SEO
  individual de cada notícia. Dá para evoluir depois com um gerador de
  site estático, se precisar.
- **Estatísticas de visitantes**: não construímos um contador próprio —
  o painel linka direto para **Insights → Traffic** do seu repositório no
  GitHub, que já mostra isso de graça.
- **Edição simultânea**: como o "banco de dados" é um arquivo por
  coleção, dois administradores salvando ao mesmo tempo podem gerar um
  conflito de versão (raro em uma escola pequena, mas pode acontecer).

---

## 8. Segurança

- O token nunca é gravado no código nem no repositório — fica só na
  sessionStorage do navegador de quem faz login, e some ao fechar a aba.
- Recomendamos sempre um **fine-grained token** com acesso restrito a
  este único repositório e só à permissão `Contents`.
- Todo conteúdo digitado (Markdown) passa por um escape de HTML antes de
  virar página, prevenindo injeção de scripts.
- Upload de imagem valida formato (JPG/PNG/WEBP/GIF) e tamanho (até 5MB)
  antes de enviar.
