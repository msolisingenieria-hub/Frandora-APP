(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var slug    = script.dataset.slug    || script.getAttribute("data-slug");
  var mode    = script.dataset.mode    || "popup";  // "popup" | "inline"
  var btnText = script.dataset.label   || "Reservar ahora";
  var btnColor = script.dataset.color  || "#0D1B2A";
  var baseUrl = "https://" + slug + ".frandora.cl";
  var iframeUrl = baseUrl + "?widget=1";

  if (!slug) {
    console.warn("[Frandora Widget] Falta el atributo data-slug.");
    return;
  }

  // ── Estilos comunes ───────────────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = [
    ".frandora-btn{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;",
    "border-radius:12px;border:none;font-family:system-ui,sans-serif;font-size:14px;",
    "font-weight:600;color:#fff;cursor:pointer;transition:filter 0.15s ease;line-height:1;}",
    ".frandora-btn:hover{filter:brightness(1.1);}",
    ".frandora-btn:active{transform:scale(0.97);}",
    ".frandora-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);",
    "z-index:999998;display:flex;align-items:flex-end;justify-content:center;",
    "opacity:0;pointer-events:none;transition:opacity .25s ease;}",
    ".frandora-overlay.open{opacity:1;pointer-events:auto;}",
    ".frandora-modal{width:100%;max-width:480px;height:92dvh;background:#fff;",
    "border-radius:24px 24px 0 0;overflow:hidden;",
    "transform:translateY(100%);transition:transform .28s cubic-bezier(.32,.72,0,1);}",
    ".frandora-overlay.open .frandora-modal{transform:translateY(0);}",
    ".frandora-close{position:absolute;top:16px;right:16px;z-index:1;border:none;",
    "background:rgba(0,0,0,.08);border-radius:50%;width:32px;height:32px;",
    "display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;}",
    ".frandora-iframe{width:100%;height:100%;border:0;}",
    ".frandora-inline{width:100%;height:700px;border:0;border-radius:16px;",
    "box-shadow:0 4px 24px rgba(13,27,42,.16);}",
  ].join("");
  document.head.appendChild(style);

  // ── Modo inline ───────────────────────────────────────────────────────────
  if (mode === "inline") {
    var iframe = document.createElement("iframe");
    iframe.src           = iframeUrl;
    iframe.className     = "frandora-inline";
    iframe.title         = "Reservar cita";
    iframe.allow         = "payment";
    iframe.loading       = "lazy";
    script.parentNode.insertBefore(iframe, script.nextSibling);

    window.FrandoraWidget = { open: function() {}, close: function() {} };
    return;
  }

  // ── Modo popup ────────────────────────────────────────────────────────────
  var btn = document.createElement("button");
  btn.className   = "frandora-btn";
  btn.style.background = btnColor;
  btn.textContent = btnText;
  script.parentNode.insertBefore(btn, script.nextSibling);

  var overlay = document.createElement("div");
  overlay.className = "frandora-overlay";

  var modal = document.createElement("div");
  modal.className = "frandora-modal";
  modal.style.position = "relative";

  var closeBtn = document.createElement("button");
  closeBtn.className   = "frandora-close";
  closeBtn.textContent = "✕";
  closeBtn.setAttribute("aria-label", "Cerrar");

  var iframeEl = document.createElement("iframe");
  iframeEl.className = "frandora-iframe";
  iframeEl.title = "Reservar cita";
  iframeEl.allow = "payment";

  modal.appendChild(closeBtn);
  modal.appendChild(iframeEl);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function openWidget() {
    if (!iframeEl.src) iframeEl.src = iframeUrl;
    document.body.style.overflow = "hidden";
    overlay.classList.add("open");
  }

  function closeWidget() {
    document.body.style.overflow = "";
    overlay.classList.remove("open");
  }

  btn.addEventListener("click", openWidget);
  closeBtn.addEventListener("click", closeWidget);
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closeWidget();
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeWidget();
  });

  window.FrandoraWidget = { open: openWidget, close: closeWidget };
})();
