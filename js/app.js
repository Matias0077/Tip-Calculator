/* ===============================
   CONFIGURACIÓN MONEDA
================================ */
const currencyByCountry = {
  AR: { code: "ARS", locale: "es-AR" },
  US: { code: "USD", locale: "en-US" },
  GB: { code: "GBP", locale: "en-GB" },
  ES: { code: "EUR", locale: "es-ES" },
  PT: { code: "EUR", locale: "pt-PT" }, 
  BR: { code: "BRL", locale: "pt-BR" },
  MX: { code: "MXN", locale: "es-MX" },
  CL: { code: "CLP", locale: "es-CL" }
};

function detectCountry() {
  const lang = navigator.language || "en-US";
  const parts = lang.split("-");
  if (parts.length === 2) {
    return parts[1].toUpperCase();
  }
  return "US"; // fallback
}

// Obtiene configuración de moneda
function getCurrencyConfig() {
  // Prioriza selección manual
  const selectedCurrency = localStorage.getItem("selectedCurrency");
  if (selectedCurrency && Object.values(currencyByCountry).some(c => c.code === selectedCurrency)) {
    return Object.values(currencyByCountry).find(c => c.code === selectedCurrency);
  }

  const savedCountry = localStorage.getItem("country");
  const country = savedCountry || detectCountry();
  return currencyByCountry[country] || currencyByCountry.US;
}

/* ===============================
   TRADUCCIONES
================================ */
const translations = {
  en: {
    title: "Tip Calculator",
    darkModeOn: "🌙 Dark Mode",
    darkModeOff: "🌞 Light Mode",
    billAmount: "Bill Amount",
    tipPercentage: "Tip Percentage (%)",
    splitBetween: "Split Between",
    tip: "Tip",
    total: "Total",
    perPerson: "Per Person",
    adBanner: "Ad Banner",
    footer: "© 2026 Tip Calculator"
  },
  es: {
    title: "Calculadora de Propinas",
    darkModeOn: "🌙 Modo Oscuro",
    darkModeOff: "🌞 Modo Claro",
    billAmount: "Monto de la Cuenta",
    tipPercentage: "Porcentaje de Propina (%)",
    splitBetween: "Dividir Entre",
    tip: "Propina",
    total: "Total",
    perPerson: "Por Persona",
    adBanner: "Espacio Publicitario",
    footer: "© 2026 Calculadora de Propinas"
  },
  pt: {
    title: "Calculadora de Gorjetas",
    darkModeOn: "🌙 Modo Escuro",
    darkModeOff: "🌞 Modo Claro",
    billAmount: "Valor da Conta",
    tipPercentage: "Porcentagem da Gorjeta (%)",
    splitBetween: "Dividir Entre",
    tip: "Gorjeta",
    total: "Total",
    perPerson: "Por Pessoa",
    adBanner: "Espaço Publicitário",
    footer: "© 2026 Calculadora de Gorjetas"
  }
};

/* ===============================
   IDIOMA
================================ */
function applyLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang]?.[key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.title = translations[lang].title;
}

function updateThemeButton(lang) {
  const themeToggle = document.getElementById("themeToggle");
  const isDark = document.body.classList.contains("dark");
  const key = isDark ? "darkModeOff" : "darkModeOn";
  themeToggle.textContent = translations[lang][key];
}

function setLanguage(lang) {
  applyLanguage(lang);
  updateThemeButton(lang);
  localStorage.setItem("lang", lang);
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

/* ===============================
   FORMATO MONEDA
================================ */
function formatCurrency(value) {
  const { code, locale } = getCurrencyConfig();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2
  }).format(value);
}

/* ===============================
   APP PRINCIPAL
================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Guardar país detectado si no hay valor
  if (!localStorage.getItem("country")) {
    localStorage.setItem("country", detectCountry());
  }

  /* === ELEMENTOS === */
  const billInput = document.getElementById("bill");
  const tipInput = document.getElementById("tip");
  const peopleInput = document.getElementById("people");

  const tipAmount = document.getElementById("tipAmount");
  const totalAmount = document.getElementById("totalAmount");
  const perPerson = document.getElementById("perPerson");

  const tipButtons = document.querySelectorAll(".tip-buttons button");
  const themeToggle = document.getElementById("themeToggle");
  const resultsBox = document.querySelector(".results");

  // ===== Botones de moneda =====
const currencyButtons = document.querySelectorAll(".currency-btn");
const resetCurrencyBtn = document.getElementById("resetCurrency");

currencyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.currency;

    // Guardar selección manual
    localStorage.setItem("selectedCurrency", selected);

    // Actualizar visualmente los botones
    currencyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Recalcular valores
    calculate();
  });
});

// Inicializar moneda activa según localStorage
const savedCurrency = localStorage.getItem("selectedCurrency");
if (savedCurrency) {
  currencyButtons.forEach(b => {
    b.classList.toggle("active", b.dataset.currency === savedCurrency);
  });
}

// Botón reiniciar moneda automática
if (resetCurrencyBtn) {
  resetCurrencyBtn.addEventListener("click", () => {
    localStorage.removeItem("selectedCurrency");
    currencyButtons.forEach(b => b.classList.remove("active"));

    // Activar moneda detectada automáticamente
    const autoCurrency = getCurrencyConfig().code;
    currencyButtons.forEach(b => {
      b.classList.toggle("active", b.dataset.currency === autoCurrency);
    });

    calculate();
  });
}


  /* === IDIOMA INICIAL === */
  const savedLang = localStorage.getItem("lang");
  const browserLang = navigator.language.startsWith("es")
    ? "es"
    : navigator.language.startsWith("pt")
    ? "pt"
    : "en";
  const currentLang = savedLang || browserLang;
  setLanguage(currentLang);

  /* === FUNCIÓN DE CÁLCULO === */
  function calculate() {
    const bill = parseFloat(billInput.value) || 0;
    const tipPercent = parseFloat(tipInput.value) || 0;
    const people = parseInt(peopleInput.value) || 1;

    const tipValue = bill * tipPercent / 100;
    const total = bill + tipValue;
    const each = total / people;

    tipAmount.textContent = formatCurrency(tipValue);
    totalAmount.textContent = formatCurrency(total);
    perPerson.textContent = formatCurrency(each);

    resultsBox.classList.add("animate");
    setTimeout(() => resultsBox.classList.remove("animate"), 200);
  }

  calculate();

  /* === EVENTOS INPUTS === */
  billInput.addEventListener("input", calculate);
  tipInput.addEventListener("input", calculate);
  peopleInput.addEventListener("input", calculate);

  tipButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tipButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tipInput.value = btn.dataset.tip;
      calculate();
    });
  });

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
      calculate();
    });
  });

  /* === MODO OSCURO === */
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  updateThemeButton(currentLang);
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
    updateThemeButton(localStorage.getItem("lang") || "en");
  });
});
