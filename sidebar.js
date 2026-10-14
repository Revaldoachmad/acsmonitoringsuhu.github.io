/* sidebar.js - sidebar gaya ChatGPT untuk dasbor suhu cold kitchen.
   Cara pakai: taruh file ini sefolder dengan file HTML, lalu tambahkan
   <script src="sidebar.js"></script> tepat sebelum </body>. */
(function () {
  "use strict";

  /* ===== Ubah di sini ===== */
  var USER_NAME = "ACS SUB";
  var USER_ROLE = "Operator";
  var APP_TITLE = "Cold Room";
  var FORCE_DARK = true; // true = seluruh halaman gelap seperti contoh, false = ikut tema perangkat
  /* ======================== */

  var IC = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'
  };
  function ic(n) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>";
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function txt(r, s) { var n = r.querySelector(s); return n ? n.textContent : ""; }

  var DARK = ":root:root:root{color-scheme:dark;--bg:#212121;--panel:#2b2b2b;--ink:#ececec;--mute:#9b9b9b;--line:#3a3a3a;--track:#3a3a3a;--band:#1F5A44;--ok:#43C48B;--warn:#E8A830;--crit:#FF6B76;--off:#8A9BA3;--crit-bg:#3A1D22;--warn-bg:#35290F;--accent:#5CC4E0}";

  var CSS = [
    ".app{display:flex;min-height:100vh;min-height:100dvh}",
    ".main{flex:1;min-width:0}",
    ".toasts{left:auto;right:12px}",
    ".sb{--sbg:#171717;--stx:#ececec;--smu:#9b9b9b;--shv:#262626;width:260px;flex:none;position:sticky;top:0;height:100vh;height:100dvh;display:flex;flex-direction:column;background:var(--sbg);color:var(--stx);font-family:var(--sans);z-index:15}",
    ".sb button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left}",
    ".sb-head{display:flex;align-items:center;justify-content:space-between;padding:14px 10px 6px 18px}",
    ".sb-title{font-size:1.25rem;font-weight:600}",
    ".sb-tools{display:flex;gap:2px}",
    ".sb-ib{display:grid;place-items:center;width:38px;height:38px;border-radius:8px;color:var(--smu)}",
    ".sb-ib:hover{background:var(--shv);color:var(--stx)}",
    ".sb-search{display:none;padding:2px 12px 6px}",
    ".sb-search.on{display:block}",
    ".sb-search input{width:100%;padding:8px 10px;border-radius:8px;border:1px solid #3a3a3a;background:#1f1f1f;color:var(--stx);font-size:16px}",
    ".sb-body{flex:1;overflow:auto;padding:6px 8px 12px;scrollbar-width:thin;scrollbar-color:#3a3a3a transparent}",
    ".sb-row{display:flex;align-items:center;gap:12px;width:100%;min-height:40px;padding:0 10px;border-radius:10px;font-size:.95rem}",
    ".sb-row:hover,.sb-row.on{background:var(--shv)}",
    ".sb-row .lb{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".sb-badge{display:none;min-width:20px;padding:0 6px;border-radius:10px;background:#FF6B76;color:#1a1a1a;font-size:.75rem;font-weight:700;text-align:center;line-height:20px}",
    ".sb-sec{padding:28px 10px 8px;font-size:.85rem;font-weight:600;color:var(--smu)}",
    ".sb-empty{padding:6px 10px;color:#6f6f6f;font-size:.95rem}",
    ".sb-room .sh{width:1em;flex:none;text-align:center;font-size:.8rem}",
    ".sb-room .tv{color:var(--smu);font-size:.82rem;font-variant-numeric:tabular-nums}",
    ".s-ok{color:#43C48B}.s-warn{color:#E8A830}.s-crit{color:#FF6B76}.s-off{color:#8A9BA3}",
    ".sb-foot{display:flex;align-items:center;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px))}",
    ".sb-av{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:50%;background:#9aa8a3;color:#1a1a1a;font-size:.75rem;font-weight:700}",
    ".sb-who{min-width:0}",
    ".sb-who b{display:block;font-size:.92rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".sb-who span{display:block;font-size:.8rem;color:var(--smu)}",
    ".topbar{display:none;position:sticky;top:0;z-index:10;height:48px;align-items:center;gap:8px;padding:0 10px;background:var(--bg);border-bottom:1px solid var(--line)}",
    ".topbar .sb-ib{background:none;border:0;cursor:pointer;color:var(--mute)}",
    ".topbar .sb-title{font-size:1.1rem}",
    ".sb-scrim{display:none}",
    "body.sb-closed .topbar{display:flex}",
    "body.sb-closed .sb{display:none}",
    "body.sb-closed aside.alarms{top:60px}",
    "@media (max-width:960px){",
    ".sb{position:fixed;left:0;top:0;bottom:0;width:min(300px,86vw);z-index:40;transform:translateX(-100%);visibility:hidden;transition:transform .2s,visibility .2s}",
    "body.sb-closed .sb{display:flex}",
    "body:not(.sb-closed) .sb{transform:none;visibility:visible}",
    "body:not(.sb-closed) .sb-scrim{display:block;position:fixed;inset:0;z-index:39;background:rgba(0,0,0,.5)}",
    "}",
    "@media (max-width:640px){body.sb-closed #chips{top:48px}}",
    "@media (prefers-reduced-motion:reduce){.sb{transition:none}}"
  ].join("\n");

  var SH = { ok: "●", warn: "▲", crit: "■", error: "◆", offline: "○" };
  var CL = { ok: "s-ok", warn: "s-warn", crit: "s-crit", error: "s-crit", offline: "s-off" };
  var LB = { ok: "Normal", warn: "Peringatan", crit: "Kritis", error: "Sensor error", offline: "Offline" };

  function build() {
    var wrap = $(".wrap");
    if (!wrap || $(".app")) return;

    var st = document.createElement("style");
    st.textContent = (FORCE_DARK ? DARK + "\n" : "") + CSS;
    document.head.appendChild(st);

    var initials = USER_NAME.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();

    var app = document.createElement("div");
    app.className = "app";
    app.innerHTML =
      '<aside class="sb" aria-label="Menu">' +
        '<div class="sb-head"><span class="sb-title">' + esc(APP_TITLE) + "</span>" +
          '<div class="sb-tools">' +
            '<button class="sb-ib" type="button" data-act="search" aria-label="Cari ruangan">' + ic("search") + "</button>" +
            '<button class="sb-ib" type="button" data-act="toggle" aria-label="Tutup menu">' + ic("panel") + "</button>" +
          "</div></div>" +
        '<div class="sb-search"><input type="search" placeholder="Cari ruangan" aria-label="Cari ruangan" autocomplete="off"></div>' +
        '<nav class="sb-body">' +
          '<button class="sb-row" type="button" data-act="home">' + ic("grid") + '<span class="lb">Semua ruangan</span></button>' +
          '<button class="sb-row" type="button" data-act="alarm">' + ic("bell") + '<span class="lb">Alarm</span><span class="sb-badge" id="sbBadge"></span></button>' +
          '<button class="sb-row" type="button" data-act="cfg">' + ic("sliders") + '<span class="lb">Pengaturan broker</span></button>' +
          '<div class="sb-sec">Ruangan</div>' +
          '<div id="sbRooms"></div>' +
        "</nav>" +
        '<div class="sb-foot"><span class="sb-av" aria-hidden="true">' + esc(initials) + '</span>' +
          '<div class="sb-who"><b>' + esc(USER_NAME) + "</b><span>" + esc(USER_ROLE) + "</span></div></div>" +
      "</aside>" +
      '<div class="main"><div class="topbar">' +
        '<button class="sb-ib" type="button" data-act="toggle" aria-label="Buka menu">' + ic("panel") + "</button>" +
        '<span class="sb-title">' + esc(APP_TITLE) + "</span></div></div>";
    document.body.insertBefore(app, document.body.firstChild);
    $(".main", app).appendChild(wrap);

    var scrim = document.createElement("div");
    scrim.className = "sb-scrim";
    document.body.appendChild(scrim);

    var mq = window.matchMedia("(max-width:960px)");
    function setOpen(o) { document.body.classList.toggle("sb-closed", !o); }
    setOpen(!mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", function (e) { setOpen(!e.matches); });
    scrim.addEventListener("click", function () { setOpen(false); });

    var input = $(".sb-search input", app);
    input.addEventListener("input", function () { sync(); });

    function findTile(id) {
      var t = document.querySelectorAll("#grid .tile");
      for (var i = 0; i < t.length; i++) if (txt(t[i], ".id") === id) return t[i];
      return null;
    }

    app.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var a = b.getAttribute("data-act");
      if (a === "toggle") { setOpen(document.body.classList.contains("sb-closed")); return; }
      if (a === "search") {
        var box = $(".sb-search", app);
        var on = box.classList.toggle("on");
        if (on) input.focus(); else { input.value = ""; sync(); }
        return;
      }
      if (a === "home") {
        var chip = $("#chips .chip");
        if (chip) chip.click();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (a === "alarm") {
        var al = $("aside.alarms");
        if (al) al.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (a === "cfg") {
        var cb = $("#cfgBtn");
        if (cb) cb.click();
      } else if (a === "room") {
        var t = findTile(b.getAttribute("data-id"));
        if (t) t.click();
      }
      if (mq.matches) setOpen(false);
    });

    var last = "";
    function sync() {
      var q = input.value.trim().toLowerCase();
      var dr = $("#drawer");
      var sub = dr && !dr.hidden && $("#dSub") ? $("#dSub").textContent : "";
      var list = [].slice.call(document.querySelectorAll("#grid .tile")).map(function (t) {
        return { id: txt(t, ".id"), name: txt(t, ".nm"), s: t.dataset.s || "offline", v: txt(t, ".val"), o: parseInt(t.style.order, 10) || 0 };
      }).filter(function (r) {
        return !q || (r.name + " " + r.id).toLowerCase().indexOf(q) > -1;
      }).sort(function (a, b) { return a.o - b.o; });

      var m = /^(\d+) aktif/.exec(txt(document, "#alarmCount") || "");
      var n = m ? +m[1] : 0;
      var bd = $("#sbBadge");
      bd.textContent = n;
      bd.style.display = n ? "inline-block" : "none";

      var sig = JSON.stringify([q, sub, list]);
      if (sig === last) return;
      last = sig;
      $("#sbRooms").innerHTML = list.length
        ? list.map(function (r) {
            return '<button class="sb-row sb-room' + (sub === r.id ? " on" : "") + '" type="button" data-act="room" data-id="' + esc(r.id) + '" aria-label="' + esc(r.name + ", " + (LB[r.s] || "")) + '">' +
              '<span class="sh ' + (CL[r.s] || "s-off") + '" aria-hidden="true">' + (SH[r.s] || "○") + "</span>" +
              '<span class="lb">' + esc(r.name) + "</span>" +
              '<span class="tv">' + esc(r.v) + (/\d/.test(r.v) ? "°" : "") + "</span></button>";
          }).join("")
        : '<div class="sb-empty">' + (q ? "Tidak ditemukan" : "Menunggu data dari ESP32") + "</div>";
    }
    sync();
    setInterval(sync, 1000);
  }

  try { build(); } catch (err) { if (window.console) console.error("sidebar.js:", err); }
})();
