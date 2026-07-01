/* BANHALMI guided quote calculator — pricing.json is the canonical machine-readable price source. */
(function(){
  "use strict";
  var VAT = 0.20;
  var EU_PREFIXES = ['BE','BG','CZ','DK','DE','EE','IE','EL','GR','ES','FR','HR','IT','CY','LV','LT','LU','HU','MT','NL','PL','PT','RO','SI','SK','FI','SE'];
  var labels = {
    en:{net:'Net',vat:'VAT',gross:'Gross',vat20:'20% Austrian VAT included.',reverse:'EU B2B outside Austria: reverse charge / 0% VAT estimate.'},
    hu:{net:'Nettó',vat:'ÁFA',gross:'Bruttó',vat20:'20% osztrák ÁFA-val számolva.',reverse:'Ausztrián kívüli EU-s céges adószám: fordított adózás / 0% ÁFA becslés.'},
    de:{net:'Netto',vat:'USt.',gross:'Brutto',vat20:'Inklusive 20% österreichischer USt.',reverse:'EU-Unternehmen außerhalb Österreichs: Reverse Charge / 0% USt.-Schätzung.'}
  };
  var pricesGross = {
    quick30:220, guided60:420, guided120:690,
    groupSetup:390, groupPerson:45, groupInstantBase:690, groupInstantPerson:55,
    brand60:499, brand120:790, brand180:1090, brand240:1390,
    art60:690, art120:990, art180:1290,
    event60:590, event120:890, event180:1190, event240:1490, eventFullDay:2490,
    retouchPortrait:35, retouchGroup:29, retouchArt:45,
    stylist:220, hair:220, makeup:220, express:120, mobile:240, artdirection:260,
    extraPhotographer:390, extraPhotographerEventHour:120
  };
  var pricingLoaded = false;
  function applyPricingJson(data){
    if(!data || !data.priceComponentsGrossEUR) return;
    var p = data.priceComponentsGrossEUR;
    pricesGross.quick30 = Number(p.individualQuick30 || pricesGross.quick30);
    pricesGross.guided60 = Number(p.individualGuided60 || pricesGross.guided60);
    pricesGross.guided120 = Number(p.individualGuided120 || pricesGross.guided120);
    pricesGross.groupSetup = Number(p.groupSetupLaterRetouching || pricesGross.groupSetup);
    pricesGross.groupPerson = Number(p.groupPerPersonLaterRetouching || pricesGross.groupPerson);
    pricesGross.groupInstantBase = Number(p.groupInstantBaseMax6People || pricesGross.groupInstantBase);
    pricesGross.groupInstantPerson = Number(p.groupInstantPerPerson || pricesGross.groupInstantPerson);
    pricesGross.brand60 = Number(p.brandFastOneHour || pricesGross.brand60);
    pricesGross.brand120 = Number(p.brandTwoHours || pricesGross.brand120);
    pricesGross.brand180 = Number(p.brandThreeHours || pricesGross.brand180);
    pricesGross.brand240 = Number(p.brandFourHours || pricesGross.brand240);
    var fineArtBase = Number(p.fineArtBase || pricesGross.art60);
    pricesGross.art60 = Number(p.fineArtOneHour || fineArtBase);
    pricesGross.art120 = Number(p.fineArtTwoHours || pricesGross.art120 || fineArtBase);
    pricesGross.art180 = Number(p.fineArtThreeHours || pricesGross.art180 || fineArtBase);
    pricesGross.retouchPortrait = Number(p.retouchedImagePortrait || pricesGross.retouchPortrait);
    pricesGross.retouchGroup = Number(p.retouchedImageGroup || pricesGross.retouchGroup);
    pricesGross.retouchArt = Number(p.retouchedImageFineArt || pricesGross.retouchArt);
    pricesGross.stylist = Number(p.stylist || pricesGross.stylist);
    pricesGross.hair = Number(p.hair || pricesGross.hair);
    pricesGross.makeup = Number(p.makeup || pricesGross.makeup);
    pricesGross.express = Number(p.expressDelivery || pricesGross.express);
    pricesGross.mobile = Number(p.mobileStudio || pricesGross.mobile);
    pricesGross.artdirection = Number(p.artDirection || pricesGross.artdirection);
    pricesGross.extraPhotographer = Number(p.additionalPhotographer || pricesGross.extraPhotographer);
    pricesGross.extraPhotographerEventHour = Number(p.additionalPhotographerEventPerHour || pricesGross.extraPhotographerEventHour);
    pricesGross.event60 = Number(p.eventOneHour || pricesGross.event60);
    pricesGross.event120 = Number(p.eventTwoHours || pricesGross.event120);
    pricesGross.event180 = Number(p.eventThreeHours || pricesGross.event180);
    pricesGross.event240 = Number(p.eventFourHours || pricesGross.event240);
    pricesGross.eventFullDay = Number(p.eventFullDay || pricesGross.eventFullDay);
    pricingLoaded = true;
  }
  function loadPricing(){
    if (!window.fetch) return Promise.resolve(false);
    return fetch('/pricing.json', {cache:'no-store'}).then(function(resp){
      if(!resp || !resp.ok) throw new Error('pricing unavailable');
      return resp.json();
    }).then(function(data){
      applyPricingJson(data);
      document.querySelectorAll('[data-smart-quote]').forEach(function(form){ paint(form); });
      return true;
    }).catch(function(){ pricingLoaded = false; return false; });
  }
  function money(v){ return '€' + Math.round(v).toLocaleString('de-DE'); }
  function checked(form,name){ return Array.prototype.slice.call(form.querySelectorAll('[name="'+name+'"]:checked')).map(function(i){return i.value;}); }
  function val(form,name, fallback){ var el=form.querySelector('[name="'+name+'"]:checked')||form.querySelector('[name="'+name+'"]'); return el ? el.value : fallback; }
  function num(form,name,fallback){ var el=form.querySelector('[name="'+name+'"]'); var n=el?parseInt(el.value,10):fallback; return isNaN(n)?fallback:n; }
  function numericSelect(form,name,fallback){ var el=form.querySelector('[name="'+name+'"]'); var n=el?parseInt(el.value,10):fallback; return isNaN(n)?fallback:n; }
  function extraPhotographerCost(form, cat, durationHours){
    var team = cat === 'group' ? numericSelect(form,'photographers',1) : numericSelect(form,'photographer_team',1);
    var extra = Math.max(0, team-1);
    if(!extra) return {cost:0, count:0};
    if(cat === 'event') return {cost: extra * pricesGross.extraPhotographerEventHour * Math.max(1,durationHours || 1), count: extra};
    return {cost: extra * pricesGross.extraPhotographer, count: extra};
  }
  function isReverseCharge(vatid, company){
    var raw=(vatid||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(!company || raw.length<4) return false;
    var prefix=raw.slice(0,2);
    return prefix !== 'AT' && EU_PREFIXES.indexOf(prefix) !== -1;
  }
  function updatePanels(form){
    var cat=val(form,'category','individual');
    form.querySelectorAll('[data-panel]').forEach(function(p){ p.hidden = p.getAttribute('data-panel') !== cat; });
    var delivery=val(form,'group_delivery','later');
    var people=form.querySelector('[name="people_count"]');
    if(cat==='group' && delivery==='instant' && people && parseInt(people.value,10)>6){ people.value=6; }
    if(people){ people.max = (cat==='group' && delivery==='instant') ? 6 : 200; }
  }
  function calc(form){
    updatePanels(form);
    var cat=val(form,'category','individual');
    var gross=0, parts=[];
    var retouches=Math.max(1,num(form,'retouched_images',1));
    if(cat==='individual'){
      var m=val(form,'individual_mode','quick30'); gross += pricesGross[m] || pricesGross.quick30; parts.push(m);
      if(retouches>1){ gross += (retouches-1)*pricesGross.retouchPortrait; parts.push('extra retouched images: '+(retouches-1)); }
    } else if(cat==='group'){
      var people=Math.max(1,num(form,'people_count',6)); var delivery=val(form,'group_delivery','later');
      if(delivery==='instant'){ people=Math.min(people,6); gross += pricesGross.groupInstantBase + people*pricesGross.groupInstantPerson; parts.push('instant retouching, '+people+' people'); }
      else { gross += pricesGross.groupSetup + people*pricesGross.groupPerson + retouches*pricesGross.retouchGroup; parts.push('later retouching, '+people+' people'); }
      var groupExtra = extraPhotographerCost(form, cat, 1);
      if(groupExtra.count>0){ gross += groupExtra.cost; parts.push('additional photographers: '+groupExtra.count); }
    } else if(cat==='brand'){
      var b=val(form,'brand_duration','brand60'); gross += pricesGross[b] || pricesGross.brand60; parts.push(b);
      gross += Math.max(0,retouches-3)*pricesGross.retouchPortrait; parts.push('retouched images: '+retouches);
      var brandExtra = extraPhotographerCost(form, cat, 1); if(brandExtra.count>0){ gross += brandExtra.cost; parts.push('additional photographers: '+brandExtra.count); }
    } else if(cat==='art'){
      var a=val(form,'art_duration','art60'); gross += pricesGross[a] || pricesGross.art60; parts.push(val(form,'art_type','artportrait')); parts.push(a + ' — final fine-art scope confirmed in writing');
      gross += Math.max(0,retouches-2)*pricesGross.retouchArt; parts.push('retouched images: '+retouches);
      var artExtra = extraPhotographerCost(form, cat, 1); if(artExtra.count>0){ gross += artExtra.cost; parts.push('additional photographers: '+artExtra.count); }
    } else if(cat==='event'){
      var ev=val(form,'event_duration','event60'); gross += pricesGross[ev] || pricesGross.event60; parts.push(ev);
      var eventHours = ({event60:1,event120:2,event180:3,event240:4,eventFullDay:8})[ev] || 1;
      gross += Math.max(0,retouches-3)*pricesGross.retouchPortrait; parts.push('retouched images: '+retouches);
      var eventExtra = extraPhotographerCost(form, cat, eventHours); if(eventExtra.count>0){ gross += eventExtra.cost; parts.push('additional event photographers: '+eventExtra.count+' x '+eventHours+'h'); }
    }
    checked(form,'addons').forEach(function(ad){ gross += pricesGross[ad] || 0; parts.push(ad); });
    var company=(form.querySelector('[name="company"]')||{}).value||'';
    var reverse=isReverseCharge((form.querySelector('[data-vat-id]')||{}).value||'', company);
    var net = gross/(1+VAT);
    var vat = reverse ? 0 : gross-net;
    var total = reverse ? net : gross;
    return {
      gross: Math.round(total),
      grossBeforeVatMode: Math.round(gross),
      net: Math.round(net),
      vat: Math.round(vat),
      reverse: reverse,
      vatMode: reverse ? 'reverse-charge-0-vat' : 'austrian-vat-20',
      parts: parts.join(', '),
      category: cat,
      pricingSource: pricingLoaded ? 'pricing.json' : 'pricing.json fallback',
      prices: pricesGross
    };
  }
  function paint(form){
    var lang=form.getAttribute('data-lang')||'en'; var l=labels[lang]||labels.en; var c=calc(form);
    var box=document.querySelector('[data-quote-summary]'); if(!box) return c;
    box.classList.toggle('reverse', c.reverse);
    var total=box.querySelector('[data-total]'), net=box.querySelector('[data-net]'), vat=box.querySelector('[data-vat]'), note=box.querySelector('[data-vat-note]');
    if(total) total.textContent=money(c.gross); if(net) net.textContent=money(c.net); if(vat) vat.textContent=money(c.vat); if(note) note.textContent=c.reverse?l.reverse:l.vat20;
    var hNet=form.querySelector('[data-estimate-net]'), hVat=form.querySelector('[data-estimate-vat]'), hGross=form.querySelector('[data-estimate-gross]'), hMode=form.querySelector('[data-estimate-vat-mode]'), hSummary=form.querySelector('[data-estimate-summary]');
    if(hNet) hNet.value=c.net; if(hVat) hVat.value=c.vat; if(hGross) hGross.value=c.gross; if(hMode) hMode.value=c.vatMode; if(hSummary) hSummary.value=c.parts + ' | pricing source: ' + c.pricingSource;
    return c;
  }
  function initForm(form){
    form.addEventListener('input', function(){ paint(form); });
    form.addEventListener('change', function(){ paint(form); });
    form.addEventListener('submit', function(){ paint(form); });
    return paint(form);
  }
  window.BANHALMI_QUOTE = window.BANHALMI_QUOTE || {};
  window.BANHALMI_QUOTE.calculate = calc;
  window.BANHALMI_QUOTE.paint = paint;
  window.BANHALMI_QUOTE.updatePanels = updatePanels;
  window.BANHALMI_QUOTE.loadPricing = loadPricing;
  window.BANHALMI_QUOTE.applyPricingJson = applyPricingJson;
  window.BANHALMI_QUOTE.getPrices = function(){ return JSON.parse(JSON.stringify(pricesGross)); };
  window.BANHALMI_QUOTE.money = money;
  window.BANHALMI_QUOTE.labels = labels;
  document.querySelectorAll('[data-smart-quote]').forEach(initForm);
  loadPricing();
})();
