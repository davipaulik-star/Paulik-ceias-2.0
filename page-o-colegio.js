(async function () {
  const settings = await bootPublicChrome();
  initReveal();
  document.getElementById("about-content").innerHTML = mdToHtml(settings.aboutText || "");
})();
