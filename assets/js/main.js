/* NORBERTBANHALMI.COM — minimal interactions. No analytics loads before consent. */
(function () {
  "use strict";

  // Mobile menu
  var nav = document.querySelector(".nav");
  var btn = document.querySelector(".menu-btn");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    nav.querySelectorAll(".nav-links a, .lang-switch a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }



  // Production 2.3 navigation hardening: close on outside click and Escape.
  document.addEventListener("click", function (event) {
    if (!nav || !btn || !nav.classList.contains("open")) return;
    if (!nav.contains(event.target)) {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", function (event) {
    if (!nav || !btn) return;
    if (event.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });

  // Scroll reveal (respects reduced motion)
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Cookie consent gate. No marketing or analytics script
  // may load before consent is given. Wire any future scripts inside grant().
  var KEY = "banhalmi_consent";
  var bar = document.querySelector(".cookie");
  function decided() { try { return localStorage.getItem(KEY); } catch (e) { return "essential"; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function grant() {
    /* Consented (analytics/marketing) script loaders go here.
       TrustIndex review widget — loads ONLY after consent (GDPR: no third-party
       CDN/cookies before the user agrees). Guarded so it injects at most once. */
    if (!document.getElementById("trustindex-richsnippet")) {
      var ti = document.createElement("script");
      ti.id = "trustindex-richsnippet";
      ti.type = "text/javascript";
      ti.defer = true;
      ti.async = true;
      ti.src = "https://cdn.trustindex.io/assets/js/richsnippet.js?c307c9433572g62e";
      document.head.appendChild(ti);
    }
    if (document.querySelector('[class*="elfsight-app-"]') && !document.getElementById("elfsight-platform")) {
      var ef = document.createElement("script");
      ef.id = "elfsight-platform";
      ef.type = "text/javascript";
      ef.defer = true;
      ef.async = true;
      ef.src = "https://elfsightcdn.com/platform.js";
      document.head.appendChild(ef);
    }
  }
  function revokeThirdPartyScripts() {
    ["trustindex-richsnippet", "elfsight-platform"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }
  function openCookieSettings() {
    if (!bar) return;
    bar.classList.add("show");
    var first = bar.querySelector("button");
    if (first) first.focus({ preventScroll: true });
  }
  if (bar) {
    if (!decided()) { bar.classList.add("show"); }
    else if (decided() === "all") { grant(); }
    var accept = bar.querySelector("[data-accept]");
    var decline = bar.querySelector("[data-decline]");
    if (accept) accept.addEventListener("click", function () { set("all"); bar.classList.remove("show"); grant(); });
    if (decline) decline.addEventListener("click", function () { set("essential"); revokeThirdPartyScripts(); bar.classList.remove("show"); });
  }
  document.querySelectorAll("[data-cookie-settings]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      openCookieSettings();
    });
  });



  // Budget guidance for the guided quote builder
  document.querySelectorAll('[data-budget-select]').forEach(function(sel){
    var box = document.querySelector(sel.getAttribute('data-target'));
    var lang = sel.getAttribute('data-lang') || 'en';
    var copy = {
      en: {
        small:'This usually fits a focused 30-minute Executive Headshot: one strong portrait for LinkedIn, press or a website profile.',
        medium:'This usually fits an Executive Portrait session with calmer preparation, guided image selection and more strategic use.',
        large:'This can support Personal Branding or a broader portrait set for website, media and public communication.',
        xlarge:'This range is suitable for team, event or corporate visual systems, depending on scope and usage rights.',
        custom:'For larger or mixed projects, a personal quote is the right way to define scope, licensing and delivery rhythm.',
        unsure:'If the budget is not clear yet, describe the result you need. I will recommend the smallest format that can honestly do the job.'
      },
      hu: {
        small:'Ez jellemzően egy fókuszált, 30 perces Executive Headshot keret: egy erős portré LinkedInre, sajtóhoz vagy weboldalra.',
        medium:'Ebbe általában egy nyugodtabb Executive Portrait folyamat fér bele, előkészítéssel, irányított képkiválasztással és stratégiai felhasználással.',
        large:'Ez már alkalmas personal branding vagy több képből álló portrésorozat tervezésére weboldalra, médiára és nyilvános kommunikációra.',
        xlarge:'Ez a tartomány csapat-, rendezvény- vagy vállalati vizuális rendszerhez illik, a terjedelemtől és felhasználási jogoktól függően.',
        custom:'Nagyobb vagy vegyes projektnél személyes ajánlat szükséges, hogy a terjedelem, jogok és átadási ritmus tiszta legyen.',
        unsure:'Ha még nem biztos a keret, írd le az eredményt, amit szeretnél. A legkisebb korrekt formátumot fogom javasolni.'
      },
      de: {
        small:'Das passt meist zu einem fokussierten 30-Minuten Executive Headshot: ein starkes Portrait für LinkedIn, Presse oder Website.',
        medium:'Das passt meist zu einer Executive Portrait Session mit ruhiger Vorbereitung, geführter Auswahl und strategischer Nutzung.',
        large:'Damit lässt sich Personal Branding oder ein breiteres Portrait-Set für Website, Medien und öffentliche Kommunikation planen.',
        xlarge:'Dieser Rahmen eignet sich für Team-, Event- oder Corporate-Visual-Systeme, abhängig von Umfang und Nutzungsrechten.',
        custom:'Für größere oder gemischte Projekte ist ein persönliches Angebot sinnvoll, damit Umfang, Rechte und Lieferung klar sind.',
        unsure:'Wenn das Budget noch offen ist, beschreiben Sie das gewünschte Ergebnis. Ich empfehle das kleinste Format, das die Aufgabe ehrlich erfüllen kann.'
      }
    };
    function update(){
      if(!box) return;
      while(box.firstChild){ box.removeChild(box.firstChild); }
      var strong = document.createElement('strong');
      strong.textContent = (sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '');
      box.appendChild(strong);
      box.appendChild(document.createElement('br'));
      box.appendChild(document.createTextNode((copy[lang][sel.value] || '')));
    }
    sel.addEventListener('change', update); update();
  });


  // Contact and quote forms — send JSON to the configured endpoint and require a verifiable response.
  // Expected server response: { "ok": true, "submissionId": "..." }. No silent success.
  function readField(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }
  function readChecked(form, name) {
    return Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]:checked')).map(function (el) { return el.value; });
  }
  function readRadio(form, name) {
    var el = form.querySelector('[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  function normalizeVatId(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  function isEuReverseChargeEligible(vatId, companyName) {
    var prefixes = ['BE','BG','CZ','DK','DE','EE','IE','EL','GR','ES','FR','HR','IT','CY','LV','LT','LU','HU','MT','NL','PL','PT','RO','SI','SK','FI','SE'];
    var raw = normalizeVatId(vatId);
    if (!companyName || raw.length < 4) return false;
    var prefix = raw.slice(0, 2);
    return prefix !== 'AT' && prefixes.indexOf(prefix) !== -1;
  }
  function categoryLabel(category, lang) {
    var map = {
      en: {individual:'Individual portrait', group:'Group portraits', brand:'Brand & visual positioning', art:'Fine art photography', event:'C-level event photography'},
      hu: {individual:'Egyéni portré', group:'Csoportos portré', brand:'Brand és vizuális pozicionálás', art:'Művészi fotózás', event:'C-szintű rendezvényfotózás'},
      de: {individual:'Einzelportrait', group:'Gruppenportraits', brand:'Brand & visuelle Positionierung', art:'Fine-Art-Fotografie', event:'C-Level Eventfotografie'}
    };
    return (map[lang] && map[lang][category]) || category;
  }
  function buildQuotePayload(form) {
    var lang = form.getAttribute('data-lang') || document.documentElement.lang || 'en';
    var quoteEngine = window.BANHALMI_QUOTE;
    var estimate = quoteEngine && typeof quoteEngine.paint === 'function' ? quoteEngine.paint(form) : quoteEngine && typeof quoteEngine.calculate === 'function' ? quoteEngine.calculate(form) : null;
    var category = readRadio(form, 'category') || 'individual';
    var companyName = readField(form, 'company');
    var vatId = readField(form, 'vat_id');
    var reverse = estimate ? !!estimate.reverse : isEuReverseChargeEligible(vatId, companyName);
    var addons = readChecked(form, 'addons');
    var payload = {
      language: lang,
      pageUrl: window.location.href,
      formType: 'quote',
      payloadVersion: 'banhalmi-quote-v3-shared-engine',
      formTitle: 'BANHALMI guided quote request',
      category: categoryLabel(category, lang),
      categoryCode: category,
      packageName: '',
      duration: '',
      peopleCount: '',
      retouchedImages: readField(form, 'retouched_images'),
      retouchMode: '',
      photographerCount: category === 'group' ? readField(form, 'photographers') : (readField(form, 'photographer_team') || ''),
      coordinationPreference: readField(form, 'coordination_preference'),
      projectGoals: readChecked(form, 'project_goals').join(', '),
      amchamMember: !!form.querySelector('[name="amcham_member"]:checked'),
      amchamCountry: readField(form, 'amcham_country'),
      amchamBenefit: '',
      locationType: readField(form, 'location'),
      locationDetails: readField(form, 'specific_location'),
      preferredDates: readField(form, 'timeframe'),
      preferredTime: readField(form, 'preferred_time'),
      addons: addons.join(', '),
      budget: readField(form, 'budget'),
      netAmount: estimate ? String(estimate.net) : readField(form, 'estimate_net'),
      vatRate: reverse ? '0%' : '20%',
      vatAmount: estimate ? String(estimate.vat) : readField(form, 'estimate_vat'),
      grossAmount: estimate ? String(estimate.gross) : readField(form, 'estimate_gross'),
      reverseCharge: reverse,
      euVatNumber: normalizeVatId(vatId),
      name: readField(form, 'name'),
      email: readField(form, 'email'),
      phone: readField(form, 'phone'),
      companyName: companyName,
      billingAddress: readField(form, 'billing_address'),
      message: readField(form, 'message'),
      consent: !!form.querySelector('[name="consent"]:checked'),
      sendCopy: !!form.querySelector('[name="send_copy"]:checked'),
      estimateSummary: estimate ? estimate.parts + ' | pricing source: ' + estimate.pricingSource : readField(form, 'estimate_summary'),
      estimateVatMode: estimate ? estimate.vatMode : readField(form, 'estimate_vat_mode')
    };
    if (category === 'individual') {
      payload.packageName = readRadio(form, 'individual_mode');
      payload.duration = payload.packageName === 'quick30' ? '30 minutes' : (payload.packageName === 'guided120' ? '2 hours' : '1 hour');
      payload.retouchMode = 'selected retouched images';
    } else if (category === 'group') {
      payload.peopleCount = readField(form, 'people_count');
      payload.photographerCount = readField(form, 'photographers') || readField(form, 'photographer_team');
      payload.retouchMode = readRadio(form, 'group_delivery') === 'instant' ? 'immediate retouching / max 6 people' : 'later retouching / originals delivered immediately / 48h retouching';
      payload.packageName = 'group-' + (readRadio(form, 'group_delivery') || 'later');
      payload.duration = 'from 1 hour, depending on team size';
    } else if (category === 'brand') {
      payload.packageName = readRadio(form, 'brand_duration');
      payload.duration = ({brand60:'1 hour', brand120:'2 hours', brand180:'3 hours', brand240:'4 hours'})[payload.packageName] || '';
      payload.retouchMode = 'immediate selection, retouching per selected image';
    } else if (category === 'art') {
      payload.packageName = [readRadio(form, 'art_type'), readField(form, 'art_duration') || 'art60'].filter(Boolean).join(' / ');
      payload.duration = ({art60:'1 hour', art120:'2 hours', art180:'3 hours'})[readField(form, 'art_duration') || 'art60'] || 'selected fine-art block';
      payload.retouchMode = 'fine art retouching per selected image';
    } else if (category === 'event') {
      payload.packageName = readRadio(form, 'event_duration');
      payload.duration = ({event60:'1 hour', event120:'2 hours', event180:'3 hours', event240:'4 hours', eventFullDay:'full day / up to 8 hours'})[payload.packageName] || '';
      payload.retouchMode = 'event selection and retouching per selected image';
    }
    var selectedRetouches = parseInt(payload.retouchedImages || '0', 10) || 0;
    if (payload.amchamMember && selectedRetouches > 0) {
      var extra = Math.ceil(selectedRetouches * 0.5);
      payload.amchamBenefit = 'Professional Network Benefit: +' + extra + ' additional retouched images at no extra cost (' + (selectedRetouches + extra) + ' total).';
    } else if (payload.amchamMember) {
      payload.amchamBenefit = 'Professional Network Benefit applies: 50% additional retouched images once the final image count is confirmed.';
    }
    return payload;
  }
  function buildGenericPayload(form) {
    var data = new FormData(form);
    var payload = { language: form.getAttribute('data-lang') || document.documentElement.lang || 'en', pageUrl: window.location.href, payloadVersion: 'banhalmi-contact-v2', formType: form.getAttribute('data-form-kind') || 'contact', formTitle: form.getAttribute('data-form-title') || 'BANHALMI contact form', category: form.getAttribute('data-form-kind') === 'contact' ? 'Contact' : '' };
    data.forEach(function (value, key) {
      if (key === 'website') return;
      payload[key] = value;
    });
    payload.consent = !!form.querySelector('[name="consent"]:checked');
    return payload;
  }

  function updateProjectSummary(form) {
    var box = form.querySelector('[data-project-summary]');
    if (!box) return;
    var lang = form.getAttribute('data-lang') || document.documentElement.lang || 'en';
    var labels = {
      en: {service:'Service', location:'Location', date:'Preferred date', photographers:'Photographer(s)', retouch:'Retouched images', budget:'Budget', amcham:'AmCham member', yes:'Yes — Professional Network Benefit applies', no:'No / not specified'},
      hu: {service:'Szolgáltatás', location:'Helyszín', date:'Időpontpreferencia', photographers:'Fotósok száma', retouch:'Retusált képek', budget:'Költségkeret', amcham:'AmCham tagság', yes:'Igen — Professional Network Benefit érvényes', no:'Nem / nincs megadva'},
      de: {service:'Leistung', location:'Ort', date:'Wunschtermin', photographers:'Fotograf(en)', retouch:'Retuschierte Bilder', budget:'Budgetrahmen', amcham:'AmCham Mitgliedschaft', yes:'Ja — Professional Network Benefit gilt', no:'Nein / nicht angegeben'}
    };
    var l = labels[lang] || labels.en;
    var service = categoryLabel(readRadio(form, 'category') || 'individual', lang);
    var location = readField(form, 'specific_location') || readField(form, 'location') || '—';
    var date = readField(form, 'timeframe') || '—';
    var photographers = readField(form, 'photographer_team') || readField(form, 'photographers') || '—';
    var retouches = readField(form, 'retouched_images') || '—';
    var budget = readField(form, 'budget') || '—';
    var amcham = form.querySelector('[name="amcham_member"]:checked') ? l.yes : l.no;
    function set(sel, text) { var el = box.querySelector(sel); if (el) el.textContent = text; }
    set('[data-summary-service]', l.service + ': ' + service);
    set('[data-summary-location]', l.location + ': ' + location);
    set('[data-summary-date]', l.date + ': ' + date);
    set('[data-summary-photographers]', l.photographers + ': ' + photographers);
    set('[data-summary-retouch]', l.retouch + ': ' + retouches);
    set('[data-summary-budget]', l.budget + ': ' + budget);
    set('[data-summary-amcham]', l.amcham + ': ' + amcham);
    var copy = form.querySelector('[data-amcham-copy]');
    if (copy) { copy.hidden = !form.querySelector('[name="amcham_member"]:checked'); }
  }
  document.querySelectorAll('[data-amcham-toggle]').forEach(function(input){
    var form = input.closest('form');
    input.addEventListener('change', function(){ if(form) updateProjectSummary(form); });
  });
  document.querySelectorAll('[data-smart-quote]').forEach(function(form){
    form.addEventListener('input', function(){ updateProjectSummary(form); });
    form.addEventListener('change', function(){ updateProjectSummary(form); });
    updateProjectSummary(form);
  });

  document.querySelectorAll("[data-contact-form]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.elements.website && form.elements.website.value) { return; }
      var isQuote = form.getAttribute('data-form-kind') === 'quote' || (form.elements.form_type && form.elements.form_type.value === 'quote');
      var payload = isQuote ? buildQuotePayload(form) : buildGenericPayload(form);
      payload.pageUrl = window.location.href;
      payload.submittedAt = new Date().toISOString();
      var config = window.BANHALMI_CONFIG || {};
      var endpoint = config.formEndpoint || (isQuote ? config.quoteEndpoint : config.contactEndpoint) || window.BANHALMI_FORM_ENDPOINT || "";
      var note = form.querySelector("[data-form-note]");
      var submit = form.querySelector('[type="submit"]');
      function message(type) {
        var lang = form.getAttribute('data-lang') || document.documentElement.lang || 'en';
        var copy = {
          success: {
            en:'Thank you. Your enquiry has been received and verified by the server.',
            de:'Vielen Dank. Ihre Anfrage wurde vom Server bestätigt.',
            hu:'Köszönöm. Az ajánlatkérés szerveroldali visszaigazolással megérkezett.'
          },
          error: {
            en:'The browser could not verify the server response. Please send the request by email or try again.',
            de:'Der Browser konnte die Serverantwort nicht verifizieren. Bitte senden Sie die Anfrage per E-Mail oder versuchen Sie es erneut.',
            hu:'A böngésző nem tudta ellenőrizni a szerver válaszát. Kérlek küldd el e-mailben, vagy próbáld újra.'
          }
        };
        var key = lang.indexOf('hu') === 0 ? 'hu' : lang.indexOf('de') === 0 ? 'de' : 'en';
        return (copy[type] && copy[type][key]) || copy[type].en;
      }
      function showNote(text, isError) {
        if (submit) { submit.disabled = false; submit.removeAttribute('aria-busy'); }
        if (note) {
          note.hidden = false;
          note.textContent = text || message('success');
          note.style.color = isError ? '#8a2f18' : 'var(--gold-deep)';
          note.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        }
      }
      function openMailFallback() {
        var supportEmail = (window.BANHALMI_CONFIG && window.BANHALMI_CONFIG.supportEmail) || 'hello@norbertbanhalmi.com';
        var subject = encodeURIComponent((isQuote ? 'BANHALMI quote request — ' : 'BANHALMI enquiry — ') + (payload.category || payload.subject || payload.service || 'photography'));
        var body = encodeURIComponent(Object.keys(payload).map(function (key) { return key + ': ' + payload[key]; }).join("\n"));
        window.location.href = "mailto:" + supportEmail + "?subject=" + subject + "&body=" + body;
      }
      function fallbackMailto(options) {
        options = options || {};
        if (submit) { submit.disabled = false; submit.removeAttribute('aria-busy'); }
        var isAppsScript = /script\.google\.com\/macros\/s\//.test(endpoint || '');
        if (options.fromVerifiedSubmit && isAppsScript) {
          var lang = form.getAttribute('data-lang') || document.documentElement.lang || 'en';
          var key = lang.indexOf('hu') === 0 ? 'hu' : lang.indexOf('de') === 0 ? 'de' : 'en';
          var copy = {
            en:'The request may have reached the server, but the browser could not verify the Google Apps Script response. Please check your confirmation email; do not resend unless no confirmation arrives.',
            de:'Die Anfrage wurde möglicherweise gesendet, aber der Browser konnte die Google-Apps-Script-Antwort nicht verifizieren. Bitte prüfen Sie die Bestätigungs-E-Mail und senden Sie nicht erneut, außer es kommt keine Bestätigung an.',
            hu:'Az üzenet valószínűleg elindult, de a böngésző nem tudta ellenőrizni a Google Apps Script válaszát. Kérlek nézd meg, érkezik-e visszaigazoló e-mail; csak akkor küldd újra, ha nem érkezik megerősítés.'
          };
          showNote(copy[key] || copy.en, true);
          return;
        }
        openMailFallback();
        showNote(message('error'), true);
      }
      function submitVerified() {
        return fetch(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "text/plain;charset=utf-8", "Accept": "application/json,text/plain,*/*" },
          mode: "cors",
          credentials: "omit",
          keepalive: true
        }).then(function(response){
          if (!response || !response.ok) throw new Error('Form endpoint returned HTTP ' + (response && response.status));
          return response.text().then(function(text){
            var data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {ok:true, raw:text}; }
            if (data && data.ok === false) throw new Error(data.error || 'Form endpoint rejected the request');
            return data;
          });
        });
      }
      if (submit) { submit.disabled = true; submit.setAttribute('aria-busy', 'true'); }
      if (endpoint && window.fetch) {
        submitVerified().then(function(data){
          showNote(message('success') + (data && data.submissionId ? ' ID: ' + data.submissionId : ''), false);
          form.reset();
          if (isQuote && window.BANHALMI_QUOTE && typeof window.BANHALMI_QUOTE.paint === 'function') { window.BANHALMI_QUOTE.paint(form); }
        }).catch(function(){ fallbackMailto({fromVerifiedSubmit:true}); });
      } else {
        fallbackMailto();
      }
    });
  });

  // ---------- Portfolio gallery: lazy-load, filter, lightbox ----------
  var grid = document.querySelector("[data-gallery]");
  if (grid) {
    // Lazy-load images via data-src
    var imgs = grid.querySelectorAll("img[data-src]");
    function load(img) {
      if (img.dataset.avif && document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0) {
        img.src = img.dataset.avif;
      } else {
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.src = img.dataset.src;
      }
      img.addEventListener("load", function () { img.classList.add("loaded"); });
      img.removeAttribute("data-src");
    }
    if ("IntersectionObserver" in window) {
      var lio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); lio.unobserve(e.target); } });
      }, { rootMargin: "300px 0px" });
      imgs.forEach(function (im) { lio.observe(im); });
    } else {
      imgs.forEach(load);
    }

    // Category filter
    var filters = document.querySelectorAll("[data-filter]");
    var sections = document.querySelectorAll("[data-cat-section]");
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
        sections.forEach(function (s) {
          var show = (cat === "all" || s.getAttribute("data-cat-section") === cat);
          s.classList.toggle("pf-hidden", !show);
        });
      });
    });

    // Lightbox
    var lb = document.querySelector("[data-lightbox]");
    if (lb) {
      var lbImg = lb.querySelector("img");
      var lbCap = lb.querySelector(".lb-cap");
      var items = [];
      var current = 0;
      function refreshItems() {
        items = Array.prototype.slice.call(grid.querySelectorAll(".pf-item:not(.pf-hidden) [data-large]"));
      }
      function show(i) {
        refreshItems();
        if (!items.length) return;
        current = (i + items.length) % items.length;
        var el = items[current];
        lbImg.src = el.getAttribute("data-large");
        lbCap.textContent = el.getAttribute("data-cap") || "";
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      }
      function close() { lb.classList.remove("open"); document.body.style.overflow = ""; lbImg.src = ""; }
      grid.addEventListener("click", function (ev) {
        var t = ev.target.closest("[data-large]");
        if (!t) return;
        refreshItems();
        show(items.indexOf(t));
      });
      lb.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
      lb.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
      lb.querySelector(".lb-close").addEventListener("click", close);
      lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight") show(current + 1);
        else if (e.key === "ArrowLeft") show(current - 1);
      });
    }
  }

  // Production 3.1 — subtle text reveal, with reduced-motion support.
  (function () {
    var reduceTextMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var textNodes = document.querySelectorAll("main h1, main h2, main h3, main .lead, main p, main li, main blockquote");
    textNodes.forEach(function (el) {
      if (el.closest("form") || el.closest("nav") || el.closest("footer") || el.closest(".nav-links") || el.closest(".cookie")) return;
      el.classList.add("text-reveal");
    });
    var revealText = document.querySelectorAll(".text-reveal");
    if (reduceTextMotion || !("IntersectionObserver" in window)) {
      revealText.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var textObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          textObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    revealText.forEach(function (el) { textObserver.observe(el); });
  })();

  // Production 3.2 — subtle parallax on the homepage hero's center logo mark.
  (function () {
    var logo = document.querySelector(".hero.hero-image-first .hero-center-logo");
    if (!logo) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia && window.matchMedia("(max-width: 720px)").matches) return;
    var figure = logo.closest(".hero-figure");
    var ticking = false;
    function update() {
      ticking = false;
      var rect = figure.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var shift = rect.top * -0.08;
      shift = Math.max(-18, Math.min(18, shift));
      logo.style.transform = "translate(-50%, calc(-50% + " + shift + "px))";
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  })();

})();
