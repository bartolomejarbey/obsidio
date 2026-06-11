/* ============================================================
   OBSIDEO — motion engine (Lenis + GSAP ScrollTrigger)
   Heavy animation · atypical layout. Progressive + failsafe.
   ============================================================ */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = matchMedia("(min-width: 1081px)").matches && matchMedia("(hover: hover)").matches;
  var hasGSAP = !!(window.gsap), hasST = !!(window.ScrollTrigger), hasLenis = !!(window.Lenis);
  var gsap = window.gsap;

  /* ---------- failsafe: vždy ukázat obsah ---------- */
  function revealAll() {
    root.classList.add("ready");
    doc.querySelectorAll("[data-reveal]").forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; });
    doc.querySelectorAll(".hero h1 .ln > span").forEach(function (e) { e.style.transform = "none"; });
  }
  if (reduce || !hasGSAP) { revealAll(); }
  // tvrdá pojistka
  setTimeout(function () { if (!root.classList.contains("anim-on")) revealAll(); }, 2600);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (hasLenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.09, duration: 1.2, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5 });
    if (hasGSAP && hasST) {
      lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); });
    }
    // kotvy
    doc.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var t = doc.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -90 });
      });
    });
  }

  /* ---------- GSAP animace ---------- */
  if (hasGSAP && !reduce) {
    if (hasST) gsap.registerPlugin(window.ScrollTrigger);
    root.classList.add("anim-on");
    var ST = window.ScrollTrigger;

    // HERO — line mask reveal + ribbon draw + glow
    var heroLines = gsap.utils.toArray(".hero h1 .ln > span");
    var tl = gsap.timeline({ delay: 0.15 });
    if (heroLines.length) {
      // y:0 vynuluje px-translate z CSS (translateY(110%)), aby animaci řídil jen yPercent
      tl.fromTo(heroLines, { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.15, ease: "expo.out", stagger: 0.09 }, 0);
    }
    gsap.utils.toArray(".hero [data-hero-fade]").forEach(function (el, i) {
      tl.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" }, 0.5 + i * 0.12);
    });
    // ribbon draw
    var ribbon = doc.querySelector(".hero-ribbon path");
    if (ribbon) {
      var len = ribbon.getTotalLength ? ribbon.getTotalLength() : 4000;
      gsap.set(ribbon, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(ribbon, { strokeDashoffset: 0, duration: 2.0, ease: "power2.inOut" }, 0.1);
      gsap.to(".hero-ribbon", { rotation: 4, yPercent: -3, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });
    }

    // parallax hero při scrollu
    if (hasST) {
      gsap.to(".hero-ribbon", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".hero h1", { yPercent: 14, opacity: 0.6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
    }

    // REVEAL (stagger batch)
    gsap.set("[data-reveal]", { y: 40 });
    if (hasST && ST.batch) {
      ST.batch("[data-reveal]", {
        start: "top 88%", once: true,
        onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, overwrite: true }); }
      });
    } else {
      revealAll();
    }

    // HORIZONTAL pinned scroll
    if (hasST && desktop) {
      gsap.utils.toArray(".hscroll").forEach(function (sec) {
        var track = sec.querySelector(".hscroll__track");
        if (!track) return;
        var getX = function () { return -(track.scrollWidth - window.innerWidth + (window.innerWidth * 0.04)); };
        gsap.to(track, {
          x: getX, ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + (track.scrollWidth - window.innerWidth); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
        });
      });
    }

    // COUNTERS
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-count"));
      var pre = el.getAttribute("data-pre") || "", suf = el.getAttribute("data-suf") || "";
      var dec = el.getAttribute("data-dec") ? parseInt(el.getAttribute("data-dec")) : 0;
      var o = { v: 0 };
      var run = function () {
        gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", onUpdate: function () {
          el.textContent = pre + o.v.toLocaleString("cs-CZ", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
        } });
      };
      if (hasST) ST.create({ trigger: el, start: "top 90%", once: true, onEnter: run }); else run();
    });

    // velký footer wordmark drift
    if (hasST) gsap.to(".foot-word", { xPercent: -6, ease: "none", scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: 1 } });

    // vstup nav (jemné sjetí)
    gsap.from(".nav-pill", { y: -18, opacity: 0, duration: 0.9, ease: "expo.out", delay: 0.1 });

    // image clip-reveal (dlaždice + horizontální panely)
    if (hasST) {
      gsap.utils.toArray(".tile-media img, .hpanel-media img").forEach(function (img) {
        gsap.fromTo(img, { clipPath: "inset(0 100% 0 0)", scale: 1.12 },
          { clipPath: "inset(0 0% 0 0)", scale: 1, duration: 1.1, ease: "expo.out",
            scrollTrigger: { trigger: img, start: "top 86%", once: true } });
      });
    }

    if (hasST) ST.refresh();
  }

  /* ---------- Custom cursor ---------- */
  if (desktop && !reduce) {
    var dot = doc.createElement("div"); dot.className = "cur-dot";
    var ring = doc.createElement("div"); ring.className = "cur-ring";
    doc.body.appendChild(dot); doc.body.appendChild(ring);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)"; }, { passive: true });
    (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)"; requestAnimationFrame(loop); })();
    var hov = "a,button,.tile,.big-row,.hpanel,[data-cursor],.faq-q,input,textarea,select,.nav-cta,.circle-btn";
    doc.addEventListener("mouseover", function (e) { if (e.target.closest(hov)) doc.body.classList.add("cur-hover"); });
    doc.addEventListener("mouseout", function (e) { if (e.target.closest(hov)) doc.body.classList.remove("cur-hover"); });
  }

  /* ---------- Magnetic ---------- */
  if (desktop && !reduce && hasGSAP) {
    doc.querySelectorAll(".circle-btn,.pen-btn,[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.3, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () { gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }); });
    });
  }

  /* ---------- Floating bar ---------- */
  var fbar = doc.querySelector(".floatbar"), fprog = doc.querySelector(".floatbar .prog i");
  if (fbar) {
    var contact = doc.querySelector("#kontakt, .site-footer");
    var update = function () {
      var sc = window.scrollY || window.pageYOffset;
      var h = doc.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? sc / h : 0;
      if (fprog) fprog.style.transform = "scaleX(" + p + ")";
      var past = sc > innerHeight * 0.65;
      var nearEnd = p > 0.93;
      fbar.classList.toggle("show", past && !nearEnd);
    };
    addEventListener("scroll", update, { passive: true }); update();
  }

  /* ---------- Scroll progress bar (funguje i bez GSAP) ---------- */
  (function () {
    var pb = doc.createElement("div"); pb.className = "scroll-prog"; doc.body.appendChild(pb);
    var upd = function () {
      var h = doc.documentElement.scrollHeight - innerHeight;
      pb.style.transform = "scaleX(" + (h > 0 ? (window.scrollY || 0) / h : 0) + ")";
    };
    addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
  })();

  /* ---------- Mobile nav ---------- */
  var tgl = doc.querySelector(".nav-toggle"), mnav = doc.querySelector(".mobile-nav");
  if (tgl && mnav) {
    tgl.addEventListener("click", function () {
      var o = mnav.classList.toggle("open"); tgl.classList.toggle("open", o);
      doc.body.classList.toggle("menu-open", o); tgl.setAttribute("aria-expanded", o);
      if (lenis) { o ? lenis.stop() : lenis.start(); }
    });
    mnav.addEventListener("click", function (e) { if (e.target.tagName === "A") { mnav.classList.remove("open"); tgl.classList.remove("open"); doc.body.classList.remove("menu-open"); if (lenis) lenis.start(); } });
  }

  /* ---------- FAQ ---------- */
  doc.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var it = q.closest(".faq-item"), a = it.querySelector(".faq-a");
      var open = it.classList.toggle("open"); q.setAttribute("aria-expanded", open);
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
      if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 320);
    });
  });
  addEventListener("resize", function () { doc.querySelectorAll(".faq-item.open .faq-a").forEach(function (a) { a.style.maxHeight = a.scrollHeight + "px"; }); });

  /* ---------- Cookie consent (granulární, legální) ---------- */
  (function () {
    var KEY = "obsidio_consent_v1";
    var bar = doc.querySelector(".cookie-bar");
    var modal = doc.querySelector(".cc-modal");
    function get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
    function apply(c) {
      root.setAttribute("data-cc-analytics", c.analytics ? "1" : "0");
      root.setAttribute("data-cc-marketing", c.marketing ? "1" : "0");
      window.obsidioConsent = c;
      window.dispatchEvent(new CustomEvent("obsidio:consent", { detail: c }));
      // Sem napojte podmíněné načtení analytiky/marketingu, např.:
      // if (c.analytics) { /* load Plausible / GA4 */ }
    }
    function hideBar() { if (bar) bar.classList.remove("show"); }
    function closeModal() { if (modal) { modal.hidden = true; doc.body.classList.remove("menu-open"); } }
    function save(c) { c.necessary = true; c.ts = new Date().toISOString(); try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} apply(c); hideBar(); closeModal(); }
    function openModal() {
      if (!modal) return;
      var c = get() || { analytics: false, marketing: false };
      modal.querySelectorAll("input[data-cat]").forEach(function (i) { i.checked = !!c[i.getAttribute("data-cat")]; });
      modal.hidden = false; doc.body.classList.add("menu-open");
    }
    var cur = get();
    if (cur) apply(cur); else if (bar) setTimeout(function () { bar.classList.add("show"); }, 1000);
    doc.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cc]"); if (!t) return;
      var a = t.getAttribute("data-cc");
      if (a === "all") save({ analytics: true, marketing: true });
      else if (a === "reject") save({ analytics: false, marketing: false });
      else if (a === "open") { e.preventDefault(); openModal(); }
      else if (a === "close") closeModal();
      else if (a === "save") {
        var an = modal.querySelector('input[data-cat="analytics"]');
        var mk = modal.querySelector('input[data-cat="marketing"]');
        save({ analytics: an && an.checked, marketing: mk && mk.checked });
      }
    });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && modal && !modal.hidden) closeModal(); });
  })();

  /* ---------- Forms (demo) ---------- */
  doc.querySelectorAll("form[data-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (f.querySelector('input[name="website"]') && f.querySelector('input[name="website"]').value) return;
      var msg = doc.createElement("div"); msg.className = "form-success"; msg.setAttribute("role", "status");
      msg.textContent = "Děkujeme! Ozveme se vám do 24 hodin. (Demo formulář — propojte na e-mail nebo CRM.)";
      f.style.display = "none"; f.parentElement.appendChild(msg);
    });
  });

  /* ---------- rok + aktivní odkaz ---------- */
  doc.querySelectorAll("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
