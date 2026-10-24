/* Medición: pega aquí tus códigos cuando los tengas (déjalos vacíos para no medir) */
const META_PIXEL_ID = "";   // ej: "123456789012345"
const GA4_ID = "";          // ej: "G-XXXXXXXXXX"

(function () {
  if (window.self !== window.top || location.protocol === "file:") return;
  if (GA4_ID) {
    const g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID; document.head.appendChild(g);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", GA4_ID);
  }
  if (META_PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", META_PIXEL_ID); fbq("track", "PageView");
  }
})();
function track(name) {
  try { if (window.fbq) fbq("track", name); if (window.gtag) gtag("event", name === "Lead" ? "generate_lead" : name); } catch (e) {}
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Reloj en vivo (Santiago) */
function tick() {
  const t = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santiago" }).format(new Date());
  $$("[data-clock]").forEach((el) => (el.textContent = t + " en Santiago"));
}
tick(); setInterval(tick, 15000);

/* Disponibilidad: próximo mes */
(function () {
  const d = new Date(); d.setMonth(d.getMonth() + 1, 1);
  const m = new Intl.DateTimeFormat("es-CL", { month: "long", timeZone: "America/Santiago" }).format(d);
  $$("[data-avail]").forEach((el) => (el.textContent = "Agenda abierta para " + m));
})();

/* Menú móvil */
const sheet = $("#sheet");
function setSheet(open) {
  if (!sheet) return;
  sheet.classList.toggle("open", open);
  sheet.setAttribute("aria-hidden", String(!open));
  $$("[data-menu]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
  document.body.style.overflow = open ? "hidden" : "";
}
$$("[data-menu]").forEach((b) => b.addEventListener("click", () => setSheet(true)));
$$("[data-close]").forEach((b) => b.addEventListener("click", () => setSheet(false)));
if (sheet) sheet.addEventListener("click", (e) => { if (e.target === sheet) setSheet(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setSheet(false); });

/* Formulario de contacto (Netlify Forms) */
const form = $("#f");
if (form) {
  const sel = $("#f-s");
  try {
    const s = new URLSearchParams(location.search).get("s");
    if (s) { const o = [...sel.options].find((x) => x.text === s); if (o) sel.value = o.text; }
  } catch (e) {}
  form.addEventListener("submit", (e) => {
    track("Lead");
    const preview = window.self !== window.top || location.protocol === "file:";
    if (preview) {
      e.preventDefault();
      $("#f-note").textContent = "Vista previa: el formulario envía las solicitudes cuando el sitio está publicado en Netlify.";
    }
  });
}

/* Fondo aurora (líneas de contorno en movimiento) */
$$("canvas[data-aurora]").forEach((cv) => {
  const ctx = cv.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, dpr, t = Math.random() * 100;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const lines = 26;
    for (let i = 0; i < lines; i++) {
      const p = i / lines;
      ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 14) {
        const nx = x / w;
        const y = h * (0.12 + p * 0.9)
          + Math.sin(nx * 5.2 + t * 0.35 + p * 3.1) * h * 0.05
          + Math.sin(nx * 11 - t * 0.22 + p * 7) * h * 0.018
          - Math.exp(-Math.pow((nx - 0.72) * 3.2, 2)) * h * 0.16 * (1 - p);
        x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const a = 0.05 + 0.22 * Math.pow(1 - Math.abs(p - 0.35) * 1.4, 2);
      ctx.strokeStyle = `rgba(201,128,91,${Math.max(a, 0.03).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };
  let raf = 0;
  const loop = () => { t += 0.006; draw(); raf = requestAnimationFrame(loop); };
  const start = () => { if (!raf && !still) raf = requestAnimationFrame(loop); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  size(); addEventListener("resize", () => { size(); draw(); });
  draw();
  if (!still) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(cv);
    } else {
      start();
    }
  }
});

/* Clic en Instagram cuenta como contacto */
$$('a[href*="ig.me"]').forEach((a) => a.addEventListener("click", () => track("Contact")));


/* ===== Estilo v2: scroll suave + aparición al bajar + parallax (oct 2026) ===== */
(function () {
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SEL = "main .sec .badge-row, main .sec .h2, main .sec .lead2, .scard, .cmini, .case, .steps li, .pains li, .checks li, .rubros li, .pack, .offer, .level, .post-card, .faq-group, .channel, .cta h2, .cta p, .launch-in > *, [data-reveal]";
  var els = $$(SEL).filter(function (e) { return !e.closest(".hero, .phero, .sheet"); });
  els.forEach(function (e) { e.classList.add("rv"); });
  if (!still && "IntersectionObserver" in window) {
    document.documentElement.classList.add("rv-on");
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = [].slice.call(el.parentNode.children).filter(function (c) { return c.classList.contains("rv"); });
        el.style.transitionDelay = Math.min(Math.max(0, sib.indexOf(el)) * 80, 400) + "ms";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  } else { els.forEach(function (e) { e.classList.add("in"); }); }

  if (still || typeof Lenis === "undefined" || window.self !== window.top) return;
  var lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
  var par = $$("[data-par]");
  function frame(time) {
    lenis.raf(time);
    var vh = innerHeight;
    par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = "translateY(" + (-6 - p * 6).toFixed(2) + "%)";
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  $$('a[href*="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var u = new URL(a.href, location.href);
      if (u.pathname !== location.pathname || !u.hash) return;
      var t = document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -100 }); history.replaceState(null, "", u.hash); }
    });
  });
  if (sheet) new MutationObserver(function () { sheet.classList.contains("open") ? lenis.stop() : lenis.start(); }).observe(sheet, { attributes: true, attributeFilter: ["class"] });
})();


/* Carrusel de trabajos: flechas, arrastre con mouse y barra de progreso (sin movimiento automático) */
$$("[data-slider]").forEach(function (sl) {
  var tr = $(".track", sl), slides = $$(".slide", tr), bar = $(".sl-bar i", sl), cnt = $(".sl-count", sl);
  var prev = $("[data-prev]", sl), next = $("[data-next]", sl);
  function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : tr.clientWidth; }
  function upd() {
    var max = tr.scrollWidth - tr.clientWidth, x = tr.scrollLeft;
    var i = Math.min(slides.length - 1, Math.round(x / step()));
    if (x >= max - 4) i = slides.length - 1;
    cnt.textContent = String(i + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    bar.style.width = (max > 0 ? Math.max(8, (x / max) * 100) : 100) + "%";
    prev.disabled = x <= 4; next.disabled = x >= max - 4;
  }
  prev.addEventListener("click", function () { tr.scrollBy({ left: -step(), behavior: "smooth" }); });
  next.addEventListener("click", function () { tr.scrollBy({ left: step(), behavior: "smooth" }); });
  tr.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
  tr.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); next.click(); } if (e.key === "ArrowLeft") { e.preventDefault(); prev.click(); } });
  var down = false, sx = 0, sl0 = 0, moved = false;
  tr.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl0 = tr.scrollLeft; });
  addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; tr.classList.add("drag"); } if (moved) tr.scrollLeft = sl0 - dx; });
  addEventListener("pointerup", function () { if (!down) return; down = false; if (moved) { var s = step(); tr.classList.remove("drag"); tr.scrollTo({ left: Math.round(tr.scrollLeft / s) * s, behavior: "smooth" }); } });
  tr.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
});
