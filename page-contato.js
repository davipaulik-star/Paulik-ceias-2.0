(async function () {
  const settings = await bootPublicChrome();
  initReveal();

  document.getElementById("contact-address").textContent = settings.address || "[INSERIR ENDEREÇO]";
  document.getElementById("contact-phone").textContent = settings.phone || "[INSERIR TELEFONE]";
  document.getElementById("contact-phone").href = "tel:" + (settings.phone || "");
  document.getElementById("contact-email").textContent = settings.email || "[INSERIR E-MAIL]";
  document.getElementById("contact-email").href = "mailto:" + (settings.email || "");
  document.getElementById("contact-hours").textContent = settings.officeHours || "[INSERIR HORÁRIO DE ATENDIMENTO]";

  const mapWrap = document.getElementById("contact-map");
  if (settings.mapEmbedUrl) {
    mapWrap.innerHTML = `<iframe src="${escapeHtml(settings.mapEmbedUrl)}" style="width:100%;border:0;border-radius:14px;min-height:280px" loading="lazy" title="Mapa de localização"></iframe>`;
  } else {
    mapWrap.innerHTML = `<div class="card muted" style="text-align:center">Mapa ainda não configurado pelo painel administrativo.</div>`;
  }

  const socialRoot = document.getElementById("contact-social");
  const links = [
    settings.facebook ? { label: "Facebook", href: settings.facebook } : null,
    settings.instagram ? { label: "Instagram", href: settings.instagram } : null,
    settings.youtube ? { label: "YouTube", href: settings.youtube } : null,
    settings.whatsapp ? { label: "WhatsApp", href: settings.whatsapp } : null,
  ].filter(Boolean);
  socialRoot.innerHTML = links.length
    ? links.map((l) => `<li><a href="${escapeHtml(l.href)}" target="_blank" rel="noopener">${l.label}</a></li>`).join("")
    : `<li class="muted">Redes sociais ainda não configuradas.</li>`;

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("contact-feedback");
  const endpoint = settings.formEndpoint || "";
  const endpointReady = /^https?:\/\//.test(endpoint);

  if (!endpointReady) {
    document.getElementById("contact-form-note").textContent =
      "O envio pelo formulário ainda não foi configurado. Fale conosco pelo telefone ou e-mail ao lado enquanto isso é configurado no painel administrativo.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!endpointReady) {
      const subject = encodeURIComponent(form.subject.value || "Contato pelo site");
      const body = encodeURIComponent(`${form.message.value}\n\n— ${form.name.value} (${form.email.value})`);
      location.href = `mailto:${settings.email || ""}?subject=${subject}&body=${body}`;
      return;
    }
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          subject: form.subject.value,
          message: form.message.value,
        }),
      });
      if (!res.ok) throw new Error("Falha no envio");
      feedback.textContent = "Mensagem enviada com sucesso. Responderemos em breve.";
      feedback.className = "muted";
      form.reset();
    } catch (err) {
      feedback.textContent = "Não foi possível enviar agora. Tente novamente ou use o telefone/e-mail ao lado.";
      feedback.className = "muted";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar mensagem";
    }
  });
})();
