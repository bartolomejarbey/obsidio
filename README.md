# OBSIDEO — webová prezentace studia

> **Vypadáte na milion. Platíte zlomek.**
> Bold české digitální studio · statický web s heavy motion, nasaditelný kamkoliv.

Kompletně nová značka — vymyšlené jméno, vlastní design systém, originální copy. Není vázán na žádnou existující agenturu ani osobu. Postaveno jako originál v top-tier kvalitě (bold creative-studio).

---

## 🏷️ Značka
| | |
|---|---|
| **Název** | Obsideo |
| **Doména (kup)** | `obsideo.cz` (záloha: `obsideo.com`, `nordeo.cz`, `varseo.cz`, `savento.cz`) |
| **Tagline** | Vypadáte na milion. Platíte zlomek. |
| **Pozice** | Vzhled a výkon značek za statisíce — za ceny od 6 000 Kč. |

## 🎨 Design systém (v3 — bold creative studio)
- **Barvy:** deep ink `#0B0C10`, bone `#ECE6D7`, **electric indigo `#4736FF`** (signature akcent). Plné barevné full-bleed sekce (`panel--ink` / `panel--bone` / `panel--volt`) se střídají pro rytmus.
- **Písma:** **Inter Tight** (display, gigantické nadpisy) + **Caveat** (script — „crazy" akcentní slova) + **Inter** (text). Google Fonts, zdarma.
- **Motion engine:** **Lenis** (smooth scroll) + **GSAP ScrollTrigger** (z CDN). Kinetický SVG ribbon hero, line-mask reveal nadpisů, horizontálně pinned sekce „PRÁCE", scroll reveal se staggerem, count-up čísla, custom cursor, magnetická tlačítka, floating bar se scroll-progressem, marquee pásy.
- Vše v `assets/css/obsideo.css` (barvy = CSS proměnné nahoře, změníte na jednom místě) a `assets/js/obsideo.js`.
- Inspirováno laťkou tvého projektu **Obchodniq** (Lenis + motion + glass nav + ribbon hero) a bold agenturním webdesignem.

## 📁 Struktura (20 stránek)
```
obsideo/
├── index.html                    # Homepage (kinetic hero, horizontální PRÁCE…)
├── sluzby/  (index + 8 detailů: social-bot, webove-stranky, marketing, seo,
│             geo, automatizace, systemy-na-miru, grafika)
├── cenik/  audit-zdarma/  reference/  o-nas/  blog/  kontakt/  casto-kladene-dotazy/
├── obchodni-podminky/  ochrana-osobnich-udaju/  cookies/   # právní (VZORY)
├── assets/css/obsideo.css   assets/js/obsideo.js   assets/img/obsideo-mark.svg
├── _template.html  _build-guide.md   # kostra + reference pro přidávání stránek
├── GRAFICKY-BRIEF.md   README.md
```

## 🚀 Spuštění lokálně
```bash
cd obsideo
python3 -m http.server 8000
# http://localhost:8000
```
(Web servíruj z kořene složky `obsideo` — používá absolutní cesty `/assets/...`.)

## ☁️ Nasazení (zdarma, do 5 minut)
Statický web. **Netlify / Vercel / Cloudflare Pages:** přetáhni složku `obsideo` → nastav doménu `obsideo.cz`. Nebo FTP na klasický hosting (Wedos/Forpsi) do `www/`. Zapni HTTPS.
> Pozn.: Lenis + GSAP se načítají z CDN (jsdelivr). Pro 100% nezávislost na CDN je můžeš stáhnout do `/assets/js/` a přepsat 3 `<script>` odkazy (volitelné).

---

## ⚠️ NEŽ PUSTÍŠ WEB ŽIVĚ — co vyměnit (find-and-replace)
1. **Telefon** `+420 000 000 000` → reálný.
2. **E-mail** `ahoj@obsideo.cz` → tvůj (zřiď schránku na doméně).
3. **IČO** `00000000` → reálné.
4. **Reference, jména a čísla** (+212 %, „Petr H., řeznictví Brno"…) jsou **ilustrativní**. ❗ Nahraď reálnými — vymyšlené recenze jsou v ČR/EU klamavá reklama.
5. **Obrázky** v referencích/blogu jsou placeholdery z `picsum.photos` (šedotón). Nahraď reálnými fotkami/náhledy (viz `GRAFICKY-BRIEF.md`).
6. **Právní stránky** (VOP, GDPR, Cookies) jsou **vzory** — nech projít právníkem, doplň datum účinnosti.
7. **DPH** — doplň v ceníku/FAQ, zda jsi plátce.
8. **Blog** — články odkazují na `#` (placeholder). Dopiš, nebo blog skryj z menu.
9. **Formuláře** jsou napojené na **Formspree** (`https://formspree.io/f/xlgkwzkd`) — odesílají AJAXem, ukážou inline poděkování. V Formspree dashboardu si ověř/změň cílový e-mail. (Chceš jiný endpoint? Přepiš `action` na obou `<form>` v `kontakt/` a `audit-zdarma/`.)

## 🖼️ Grafika
Web běží i bez fotek (vlastní SVG logo, kinetický ribbon, typografie). Veškeré grafické zadání jako hotové prompty je v **`GRAFICKY-BRIEF.md`** (logo, favicon, OG, reference, vizitka, polep auta, social šablony).

## 🛠️ Přidání stránky
Zkopíruj `_template.html`, vyplň `{{TITLE}}/{{DESC}}/{{MAIN}}` podle `_build-guide.md` (kompletní reference komponent a sekčních bloků), ulož jako `nazev/index.html`.

---
*Identita vybrána demokratickým hlasováním AI agentů, design a copy originální, postaveno automaticky a vizuálně ověřeno.*
