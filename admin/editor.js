/* ============================================================
   OBSIDIO — vizuální live editor
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var iframe = $("#frame"), drawer = $("#drawer"), toast = $("#toast");
  var doc = null, body = null, current = null, selected = null, hovered = null, dragKey = null;
  var saveTimer = null;

  /* ---------- známé stránky webu ---------- */
  var SITE = [
    ["/", "Domů"], ["/sluzby/", "Služby"], ["/sluzby/social-bot/", "Social Bot"],
    ["/sluzby/webove-stranky/", "Webové stránky"], ["/sluzby/marketing/", "Marketing"],
    ["/sluzby/seo/", "SEO"], ["/sluzby/geo/", "GEO"], ["/sluzby/automatizace/", "Automatizace"],
    ["/sluzby/systemy-na-miru/", "Systémy na míru"], ["/sluzby/grafika/", "Grafika"],
    ["/cenik/", "Ceník"], ["/audit-zdarma/", "Audit zdarma"], ["/reference/", "Reference"],
    ["/o-nas/", "O nás"], ["/blog/", "Blog"], ["/kontakt/", "Kontakt"],
    ["/casto-kladene-dotazy/", "Časté dotazy"]
  ];

  /* ---------- premade bloky ---------- */
  var FAJF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
  var SIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var SIPUP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>';
  function pen(b) { return '<a href="/audit-zdarma/" class="pen-btn"><span class="pen">' + SIP + '</span> ' + b + '</a>'; }

  var BLOCKS = {
    heading: { cat: "Obsah", label: "Nadpis + text", desc: "Eyebrow, nadpis, popis", icon: "T",
      html: '<section class="section panel--bone"><div class="container"><span class="eyebrow">Nadpis sekce</span><h2 class="mt-4">Nový <span class="accent">nadpis</span> sekce.</h2><p class="lead muted mt-6" style="max-width:46ch">Sem napište podnadpis nebo krátký popis toho, o čem sekce je.</p></div></section>' },
    text: { cat: "Obsah", label: "Text 2 sloupce", desc: "Nadpis vlevo, text vpravo", icon: "¶",
      html: '<section class="section panel--ink"><div class="container"><div class="split"><div><span class="eyebrow">Štítek</span><h2 class="mt-6">Výrazný nadpis<br>na dva řádky.</h2></div><div><p class="body-lg">Sem patří hlavní text. Klikněte a pište. Druhý odstavec přidáte klávesou Enter.</p></div></div></div></section>' },
    image: { cat: "Obsah", label: "Obrázek", desc: "Obrázek přes šířku", icon: "▦",
      html: '<section class="section panel--bone"><div class="container"><img src="https://picsum.photos/seed/obsidio-new/1600/800?grayscale" alt="Popis obrázku" loading="lazy" style="width:100%;border-radius:20px;display:block"></div></section>' },
    cta: { cat: "Akce", label: "CTA pruh", desc: "Electric výzva k akci", icon: "✦",
      html: '<section class="section panel--volt grain text-center"><div class="container"><span class="pill" style="border-color:rgba(255,255,255,.4)"><span class="dot"></span> Bez rizika</span><h2 class="mt-8">ZAČNĚME.</h2><p class="body-lg mx-auto mt-6" style="max-width:44ch;color:rgba(255,255,255,.92)">Krátká věta, která pobídne k akci.</p><div class="actions mt-12" style="justify-content:center"><a href="/audit-zdarma/" class="btn btn-bone btn-lg">Chci audit zdarma ' + SIP + '</a></div></div></section>' },
    buttons: { cat: "Akce", label: "Tlačítka", desc: "Dvojice tlačítek", icon: "▭",
      html: '<section class="section panel--ink"><div class="container text-center"><div class="actions" style="justify-content:center">' + pen("Chci audit zdarma") + '<a href="/cenik/" class="btn btn-outline btn-lg"><span>Ukažte mi ceny</span></a></div></div></section>' },
    marquee: { cat: "Prvky", label: "Běžící pruh", desc: "Marquee s textem", icon: "≈",
      html: '<div class="panel--volt"><div class="marquee"><div class="marquee__track auto"><div><span>WEBY</span><span class="st">✳</span><span>GRAFIKA</span><span class="st">✳</span><span>MARKETING</span><span class="st">✳</span><span>SEO</span><span class="st">✳</span></div><div aria-hidden="true"><span>WEBY</span><span class="st">✳</span><span>GRAFIKA</span><span class="st">✳</span><span>MARKETING</span><span class="st">✳</span><span>SEO</span><span class="st">✳</span></div></div></div></div>' },
    stats: { cat: "Prvky", label: "Statistiky", desc: "Čtyři velká čísla", icon: "#",
      html: '<section class="section panel--ink"><div class="container"><div class="stats"><div class="stat"><div class="n">200+</div><div class="l">Popis čísla</div></div><div class="stat"><div class="n"><span class="accent">14</span></div><div class="l">Popis čísla</div></div><div class="stat"><div class="n">6k</div><div class="l">Popis čísla</div></div><div class="stat"><div class="n"><span class="accent">24/7</span></div><div class="l">Popis čísla</div></div></div></div></section>' },
    cards3: { cat: "Prvky", label: "Tři karty", desc: "Mřížka karet", icon: "▤",
      html: '<section class="section panel--bone"><div class="container"><div class="grid cols-3"><div class="card hov"><div class="ic">' + FAJF + '</div><h3>Karta jedna</h3><p class="muted mt-4">Krátký popis první karty.</p></div><div class="card hov"><div class="ic">' + FAJF + '</div><h3>Karta dvě</h3><p class="muted mt-4">Krátký popis druhé karty.</p></div><div class="card hov"><div class="ic">' + FAJF + '</div><h3>Karta tři</h3><p class="muted mt-4">Krátký popis třetí karty.</p></div></div></div></section>' },
    service: { cat: "Služby", label: "Seznam služeb", desc: "Velké klikací řádky", icon: "≡",
      html: '<section class="section panel--bone"><div class="container"><div class="big-list"><a href="/sluzby/webove-stranky/" class="big-row"><span class="fill"></span><span class="br-num">01</span><span class="br-name">Nová služba</span><span class="br-desc">Krátký popis služby do jedné věty.</span><span class="br-price">od 0 Kč</span><span class="br-arrow">' + SIPUP + '</span></a><a href="/sluzby/" class="big-row"><span class="fill"></span><span class="br-num">02</span><span class="br-name">Další služba</span><span class="br-desc">Popis druhé služby.</span><span class="br-price">na míru</span><span class="br-arrow">' + SIPUP + '</span></a></div></div></section>' },
    price: { cat: "Služby", label: "Ceník naruby", desc: "Řádky cen", icon: "₵",
      html: '<section class="section panel--bone"><div class="container"><div class="price-rows"><div class="price-row"><div class="pr-name">Služba<small>Krátký popis</small></div><div class="pr-market">80 000 Kč</div><div class="pr-ours">od 6 000 Kč</div></div><div class="price-row"><div class="pr-name">Další služba<small>Měsíčně</small></div><div class="pr-market">15 000 Kč</div><div class="pr-ours">od 5 000 Kč</div></div></div></div></section>' },
    plans: { cat: "Služby", label: "Balíčky", desc: "Tři cenové plány", icon: "▥",
      html: '<section class="section panel--ink"><div class="container"><div class="plans"><div class="plan"><div class="pt">Start</div><div class="pp">3 500 Kč<small>/měsíc</small></div><ul class="pf"><li>' + FAJF + ' Funkce jedna</li><li>' + FAJF + ' Funkce dvě</li></ul><a href="/kontakt/" class="btn btn-outline btn-block"><span>Mám zájem</span></a></div><div class="plan featured"><div class="pt">Růst</div><div class="pp">6 000 Kč<small>/měsíc</small></div><ul class="pf"><li>' + FAJF + ' Vše ze Startu</li><li>' + FAJF + ' Funkce navíc</li></ul><a href="/kontakt/" class="btn btn-bone btn-block">Mám zájem</a></div><div class="plan"><div class="pt">Lídr</div><div class="pp">8 000 Kč<small>/měsíc</small></div><ul class="pf"><li>' + FAJF + ' Vše z Růstu</li><li>' + FAJF + ' Prémiové funkce</li></ul><a href="/kontakt/" class="btn btn-outline btn-block"><span>Mám zájem</span></a></div></div></div></section>' },
    tiles: { cat: "Prvky", label: "Galerie dlaždic", desc: "Obrázkové dlaždice", icon: "▦",
      html: '<section class="section panel--bone"><div class="container"><div class="tiles"><a href="/reference/" class="tile"><div class="tile-media"><img src="https://picsum.photos/seed/obsidio-t1/900/700?grayscale" alt="Ukázka" loading="lazy"><div class="badge">' + SIPUP + '</div></div><div class="tile-foot"><div><div class="tile-title">Název práce</div><div class="tile-client">Obor · město</div></div><div class="tile-metric">+0 %</div></div></a><a href="/reference/" class="tile off"><div class="tile-media"><img src="https://picsum.photos/seed/obsidio-t2/900/700?grayscale" alt="Ukázka" loading="lazy"><div class="badge">' + SIPUP + '</div></div><div class="tile-foot"><div><div class="tile-title">Název práce</div><div class="tile-client">Obor · město</div></div><div class="tile-metric">2×</div></div></a></div></div></section>' },
    quotes: { cat: "Prvky", label: "Reference", desc: "Citace klientů", icon: "❝",
      html: '<section class="section panel--bone"><div class="container"><div class="grid cols-3"><div class="card hov"><div class="quote"><div class="stars">★★★★★</div><blockquote>„Sem vložte citaci spokojeného klienta.”</blockquote><div class="metric">+0 %</div><div class="who"><div class="av">A</div><div><div class="nm">Jméno P.</div><div class="rl">obor, město</div></div></div></div></div><div class="card hov"><div class="quote"><div class="stars">★★★★★</div><blockquote>„Druhá citace klienta.”</blockquote><div class="metric">0 Kč</div><div class="who"><div class="av">B</div><div><div class="nm">Jméno D.</div><div class="rl">obor, město</div></div></div></div></div><div class="card hov"><div class="quote"><div class="stars">★★★★★</div><blockquote>„Třetí citace klienta.”</blockquote><div class="metric">2×</div><div class="who"><div class="av">C</div><div><div class="nm">Jméno Z.</div><div class="rl">obor, město</div></div></div></div></div></div></div></section>' },
    faq: { cat: "Prvky", label: "FAQ", desc: "Časté dotazy", icon: "?",
      html: '<section class="section panel--bone"><div class="container"><div class="section-head mb-12"><span class="eyebrow">Časté dotazy</span><h2 class="mt-4">Než se zeptáte.</h2></div><div class="faq"><div class="faq-item"><button class="faq-q" aria-expanded="false"><span class="qt">První otázka?</span><span class="qi"></span></button><div class="faq-a"><div class="faq-a-in">Odpověď na první otázku.</div></div></div><div class="faq-item"><button class="faq-q" aria-expanded="false"><span class="qt">Druhá otázka?</span><span class="qi"></span></button><div class="faq-a"><div class="faq-a-in">Odpověď na druhou otázku.</div></div></div></div></div></section>' },
    steps: { cat: "Prvky", label: "Kroky / proces", desc: "Číslované kroky", icon: "1",
      html: '<section class="section panel--ink"><div class="container"><div class="steps"><div class="step"><div class="sn">01</div><div><h3>První krok</h3><p>Popis prvního kroku.</p></div></div><div class="step"><div class="sn">02</div><div><h3>Druhý krok</h3><p>Popis druhého kroku.</p></div></div><div class="step"><div class="sn">03</div><div><h3>Třetí krok</h3><p>Popis třetího kroku.</p></div></div></div></div></section>' }
  };

  /* ---------- pomocné ---------- */
  function showToast(t) { toast.textContent = t; toast.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(function () { toast.classList.remove("show"); }, 2200); }
  function injectStyle() {
    if (doc.getElementById("__edstyle")) return;
    var st = doc.createElement("style"); st.id = "__edstyle";
    st.textContent = '.floatbar,.cookie-bar,.cc-modal,.scroll-prog,.cur-dot,.cur-ring{display:none!important}.marquee__track{animation:none!important}' +
      'main>*{position:relative}main>*:hover{outline:2px dashed rgba(71,54,255,.5);outline-offset:-2px}' +
      '.__sel{outline:2.5px solid #4736FF!important;outline-offset:-2px}' +
      '[contenteditable=true]{outline:2px solid #7E72FF!important;outline-offset:2px;cursor:text;border-radius:3px}' +
      'img{cursor:pointer}' +
      '.__bar{position:absolute;top:8px;right:8px;z-index:9999;display:flex;gap:4px;background:#0B0C10;border:1px solid rgba(242,239,230,.2);border-radius:10px;padding:4px;box-shadow:0 12px 30px rgba(0,0,0,.5)}' +
      '.__bar button{width:32px;height:32px;border-radius:7px;border:none;background:#1C1E27;color:#F2EFE6;cursor:pointer;display:grid;place-items:center;font-size:15px}' +
      '.__bar button:hover{background:#4736FF}.__bar button.del:hover{background:#E5484D}' +
      '.__drop{height:5px;background:#4736FF;border-radius:3px;margin:0;box-shadow:0 0 12px #4736FF}';
    doc.head.appendChild(st);
  }
  function blockEls() { return Array.prototype.slice.call(body.querySelectorAll("main > section, main > div")); }

  /* ---------- načtení stránky ---------- */
  function loadPage(path) {
    current = path;
    var draft = localStorage.getItem("obsidio_draft:" + path);
    iframe.onload = function () {
      doc = iframe.contentDocument; body = doc.body;
      if (draft) { try { var m = body.querySelector("main"); var d = doc.createElement("div"); d.innerHTML = draft; if (d.querySelector("main")) { body.innerHTML = draft; } } catch (e) {} }
      injectStyle(); wire(); showToast(draft ? "Obnoveno z konceptu" : "Stránka načtena");
    };
    iframe.src = path + (path.indexOf("?") > -1 ? "&" : "?") + "edit=1&t=" + Date.now();
    $("#pageName").textContent = path;
  }

  /* ---------- napojení editace ---------- */
  function wire() {
    var main = body.querySelector("main"); if (!main) return;
    // hover sekce → bar
    var bar = doc.createElement("div"); bar.className = "__bar";
    bar.innerHTML = '<button data-a="up" title="Nahoru">↑</button><button data-a="down" title="Dolů">↓</button><button data-a="dup" title="Duplikovat">⧉</button><button data-a="bg" title="Pozadí">◑</button><button data-a="del" class="del" title="Smazat">✕</button>';
    bar.style.display = "none"; doc.body.appendChild(bar);
    var barFor = null;
    function showBar(sec) { barFor = sec; sec.appendChild(bar); bar.style.display = "flex"; }
    main.addEventListener("mouseover", function (e) { var s = topBlock(e.target); if (s) { hovered = s; showBar(s); } });
    bar.addEventListener("click", function (e) {
      var a = e.target.getAttribute("data-a"); if (!a || !barFor) return; e.stopPropagation();
      if (a === "up") { var p = barFor.previousElementSibling; if (p) barFor.parentNode.insertBefore(barFor, p); }
      else if (a === "down") { var n = barFor.nextElementSibling; if (n) barFor.parentNode.insertBefore(n, barFor); }
      else if (a === "dup") { var c = barFor.cloneNode(true); barFor.parentNode.insertBefore(c, barFor.nextSibling); }
      else if (a === "bg") { selectSection(barFor); openBg(); }
      else if (a === "del") { if (confirm("Smazat sekci?")) { barFor.remove(); bar.style.display = "none"; } }
      changed();
    });
    // klik = editace textu / výběr obrázku / sekce
    main.addEventListener("click", function (e) {
      e.preventDefault();
      var t = e.target;
      if (t.tagName === "IMG") { selectImage(t); return; }
      if (t.closest(".__bar")) return;
      var txt = textTarget(t);
      if (txt) { makeEditable(txt); selectSection(topBlock(t)); }
    }, true);
    // drop bloků z palety
    main.addEventListener("dragover", function (e) { e.preventDefault(); showDrop(e); });
    main.addEventListener("drop", function (e) { e.preventDefault(); doDrop(e); });
    // FAQ accordion klik nech být v editoru (jen text)
    // změny → autosave
    new MutationObserver(changed).observe(main, { subtree: true, childList: true, characterData: true });
  }
  function topBlock(el) { while (el && el.parentNode && el.parentNode.tagName !== "MAIN") el = el.parentNode; return (el && el.parentNode && el.parentNode.tagName === "MAIN") ? el : null; }
  function textTarget(t) {
    if (t.tagName === "IMG" || t.tagName === "SVG" || t.closest("svg")) return null;
    // nejhlubší textový prvek
    if (t.children.length === 0 && t.textContent.trim()) return t;
    var tags = ["H1", "H2", "H3", "H4", "H5", "P", "SPAN", "A", "BUTTON", "LI", "BLOCKQUOTE", "SMALL", "STRONG", "EM", "DIV"];
    if (tags.indexOf(t.tagName) > -1 && t.textContent.trim() && t.querySelectorAll("img,svg").length === 0) {
      // pokud má dětské textové elementy, vyber konkrétní klik. Jinak self.
      return t;
    }
    return null;
  }
  function makeEditable(el) {
    if (el.getAttribute("contenteditable") === "true") return;
    el.setAttribute("contenteditable", "true"); el.setAttribute("spellcheck", "false"); el.focus();
    el.addEventListener("blur", function () { el.removeAttribute("contenteditable"); el.removeAttribute("spellcheck"); changed(); }, { once: true });
  }
  function selectSection(sec) { if (selected) selected.classList.remove("__sel"); selected = sec; if (sec) sec.classList.add("__sel"); }

  /* ---------- drop indikátor ---------- */
  var dropLine = null;
  function showDrop(e) {
    var main = body.querySelector("main"); var els = blockEls(); var after = null;
    for (var i = 0; i < els.length; i++) { var r = els[i].getBoundingClientRect(); if (e.clientY < r.top + r.height / 2) { after = els[i]; break; } }
    if (!dropLine) { dropLine = doc.createElement("div"); dropLine.className = "__drop"; }
    if (after) main.insertBefore(dropLine, after); else main.appendChild(dropLine);
    dropLine._after = after;
  }
  function doDrop(e) {
    var key = dragKey || (e.dataTransfer && e.dataTransfer.getData("text/plain")); if (!key || !BLOCKS[key]) { if (dropLine) dropLine.remove(); return; }
    insertHTML(BLOCKS[key].html, dropLine ? dropLine._after : null);
    if (dropLine) { dropLine.remove(); dropLine = null; } dragKey = null;
  }
  function insertHTML(html, before) {
    var main = body.querySelector("main"); var tmp = doc.createElement("div"); tmp.innerHTML = html; var node = tmp.firstElementChild;
    if (before) main.insertBefore(node, before); else { if (hovered && hovered.parentNode === main) main.insertBefore(node, hovered.nextSibling); else main.appendChild(node); }
    node.scrollIntoView({ behavior: "smooth", block: "center" }); selectSection(node); changed(); showToast("Blok přidán");
  }

  /* ---------- obrázek ---------- */
  var imgEl = null;
  function selectImage(img) {
    imgEl = img; selectSection(topBlock(img));
    drawer.innerHTML = '<h3>Obrázek</h3><div class="sub">Změňte zdroj nebo nahrajte vlastní.</div>' +
      '<div class="field"><label>URL obrázku</label><input id="imgSrc" value="' + img.getAttribute("src") + '"></div>' +
      '<div class="field"><label>Nahrát soubor</label><input id="imgFile" type="file" accept="image/*"></div>' +
      '<div class="field"><label>Popis (alt)</label><input id="imgAlt" value="' + (img.getAttribute("alt") || "") + '"></div>' +
      '<div class="row-btn"><button class="tb-btn primary" id="imgApply">Použít</button><button class="tb-btn" id="drawClose">Zavřít</button></div>';
    drawer.classList.add("open");
    $("#imgSrc").oninput = function () { imgEl.src = this.value; };
    $("#imgAlt").oninput = function () { imgEl.alt = this.value; };
    $("#imgFile").onchange = function (e) { var f = e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { imgEl.src = r.result; $("#imgSrc").value = "(nahraný soubor)"; changed(); }; r.readAsDataURL(f); };
    $("#imgApply").onclick = function () { changed(); drawer.classList.remove("open"); showToast("Obrázek upraven"); };
    $("#drawClose").onclick = function () { drawer.classList.remove("open"); };
  }
  function openBg() {
    if (!selected) return;
    var cur = selected.className.indexOf("panel--volt") > -1 ? "volt" : selected.className.indexOf("panel--bone") > -1 ? "bone" : "ink";
    drawer.innerHTML = '<h3>Pozadí sekce</h3><div class="sub">Vyberte barevné téma bloku.</div><div class="bg-opts">' +
      '<div class="bg-opt" data-bg="ink">Tmavá</div><div class="bg-opt" data-bg="bone">Světlá</div><div class="bg-opt" data-bg="volt">Electric</div></div>' +
      '<div class="row-btn" style="margin-top:16px"><button class="tb-btn" id="drawClose2">Hotovo</button></div>';
    drawer.classList.add("open");
    drawer.querySelectorAll(".bg-opt").forEach(function (o) {
      if (o.getAttribute("data-bg") === cur) o.classList.add("sel");
      o.onclick = function () { selected.classList.remove("panel--ink", "panel--bone", "panel--volt"); selected.classList.add("panel--" + o.getAttribute("data-bg")); drawer.querySelectorAll(".bg-opt").forEach(function (x) { x.classList.remove("sel"); }); o.classList.add("sel"); changed(); };
    });
    $("#drawClose2").onclick = function () { drawer.classList.remove("open"); };
  }

  /* ---------- export / autosave ---------- */
  function cleanBody() {
    var c = body.cloneNode(true);
    c.querySelectorAll(".__bar,.__drop").forEach(function (n) { n.remove(); });
    c.querySelectorAll("[contenteditable]").forEach(function (n) { n.removeAttribute("contenteditable"); });
    c.querySelectorAll("[spellcheck]").forEach(function (n) { n.removeAttribute("spellcheck"); });
    c.querySelectorAll(".__sel").forEach(function (n) { n.classList.remove("__sel"); });
    return c.innerHTML;
  }
  function changed() { clearTimeout(saveTimer); saveTimer = setTimeout(function () { try { localStorage.setItem("obsidio_draft:" + current, cleanBody()); } catch (e) {} }, 700); }
  function cleanDoc() {
    var html = doc.documentElement.cloneNode(true);
    html.classList.remove("is-editing");
    html.querySelectorAll("#__edstyle,.__bar,.__drop").forEach(function (n) { n.remove(); });
    html.querySelectorAll("[contenteditable]").forEach(function (n) { n.removeAttribute("contenteditable"); });
    html.querySelectorAll("[spellcheck]").forEach(function (n) { n.removeAttribute("spellcheck"); });
    html.querySelectorAll(".__sel").forEach(function (n) { n.classList.remove("__sel"); });
    return "<!DOCTYPE html>\n" + html.outerHTML;
  }
  function download(name, text) { var b = new Blob([text], { type: "text/html" }); var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); }

  /* ---------- nová stránka ---------- */
  var newTpl = "blank";
  function openNew() {
    $("#m-new").classList.add("open");
    $("#np-name").value = ""; $("#np-slug").value = "";
    document.querySelectorAll("#m-new .tpl-opt").forEach(function (o) { o.classList.toggle("sel", o.getAttribute("data-tpl") === newTpl); });
  }
  function createPage() {
    var name = $("#np-name").value.trim() || "Nová stránka";
    var slug = ($("#np-slug").value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) || "nova-stranka";
    var mains = {
      blank: BLOCKS.heading.html + BLOCKS.cta.html,
      service: '<section class="section subhero panel--ink"><div class="subhero-glow"></div><div class="container"><span class="eyebrow">Nová služba</span><h1 data-ed>' + name + '.</h1><p class="lead muted mt-6" style="max-width:46ch">Popis služby na jednu dvě věty.</p><div class="actions mt-8">' + pen("Chci audit zdarma") + '</div></div></section>' + BLOCKS.cards3.html + BLOCKS.price.html + BLOCKS.faq.html + BLOCKS.cta.html,
      landing: '<section class="section subhero panel--ink"><div class="subhero-glow"></div><div class="container"><span class="eyebrow">' + name + '</span><h1>Velký nadpis<br>nové stránky.</h1><p class="lead muted mt-6" style="max-width:46ch">Podnadpis stránky.</p><div class="actions mt-8">' + pen("Chci audit zdarma") + '<a href="/cenik/" class="btn btn-outline"><span>Ceník</span></a></div></div></section>' + BLOCKS.stats.html + BLOCKS.service.html + BLOCKS.quotes.html + BLOCKS.cta.html
    };
    // sestav z aktuální stránky (shell) + nový main
    var shell = cleanDoc();
    var newHtml = shell.replace(/<main[\s\S]*?<\/main>/, "<main>\n" + mains[newTpl] + "\n</main>")
      .replace(/<title>[\s\S]*?<\/title>/, "<title>" + name + " | Obsidio</title>");
    var store = JSON.parse(localStorage.getItem("obsidio_pages") || "{}");
    store["/" + slug + "/"] = { name: name, html: newHtml };
    localStorage.setItem("obsidio_pages", JSON.stringify(store));
    $("#m-new").classList.remove("open");
    buildPageSelect();
    // načti novou stránku přes srcdoc
    loadStored("/" + slug + "/");
    if (confirm('Přidat "' + name + '" do menu (navigace)?')) addNavItem(name, "/" + slug + "/");
    showToast("Stránka vytvořena");
  }
  function loadStored(path) {
    var store = JSON.parse(localStorage.getItem("obsidio_pages") || "{}"); var p = store[path]; if (!p) return;
    current = path; $("#pageName").textContent = path + " (nová)";
    iframe.onload = function () { doc = iframe.contentDocument; body = doc.body; injectStyle(); wire(); };
    iframe.removeAttribute("src"); iframe.srcdoc = p.html;
  }

  /* ---------- navigace (menu) ---------- */
  function navLinks() { return doc ? Array.prototype.slice.call(doc.querySelectorAll(".nav-links > a, .nav-links .has-menu")) : []; }
  function addNavItem(label, href) {
    if (!doc) return; var nav = doc.querySelector(".nav-links"); var mob = doc.querySelector(".mobile-nav");
    if (nav) { var a = doc.createElement("a"); a.href = href; a.textContent = label; nav.appendChild(a); }
    if (mob) { var b = doc.createElement("a"); b.href = href; b.textContent = label; var cta = mob.querySelector(".nav-cta"); mob.insertBefore(b, cta); }
    changed();
  }
  function openNav() {
    if (!doc) return; var nav = doc.querySelector(".nav-links"); var items = Array.prototype.slice.call(nav.querySelectorAll(":scope > a"));
    var rows = items.map(function (a, i) { return '<div class="nav-item" data-i="' + i + '"><input class="nl" value="' + a.textContent.trim() + '"><input class="nh" value="' + a.getAttribute("href") + '"><button data-del="' + i + '">✕</button></div>'; }).join("");
    $("#m-nav .navlist").innerHTML = rows; $("#m-nav").classList.add("open");
    $("#m-nav .navlist").querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { items[+b.getAttribute("data-del")].remove(); b.closest(".nav-item").remove(); changed(); }; });
    $("#navApply").onclick = function () {
      $("#m-nav .navlist").querySelectorAll(".nav-item").forEach(function (row) { var i = +row.getAttribute("data-i"); if (items[i]) { items[i].textContent = $(".nl", row).value; items[i].setAttribute("href", $(".nh", row).value); } });
      changed(); $("#m-nav").classList.remove("open"); showToast("Menu upraveno (na této stránce)");
    };
  }

  /* ---------- UI sestavení ---------- */
  function buildPalette() {
    var cats = {}; Object.keys(BLOCKS).forEach(function (k) { var b = BLOCKS[k]; (cats[b.cat] = cats[b.cat] || []).push([k, b]); });
    var html = "";
    Object.keys(cats).forEach(function (c) {
      html += '<div class="sb-h">' + c + "</div>";
      cats[c].forEach(function (kb) { html += '<button class="blk" draggable="true" data-key="' + kb[0] + '"><span class="ic">' + kb[1].icon + '</span><span><span class="t">' + kb[1].label + '</span><br><span class="d">' + kb[1].desc + "</span></span></button>"; });
    });
    $("#palette").innerHTML = html;
    $("#palette").querySelectorAll(".blk").forEach(function (b) {
      b.addEventListener("dragstart", function (e) { dragKey = b.getAttribute("data-key"); e.dataTransfer.setData("text/plain", dragKey); });
      b.addEventListener("click", function () { insertHTML(BLOCKS[b.getAttribute("data-key")].html, null); });
    });
  }
  function buildPageSelect() {
    var sel = $("#pageSelect"); var store = JSON.parse(localStorage.getItem("obsidio_pages") || "{}");
    var html = SITE.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + " — " + p[0] + "</option>"; }).join("");
    var keys = Object.keys(store); if (keys.length) html += '<optgroup label="Nové stránky">' + keys.map(function (k) { return '<option value="stored:' + k + '">' + store[k].name + " — " + k + "</option>"; }).join("") + "</optgroup>";
    sel.innerHTML = html;
  }

  /* ---------- init ---------- */
  function init() {
    buildPalette(); buildPageSelect();
    $("#pageSelect").onchange = function () { var v = this.value; if (v.indexOf("stored:") === 0) loadStored(v.slice(7)); else loadPage(v); };
    $("#btnNew").onclick = openNew;
    $("#btnNav").onclick = openNav;
    $("#btnSave").onclick = function () { var name = (current === "/" ? "index" : current.replace(/\//g, "")) + ".html"; download("index.html", cleanDoc()); showToast("Staženo: index.html (nahraj do složky " + current + ")"); };
    $("#btnHelp").onclick = function () { $("#m-help").classList.add("open"); };
    $("#btnPreview").onclick = function () { if (current && current.indexOf("stored") !== 0) window.open(current, "_blank"); };
    document.querySelectorAll("[data-close]").forEach(function (b) { b.onclick = function () { $("#" + b.getAttribute("data-close")).classList.remove("open"); }; });
    document.querySelectorAll("#m-new .tpl-opt").forEach(function (o) { o.onclick = function () { newTpl = o.getAttribute("data-tpl"); document.querySelectorAll("#m-new .tpl-opt").forEach(function (x) { x.classList.remove("sel"); }); o.classList.add("sel"); }; });
    $("#npCreate").onclick = createPage;
    $("#m-new .modal").onclick = function (e) { if (e.target === this) this.classList.remove("open"); };
    loadPage("/");
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
