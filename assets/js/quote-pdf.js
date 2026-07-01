/* BANHALMI client-side PDF offer generator — uses the shared quote engine directly. */
(function(){
  "use strict";
  var I18N={
    en:{title:'Non-binding BANHALMI orientation offer',subtitle:'Generated from the guided quote builder',created:'Created',total:'Estimated total',net:'Net',vat:'VAT',tax:'Tax mode',service:'Service',package:'Package',duration:'Duration',people:'People',photographers:'Photographers',retouched:'Retouched images',location:'Location',date:'Preferred date',budget:'Budget',addons:'Add-ons',client:'Client',company:'Company',email:'Email',phone:'Phone',vatid:'VAT ID',message:'Project note',summary:'Calculation summary',none:'None selected',disclaimer:'This PDF is a non-binding orientation estimate. The final written offer depends on purpose, location, usage rights, timing, production complexity and confirmed tax status.',footer:'BANHALMI · Executive portrait & visual positioning · Vienna / Budapest · hello@norbertbanhalmi.com',filename:'banhalmi-orientation-offer'},
    de:{title:'Unverbindliches BANHALMI Orientierungsangebot',subtitle:'Aus dem Anfrage-Kalkulator erstellt',created:'Erstellt',total:'Geschätzte Summe',net:'Netto',vat:'USt.',tax:'Steuerlogik',service:'Leistung',package:'Paket',duration:'Dauer',people:'Personen',photographers:'Fotografen',retouched:'Retuschierte Bilder',location:'Ort',date:'Wunschtermin',budget:'Budget',addons:'Zusatzleistungen',client:'Kunde',company:'Unternehmen',email:'E-Mail',phone:'Telefon',vatid:'UID',message:'Projektnotiz',summary:'Kalkulationszusammenfassung',none:'Keine ausgewählt',disclaimer:'Dieses PDF ist eine unverbindliche Orientierungsschätzung. Das finale schriftliche Angebot hängt von Zweck, Ort, Nutzungsrechten, Timing, Produktionskomplexität und bestätigtem Steuerstatus ab.',footer:'BANHALMI · Executive Porträt & visuelle Positionierung · Wien / Budapest · hello@norbertbanhalmi.com',filename:'banhalmi-orientierungsangebot'},
    hu:{title:'Nem kötelező érvényű BANHALMI tájékoztató ajánlat',subtitle:'Az ajánlatkérő kalkulátorból generálva',created:'Készült',total:'Becsült végösszeg',net:'Nettó',vat:'ÁFA',tax:'Adózási mód',service:'Szolgáltatás',package:'Csomag',duration:'Időtartam',people:'Létszám',photographers:'Fotósok',retouched:'Retusált képek',location:'Helyszín',date:'Időpont',budget:'Költségkeret',addons:'Kiegészítők',client:'Ügyfél',company:'Cég',email:'E-mail',phone:'Telefon',vatid:'EU adószám',message:'Projektleírás',summary:'Számítási összefoglaló',none:'Nincs kiválasztva',disclaimer:'Ez a PDF nem kötelező érvényű tájékoztató becslés. A végleges írásos ajánlat a cél, helyszín, felhasználási jogok, időzítés, produkciós komplexitás és megerősített adózási státusz alapján készül.',footer:'BANHALMI · Executive portré & vizuális pozicionálás · Bécs / Budapest · hello@norbertbanhalmi.com',filename:'banhalmi-tajekoztato-ajanlat'}
  };
  function radioValue(form,name){ var el=form.querySelector('[name="'+name+'"]:checked'); return el?el.value:''; }
  function checkedValues(form,name){ return Array.prototype.slice.call(form.querySelectorAll('[name="'+name+'"]:checked')).map(function(el){ return el.parentElement ? el.parentElement.textContent.replace(/\s+/g,' ').trim() : el.value; }); }
  function selectedLabel(form,name){ var el=form.querySelector('[name="'+name+'"]:checked'); if(el) return el.parentElement.textContent.replace(/\s+/g,' ').trim(); var sel=form.querySelector('select[name="'+name+'"]'); if(sel && sel.selectedIndex>=0) return sel.options[sel.selectedIndex].text.replace(/\s+/g,' ').trim(); return ''; }
  function field(form,name){ var input=form.querySelector('[name="'+name+'"]'); return input ? String(input.value || '').trim() : ''; }
  function categoryLabel(code, lang){
    var map={
      en:{individual:'Individual portrait',group:'Group portraits',brand:'Brand & visual positioning',art:'Fine art photography',event:'C-level event photography'},
      de:{individual:'Einzelportrait',group:'Gruppenportraits',brand:'Brand & visuelle Positionierung',art:'Fine-Art-Fotografie',event:'C-Level Eventfotografie'},
      hu:{individual:'Egyéni portré',group:'Csoportos portré',brand:'Brand és vizuális pozicionálás',art:'Művészi fotózás',event:'C-szintű rendezvényfotózás'}
    };
    return (map[lang] && map[lang][code]) || code || '';
  }
  function packageLabel(form, cat){
    if(cat==='individual') return selectedLabel(form,'individual_mode');
    if(cat==='group') return selectedLabel(form,'group_delivery');
    if(cat==='brand') return selectedLabel(form,'brand_duration');
    if(cat==='art') return [selectedLabel(form,'art_type'), selectedLabel(form,'art_duration')].filter(Boolean).join(' - ');
    if(cat==='event') return selectedLabel(form,'event_duration');
    return '';
  }
  function packageDuration(form, cat){
    var maps={individual:{quick30:'30 minutes',guided60:'1 hour',guided120:'2 hours'},brand:{brand60:'1 hour',brand120:'2 hours',brand180:'3 hours',brand240:'4 hours'},event:{event60:'1 hour',event120:'2 hours',event180:'3 hours',event240:'4 hours',eventFullDay:'full day / up to 8 hours'},art:{art60:'1 hour',art120:'2 hours',art180:'3 hours'}};
    var key = cat==='individual' ? radioValue(form,'individual_mode') : cat==='brand' ? radioValue(form,'brand_duration') : cat==='event' ? radioValue(form,'event_duration') : cat==='art' ? field(form,'art_duration') : '';
    return (maps[cat] && maps[cat][key]) || (cat==='group' ? 'from 1 hour, depending on team size' : '');
  }
  function langOf(form){ var raw=(form.getAttribute('data-lang')||document.documentElement.lang||'en').toLowerCase(); return raw.indexOf('hu')===0?'hu':raw.indexOf('de')===0?'de':'en'; }
  function collect(form){
    var api=window.BANHALMI_QUOTE;
    var estimate=api && typeof api.paint==='function' ? api.paint(form) : api && typeof api.calculate==='function' ? api.calculate(form) : null;
    var lang=langOf(form), l=I18N[lang]||I18N.en, cat=radioValue(form,'category')||'individual';
    var rows=[];
    function add(label, value){ if(value && String(value).trim()) rows.push([label, String(value).trim()]); }
    add(l.service, categoryLabel(cat, lang));
    add(l.package, packageLabel(form, cat));
    add(l.duration, packageDuration(form, cat));
    if(cat==='group') add(l.people, field(form,'people_count'));
    add(l.photographers, cat==='group' ? field(form,'photographers') : field(form,'photographer_team'));
    add(l.retouched, field(form,'retouched_images'));
    add(l.location, selectedLabel(form,'location') || field(form,'specific_location'));
    add(l.date, field(form,'timeframe'));
    add(l.budget, field(form,'budget'));
    var addons=checkedValues(form,'addons').join(', '); add(l.addons, addons || l.none);
    add(l.client, field(form,'name'));
    add(l.company, field(form,'company'));
    add(l.email, field(form,'email'));
    add(l.phone, field(form,'phone'));
    add(l.vatid, field(form,'vat_id'));
    add(l.message, field(form,'message'));
    add(l.summary, estimate ? estimate.parts + ' | pricing source: ' + estimate.pricingSource : field(form,'estimate_summary'));
    return {
      lang:lang, l:l, rows:rows,
      net: estimate ? estimate.net : field(form,'estimate_net') || '0',
      vat: estimate ? estimate.vat : field(form,'estimate_vat') || '0',
      gross: estimate ? estimate.gross : field(form,'estimate_gross') || '0',
      tax: estimate ? estimate.vatMode : field(form,'estimate_vat_mode') || '',
      date: new Date().toLocaleDateString(lang==='hu'?'hu-HU':lang==='de'?'de-AT':'en-GB')
    };
  }
  function eur(v){ var n=parseInt(v,10); if(isNaN(n)) n=0; return '€' + n.toLocaleString('de-DE'); }
  function wrap(ctx, text, maxWidth){
    text=String(text||''); var words=text.split(/\s+/), lines=[], line='';
    words.forEach(function(w){ var t=line?line+' '+w:w; if(ctx.measureText(t).width>maxWidth && line){ lines.push(line); line=w; } else { line=t; } });
    if(line) lines.push(line); return lines;
  }
  function pdfEscapeName(s){ return String(s||'quote').toLowerCase().replace(/[^a-z0-9\-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,''); }
  function renderCanvases(data){
    var W=1240, H=1754, M=100, pages=[], ctx, y;
    function newPage(){
      var canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; ctx=canvas.getContext('2d');
      ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#111'; ctx.textBaseline='top';
      y=M; pages.push(canvas);
      ctx.font='700 44px Arial, Helvetica, sans-serif'; ctx.fillText('BANHALMI', M, y); y+=58;
      ctx.font='700 30px Arial, Helvetica, sans-serif'; ctx.fillText(data.l.title, M, y); y+=40;
      ctx.font='400 22px Arial, Helvetica, sans-serif'; ctx.fillStyle='#555'; ctx.fillText(data.l.subtitle + ' - ' + data.l.created + ': ' + data.date, M, y); y+=58;
      ctx.strokeStyle='#ddd'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(M,y); ctx.lineTo(W-M,y); ctx.stroke(); y+=34; ctx.fillStyle='#111';
    }
    function ensure(h){ if(y+h>H-M-90){ footer(); newPage(); } }
    function footer(){ ctx.font='400 18px Arial, Helvetica, sans-serif'; ctx.fillStyle='#666'; var lines=wrap(ctx,data.l.footer,W-2*M); var yy=H-M-40; lines.slice(0,2).forEach(function(line){ ctx.fillText(line,M,yy); yy+=24; }); ctx.fillStyle='#111'; }
    function drawRow(label,value){
      ctx.font='700 21px Arial, Helvetica, sans-serif'; var labelW=310;
      ctx.font='400 21px Arial, Helvetica, sans-serif'; var lines=wrap(ctx,value,W-2*M-labelW); var h=Math.max(32, lines.length*28)+14; ensure(h);
      ctx.font='700 21px Arial, Helvetica, sans-serif'; ctx.fillStyle='#111'; ctx.fillText(label, M, y);
      ctx.font='400 21px Arial, Helvetica, sans-serif'; ctx.fillStyle='#222'; lines.forEach(function(line,i){ ctx.fillText(line, M+labelW, y+i*28); });
      y += h;
    }
    newPage();
    ctx.fillStyle='#f7f7f7'; ctx.fillRect(M, y, W-2*M, 154); ctx.fillStyle='#111';
    ctx.font='700 24px Arial, Helvetica, sans-serif'; ctx.fillText(data.l.total, M+28, y+28);
    ctx.font='700 52px Arial, Helvetica, sans-serif'; ctx.fillText(eur(data.gross), M+28, y+66);
    ctx.font='400 20px Arial, Helvetica, sans-serif'; ctx.fillStyle='#555'; ctx.fillText(data.l.net + ': ' + eur(data.net) + '   ' + data.l.vat + ': ' + eur(data.vat) + '   ' + data.l.tax + ': ' + data.tax, M+420, y+84);
    y += 190;
    data.rows.forEach(function(r){ drawRow(r[0], r[1]); });
    ensure(160); y+=20; ctx.strokeStyle='#ddd'; ctx.beginPath(); ctx.moveTo(M,y); ctx.lineTo(W-M,y); ctx.stroke(); y+=28;
    ctx.font='400 20px Arial, Helvetica, sans-serif'; ctx.fillStyle='#555'; wrap(ctx,data.l.disclaimer,W-2*M).forEach(function(line){ ctx.fillText(line,M,y); y+=28; });
    footer();
    return pages;
  }
  function bytesFromText(text){ return new TextEncoder().encode(text); }
  function dataUrlToBytes(url){ var raw=atob(url.split(',')[1]); var a=new Uint8Array(raw.length); for(var i=0;i<raw.length;i++) a[i]=raw.charCodeAt(i); return a; }
  function makePdf(canvases){
    var chunks=[], offset=0, offsets=[];
    function addText(t){ var b=bytesFromText(t); chunks.push(b); offset+=b.length; }
    function addBytes(b){ chunks.push(b); offset+=b.length; }
    function obj(id, body, bytes){ offsets[id]=offset; addText(id+' 0 obj\n'+body); if(bytes){ addBytes(bytes); addText('\nendstream\nendobj\n'); } else { addText('endobj\n'); } }
    addText('%PDF-1.3\n%\xE2\xE3\xCF\xD3\n');
    var n=canvases.length, kids=[];
    for(var i=0;i<n;i++){ kids.push((3+i*3)+' 0 R'); }
    obj(1,'<< /Type /Catalog /Pages 2 0 R >>\n');
    obj(2,'<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+n+' >>\n');
    canvases.forEach(function(canvas,i){
      var pageObj=3+i*3, contentObj=4+i*3, imageObj=5+i*3, im='Im'+(i+1);
      var jpeg=dataUrlToBytes(canvas.toDataURL('image/jpeg',0.92));
      var content='q\n595.28 0 0 841.89 0 0 cm\n/'+im+' Do\nQ\n';
      obj(pageObj,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /'+im+' '+imageObj+' 0 R >> >> /Contents '+contentObj+' 0 R >>\n');
      obj(contentObj,'<< /Length '+bytesFromText(content).length+' >>\nstream\n', bytesFromText(content));
      obj(imageObj,'<< /Type /XObject /Subtype /Image /Width '+canvas.width+' /Height '+canvas.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n', jpeg);
    });
    var xref=offset, maxObj=2+n*3;
    addText('xref\n0 '+(maxObj+1)+'\n0000000000 65535 f \n');
    for(var j=1;j<=maxObj;j++){ addText(String(offsets[j]||0).padStart(10,'0')+' 00000 n \n'); }
    addText('trailer\n<< /Size '+(maxObj+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
    return new Blob(chunks,{type:'application/pdf'});
  }
  function download(blob, filename){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); window.setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000); }
  document.addEventListener('click', function(ev){
    var btn=ev.target.closest('[data-download-quote-pdf]'); if(!btn) return;
    ev.preventDefault();
    var form=document.querySelector('[data-smart-quote]'); if(!form) return;
    var data=collect(form);
    var pdf=makePdf(renderCanvases(data));
    var name=pdfEscapeName(data.l.filename)+'-'+new Date().toISOString().slice(0,10)+'.pdf';
    download(pdf,name);
  });
})();
