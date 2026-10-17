/* login.js - halaman masuk untuk dasbor suhu.
   Login ini memeriksa username + password langsung ke broker MQTT.
   Kalau broker menolak, dasbor tidak akan pernah menerima data.
   Pasang di index.html tepat setelah tag <body>:  <script src="login.js"></script> */
(function () {
  "use strict";

  /* ===== Ubah di sini ===== */
  var APP_TITLE = "Aerofood ACS Surabaya";
  var SUBTITLE  = "Monitoring Suhu Ruangan";
  var FOOTER    = "2026©";                 // teks kecil di bawah form
  var LOGOS = [                               // taruh file gambar di folder logo/
    { src: "logo/logo-1.png", alt: "Logo 1" },
    { src: "logo/logo-2.png", alt: "Logo 2" },
    { src: "logo/logo-3.png", alt: "Logo 3" }
  ];
  var REMEMBER_DAYS = 7;                      // lama "Ingat saya"
  var MAX_TRIES = 5, LOCK_SECONDS = 30;       // jeda setelah salah berkali-kali
  /* ======================== */

  window.DASBOR_CFG = { title: APP_TITLE, logos: LOGOS };

  var CFG_KEY = "kitchen.cfg", AUTH_KEY = "kitchen.auth";
  var DEFAULT_URL = "wss://l11ff1d7.ala.us-east-1.emqxsl.com:8084/mqtt";

  function rd(st, k) { try { return st.getItem(k); } catch (e) { return null; } }
  function wr(st, k, v) { try { st.setItem(k, v); } catch (e) {} }
  function rm(st, k) { try { st.removeItem(k); } catch (e) {} }
  function readCfg() { try { return JSON.parse(rd(localStorage, CFG_KEY)) || {}; } catch (e) { return {}; } }
  function writeCfg(c) { wr(localStorage, CFG_KEY, JSON.stringify(c)); }

  function authed() {
    if (rd(sessionStorage, AUTH_KEY) === "1") return true;
    var t = parseInt(rd(localStorage, AUTH_KEY), 10);
    return !!t && Date.now() < t;
  }
  function clearCreds() {
    var c = readCfg(); c.user = ""; c.pass = ""; writeCfg(c);
    rm(sessionStorage, AUTH_KEY); rm(localStorage, AUTH_KEY);
  }
  window.dasborLogout = function () { clearCreds(); location.reload(); };

  if (authed() && readCfg().user) return;   // sudah masuk, biarkan dasbor jalan

  /* belum masuk: hapus kredensial lama supaya dasbor tidak menyambung diam-diam */
  clearCreds();

  var CSS = [
    "html.lg-on{overflow:hidden}",
    ".lg{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top)) 16px max(16px,env(safe-area-inset-bottom));background:linear-gradient(180deg,#1d2b27 0,#121212 340px);color:#fff;font-family:'Segoe UI',system-ui,sans-serif;overflow:auto}",
    ".lg *{box-sizing:border-box}",
    ".lg-card{width:100%;max-width:420px;margin:auto;padding:36px 32px 28px;border-radius:14px;background:#121212;box-shadow:0 12px 48px rgba(0,0,0,.55)}",
    ".lg-logos{display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:22px;min-height:8px}",
    ".lg-logo{height:48px;max-width:110px;padding:6px 8px;border-radius:10px;background:#fff;display:grid;place-items:center}",
    ".lg-logo img{display:block;max-height:100%;max-width:100%;object-fit:contain}",
    ".lg-mark{display:grid;place-items:center;width:56px;height:56px;margin:0 auto 18px;border-radius:50%;background:#43C48B;color:#0b1f17}",
    ".lg-mark[hidden]{display:none}",
    "h1.lg-h{margin:0 0 6px;text-align:center;font-size:1.9rem;line-height:1.15;font-weight:800;letter-spacing:-.01em}",
    ".lg-sub{margin:0 0 28px;text-align:center;color:#a7a7a7;font-size:.95rem}",
    ".lg label.f{display:block;margin:0 0 6px;font-size:.88rem;font-weight:700}",
    ".lg .fw{position:relative;margin-bottom:18px}",
    ".lg input[type=text],.lg input[type=password]{width:100%;height:48px;padding:0 14px;border-radius:8px;border:1px solid #727272;background:#121212;color:#fff;font-size:16px;outline:0}",
    ".lg input[type=password]{padding-right:48px}",
    ".lg input:hover{border-color:#fff}",
    ".lg input:focus{border-color:#fff;box-shadow:0 0 0 1px #fff}",
    ".lg .eye{position:absolute;right:4px;bottom:4px;width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:8px;background:none;color:#a7a7a7;cursor:pointer}",
    ".lg .eye:hover{color:#fff}",
    ".lg-rem{display:flex;align-items:center;gap:12px;margin:2px 0 22px;font-size:.9rem;cursor:pointer;user-select:none}",
    ".lg-rem input{position:absolute;opacity:0;pointer-events:none}",
    ".lg-sw{position:relative;width:40px;height:22px;flex:none;border-radius:11px;background:#727272;transition:background .15s}",
    ".lg-sw::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#121212;transition:transform .15s}",
    ".lg-rem input:checked+.lg-sw{background:#43C48B}",
    ".lg-rem input:checked+.lg-sw::after{transform:translateX(18px)}",
    ".lg-rem input:focus-visible+.lg-sw{outline:2px solid #fff;outline-offset:2px}",
    ".lg-go{width:100%;height:50px;border:0;border-radius:500px;background:#43C48B;color:#0b1f17;font-size:1rem;font-weight:800;cursor:pointer;transition:transform .08s,background .15s}",
    ".lg-go:hover:not(:disabled){background:#5ad69f;transform:scale(1.02)}",
    ".lg-go:disabled{opacity:.6;cursor:default}",
    ".lg-err{display:none;margin:0 0 18px;padding:11px 14px;border-radius:8px;background:#3A1D22;color:#ff9aa2;font-size:.9rem}",
    ".lg-err.on{display:block}",
    ".lg-foot{margin:26px 0 0;padding-top:18px;border-top:1px solid #2a2a2a;text-align:center;color:#8a8a8a;font-size:.8rem}",
    "@media (max-width:480px){.lg{align-items:flex-start;background:#121212}.lg-card{padding:24px 6px;box-shadow:none}}",
    "@media (prefers-reduced-motion:reduce){.lg-sw,.lg-sw::after,.lg-go{transition:none}}"
  ].join("\n");

  var EYE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var FLAKE = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function show() {
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
    document.documentElement.classList.add("lg-on");

    var logos = LOGOS.map(function (l) {
      return '<span class="lg-logo"><img src="' + esc(l.src) + '" alt="' + esc(l.alt) + '"></span>';
    }).join("");

    var root = document.createElement("div");
    root.className = "lg";
    root.innerHTML =
      '<main class="lg-card">' +
        '<div class="lg-logos">' + logos + "</div>" +
        '<div class="lg-mark" id="lgMark" hidden>' + FLAKE + "</div>" +
        '<h1 class="lg-h">Masuk ke ' + esc(APP_TITLE) + "</h1>" +
        '<p class="lg-sub">' + esc(SUBTITLE) + "</p>" +
        '<div class="lg-err" id="lgErr" role="alert"></div>' +
        '<div class="fw"><label class="f" for="lgUser">Username</label><input id="lgUser" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Username"></div>' +
        '<div class="fw"><label class="f" for="lgPass">Password</label><input id="lgPass" type="password" autocomplete="current-password" placeholder="Password">' +
          '<button class="eye" id="lgEye" type="button" aria-label="Tampilkan password">' + EYE + "</button></div>" +
        '<label class="lg-rem"><input type="checkbox" id="lgRem"><span class="lg-sw"></span>Ingat saya di perangkat ini</label>' +
        '<button class="lg-go" id="lgGo" type="button">Masuk</button>' +
        '<p class="lg-foot">' + esc(FOOTER) + "</p>" +
      "</main>";
    document.body.insertBefore(root, document.body.firstChild);

    function q(id) { return document.getElementById(id); }
    var imgs = root.querySelectorAll(".lg-logo img");
    function checkMark() { q("lgMark").hidden = !!root.querySelector(".lg-logo"); }
    Array.prototype.forEach.call(imgs, function (im) {
      im.addEventListener("error", function () { im.parentNode.remove(); checkMark(); });
    });

    var tries = 0, busy = false, lockT = 0;
    function err(m) { var e = q("lgErr"); e.textContent = m; e.classList.toggle("on", !!m); }
    function setBusy(b, t) { busy = b; var g = q("lgGo"); g.disabled = b; g.textContent = t || "Masuk"; }

    q("lgEye").addEventListener("click", function () {
      var p = q("lgPass"), s = p.type === "password";
      p.type = s ? "text" : "password";
      this.setAttribute("aria-label", s ? "Sembunyikan password" : "Tampilkan password");
    });

    function done(user, pass, remember) {
      var c = readCfg();
      c.user = user; c.pass = pass;
      if (!c.url || /^ws:\/\//i.test(c.url)) c.url = DEFAULT_URL;
      writeCfg(c);
      if (remember) wr(localStorage, AUTH_KEY, String(Date.now() + REMEMBER_DAYS * 864e5));
      else wr(sessionStorage, AUTH_KEY, "1");
      location.reload();
    }

    function attempt() {
      if (busy || Date.now() < lockT) return;
      var user = q("lgUser").value.trim(), pass = q("lgPass").value;
      if (!user || !pass) { err("Isi username dan password."); return; }
      if (typeof mqtt === "undefined") { err("Pustaka MQTT belum termuat. Muat ulang halaman."); return; }
      err(""); setBusy(true, "Memeriksa...");
      var url = readCfg().url;
      if (!url || !/^wss:\/\//i.test(url)) url = DEFAULT_URL;
      var cl, finished = false;
      function end(ok, msg) {
        if (finished) return; finished = true;
        clearTimeout(tm);
        try { cl && cl.end(true); } catch (e) {}
        if (ok) { done(user, pass, q("lgRem").checked); return; }
        tries++;
        if (msg === "auth" && tries >= MAX_TRIES) {
          tries = 0; lockT = Date.now() + LOCK_SECONDS * 1000;
          var iv = setInterval(function () {
            var s = Math.ceil((lockT - Date.now()) / 1000);
            if (s <= 0) { clearInterval(iv); err(""); setBusy(false); return; }
            err("Terlalu banyak percobaan. Coba lagi dalam " + s + " detik.");
          }, 500);
          err("Terlalu banyak percobaan. Coba lagi dalam " + LOCK_SECONDS + " detik.");
          setBusy(true, "Masuk");
          return;
        }
        err(msg === "auth" ? "Username atau password salah." : "Tidak bisa menghubungi server. Periksa koneksi internet lalu coba lagi.");
        setBusy(false);
      }
      var tm = setTimeout(function () { end(false, "net"); }, 12000);
      try {
        cl = mqtt.connect(url, { clientId: "login-" + Math.random().toString(16).slice(2, 8), username: user, password: pass, reconnectPeriod: 0, connectTimeout: 10000, clean: true, timerVariant: "native" });
      } catch (e) { end(false, "net"); return; }
      cl.on("connect", function () { end(true); });
      cl.on("error", function (e) {
        var m = (e && e.message) || "";
        end(false, /bad user|not authorized|refused|credentials|auth/i.test(m) || (e && (e.code === 4 || e.code === 5)) ? "auth" : "net");
      });
      cl.on("close", function () { end(false, "net"); });
    }

    q("lgGo").addEventListener("click", attempt);
    root.addEventListener("keydown", function (e) { if (e.key === "Enter") attempt(); });
    q("lgUser").focus();
  }

  if (document.body) show();
  else document.addEventListener("DOMContentLoaded", show);
})();
