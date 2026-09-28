(async function () {
  const ok = await requireAuth();
  if (!ok) return;
  renderAdminChrome("calendario");

  let sha = null;
  let cal = {};

  function renderPeriodsList() {
    const root = document.getElementById("other-periods-list");
    root.innerHTML = (cal.otherPeriods || [])
      .map(
        (p, i) => `
      <div class="repeatable-row">
        <input type="text" placeholder="Nome do período" value="${escapeHtml(p.label || "")}" data-period-label="${i}">
        <input type="date" value="${p.date || ""}" data-period-date="${i}">
        <button type="button" class="btn btn-sm btn-danger" data-period-remove="${i}">Remover</button>
      </div>`
      )
      .join("");
    root.querySelectorAll("[data-period-label]").forEach((el) => el.addEventListener("input", () => (cal.otherPeriods[Number(el.dataset.periodLabel)].label = el.value)));
    root.querySelectorAll("[data-period-date]").forEach((el) => el.addEventListener("input", () => (cal.otherPeriods[Number(el.dataset.periodDate)].date = el.value)));
    root.querySelectorAll("[data-period-remove]").forEach((el) =>
      el.addEventListener("click", () => {
        cal.otherPeriods.splice(Number(el.dataset.periodRemove), 1);
        renderPeriodsList();
      })
    );
  }

  function renderExcludedList() {
    const root = document.getElementById("excluded-dates-list");
    root.innerHTML = (cal.excludedDates || [])
      .map(
        (d, i) => `
      <div class="repeatable-row">
        <input type="date" value="${d}" data-excluded="${i}">
        <button type="button" class="btn btn-sm btn-danger" data-excluded-remove="${i}">Remover</button>
      </div>`
      )
      .join("");
    root.querySelectorAll("[data-excluded]").forEach((el) => el.addEventListener("input", () => (cal.excludedDates[Number(el.dataset.excluded)] = el.value)));
    root.querySelectorAll("[data-excluded-remove]").forEach((el) =>
      el.addEventListener("click", () => {
        cal.excludedDates.splice(Number(el.dataset.excludedRemove), 1);
        renderExcludedList();
      })
    );
  }

  function toggleExcludedSection() {
    document.getElementById("excluded-dates-section").hidden = document.getElementById("field-countMode").value !== "letivos";
  }

  document.getElementById("add-period-btn").onclick = () => {
    cal.otherPeriods = cal.otherPeriods || [];
    cal.otherPeriods.push({ label: "", date: "" });
    renderPeriodsList();
  };
  document.getElementById("add-excluded-btn").onclick = () => {
    cal.excludedDates = cal.excludedDates || [];
    cal.excludedDates.push("");
    renderExcludedList();
  };

  async function load() {
    const file = await GH.getFile("data/calendar.json");
    cal = file.exists ? JSON.parse(file.content || "{}") : {};
    sha = file.sha;
    document.getElementById("field-startDate").value = cal.startDate || "";
    document.getElementById("field-endDate").value = cal.endDate || "";
    document.getElementById("field-recessStart").value = cal.recessStart || "";
    document.getElementById("field-recessReturn").value = cal.recessReturn || "";
    document.getElementById("field-countMode").value = cal.countMode || "corridos";
    cal.otherPeriods = cal.otherPeriods || [];
    cal.excludedDates = cal.excludedDates || [];
    renderPeriodsList();
    renderExcludedList();
    toggleExcludedSection();
  }

  document.getElementById("field-countMode").addEventListener("change", toggleExcludedSection);

  document.getElementById("calendar-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    cal.startDate = document.getElementById("field-startDate").value;
    cal.endDate = document.getElementById("field-endDate").value;
    cal.recessStart = document.getElementById("field-recessStart").value;
    cal.recessReturn = document.getElementById("field-recessReturn").value;
    cal.countMode = document.getElementById("field-countMode").value;
    const btn = document.getElementById("calendar-save-btn");
    btn.disabled = true;
    btn.textContent = "Salvando...";
    try {
      const result = await GH.putFile("data/calendar.json", JSON.stringify(cal, null, 2), "Atualiza calendário escolar", sha);
      sha = result.content.sha;
      toast("Calendário publicado com sucesso. O contador da Home já reflete a nova data.");
    } catch (err) {
      toast("Não foi possível salvar: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Salvar calendário";
    }
  });

  await load();
})();
