const API_URL = window.location.origin;

async function encurtarLink() {
  const input = document.getElementById("originalUrl");
  const btnShorten = document.getElementById("btnShorten");
  const btnLoading = document.getElementById("btnLoading");
  const btnText = document.getElementById("btnText");
  const btnIcon = btnShorten.querySelector(".btn-icon");
  const errorMsg = document.getElementById("errorMsg");
  const resultSection = document.getElementById("resultSection");
  const originalUrl = input.value.trim();
  const customSlug = document.getElementById("customSlug").value.trim();
  const ttlValue = document.getElementById("ttlSelect").value;

  errorMsg.classList.remove("show");
  resultSection.classList.remove("show");

  if (!originalUrl) {
    showError("Insira uma URL para continuar.");
    return;
  }

  try {
    new URL(originalUrl);
  } catch {
    showError("URL inválida. Exemplo: https://exemplo.com");
    return;
  }

  if (customSlug && !/^[a-zA-Z0-9-]{3,20}$/.test(customSlug)) {
    showError("Slug inválido. Use 3-20 caracteres alfanuméricos ou hífens.");
    return;
  }

  btnShorten.disabled = true;
  if (btnIcon) btnIcon.style.display = "none";
  btnLoading.style.display = "block";
  btnText.textContent = "Aguarde...";

  try {
    const body = { url_original: originalUrl };
    if (customSlug) body.slug = customSlug;
    if (ttlValue) body.ttl = parseInt(ttlValue);

    const response = await fetch(`${API_URL}/encurtar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.status === 409) {
      showError("Este slug já está em uso. Escolha outro.");
      return;
    }
    if (!response.ok) throw new Error("Server error");

    const data = await response.json();

    document.getElementById("displayOriginal").textContent = originalUrl;
    document.getElementById("shortUrl").textContent = data.url_encurtada;

    const expiryEl = document.getElementById("resultExpiry");
    if (data.expires_at) {
      const date = new Date(data.expires_at * 1000);
      expiryEl.textContent = `// expira em ${date.toLocaleString("pt-BR")}`;
    } else {
      expiryEl.textContent = "// sem expiração";
    }

    const copyBtn = document.getElementById("btnCopy");
    copyBtn.classList.remove("copied");
    document.getElementById("copyText").textContent = "Copiar";

    void resultSection.offsetWidth;
    resultSection.classList.add("show");
  } catch {
    showError("Servidor indisponível. Verifique a Conexão.");
  } finally {
    btnShorten.disabled = false;
    if (btnIcon) btnIcon.style.display = "";
    btnLoading.style.display = "none";
    btnText.textContent = "Encurtar";
  }
}

function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = msg;
  el.classList.remove("show");
  void el.offsetWidth; // force reflow so the animation replays
  el.classList.add("show");
}

function copiarLink() {
  const url = document.getElementById("shortUrl").textContent;
  const btn = document.getElementById("btnCopy");
  const copyText = document.getElementById("copyText");

  navigator.clipboard
    .writeText(url)
    .then(() => {
      btn.classList.add("copied");
      copyText.textContent = "Copiado!";

      setTimeout(() => {
        btn.classList.remove("copied");
        copyText.textContent = "Copiar";
      }, 2000);
    })
    .catch(() => {
      showError("Não foi possível copiar. Copie manualmente.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("originalUrl");
  const btnShorten = document.getElementById("btnShorten");
  const btnCopy = document.getElementById("btnCopy");

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") encurtarLink();
  });

  btnShorten.addEventListener("click", encurtarLink);
  btnCopy.addEventListener("click", copiarLink);
});
