/* ============================================================
   TEASER — Black Tecno · 25.11
   Sem oferta. Só curiosidade + data + @ + telefone.
   Rode com:  node marketing/gerar-teaser.js
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/* ===================== EDITE AQUI ===================== */
const EVENTO = 'BLACK TECNO';
const DATA   = '25.11';
const DIA    = 'QUARTA-FEIRA';
const INSTA  = '@tecno_cell17';
const ZAP    = '(37) 99148-6624';
/* ====================================================== */

const VM = '#F0162B', VM_ESC = '#6E0612', PR = '#0A0C0D';
const SAIDA = path.join(__dirname, 'teaser');
const b64 = p => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'logo', p)).toString('base64');
const LOGO_CLARA = b64('tecnocell-completa.png');       /* prateada, p/ fundo escuro */
const LOGO_ESC   = b64('tecnocell-escura-solida.png');  /* grafite, p/ fundo vermelho */

const extrude = (c, n = 11) => Array.from({ length: n }, (_, i) => `${i + 1}px ${i + 1}px 0 ${c}`).join(',');

const css = (W, H, fundo) => `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
#p{position:relative;width:${W}px;height:${H}px;${fundo};color:#fff;overflow:hidden;
   font-family:"Inter Display","Inter",sans-serif;--u:${((W / 100) * (H / W > 1.2 ? 1.42 : 1)).toFixed(3)}px;
   display:flex;flex-direction:column;padding:calc(var(--u)*4.5)}
#m{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
   text-align:center;min-height:0;gap:calc(var(--u)*1)}
.nw{white-space:nowrap}
.pe{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*3.4);
    border-top:3px solid rgba(255,255,255,.22);padding-top:calc(var(--u)*2.6)}
.pe img{height:calc(var(--u)*7);display:block}
.pe .c{display:flex;flex-direction:column;gap:calc(var(--u)*.5);text-align:left}
.pe b{font-weight:900;font-size:calc(var(--u)*3.4);letter-spacing:.02em}
.pe span{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:calc(var(--u)*2.9);opacity:.85}
#vinheta{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(120% 95% at 50% 46%,rgba(0,0,0,0) 54%,rgba(0,0,0,.6) 100%)}
`;

const AJUSTE = `<script>
function ajustar(){
  var p=document.getElementById('p'), m=document.getElementById('m'),
      u=parseFloat(getComputedStyle(p).getPropertyValue('--u')), k=1;
  function vaza(){
    var h=0, g=parseFloat(getComputedStyle(m).rowGap)||0;
    var f=Array.from(m.children);
    f.forEach(function(el){ var cs=getComputedStyle(el);
      h += el.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); });
    h += g * Math.max(0, f.length-1);
    return m.scrollWidth>m.clientWidth+1 || h > m.clientHeight-2;
  }
  while(vaza() && k>0.4){ k-=0.012; p.style.setProperty('--u',(u*k)+'px'); }
  document.documentElement.dataset.fit=k.toFixed(3);
  document.documentElement.dataset.pronto='1';
}
Promise.all([
  document.fonts.ready,
  Promise.all(Array.from(document.images).map(function(i){
    return i.complete ? Promise.resolve() : new Promise(function(r){ i.onload=i.onerror=r; });
  }))
]).then(ajustar);
<\/script>`;

const rodape = clara => `<div class="pe">
  <img src="${clara ? LOGO_CLARA : LOGO_ESC}" alt="Tecno Cell">
  <div class="c"><b>${INSTA}</b><span>${ZAP}</span></div>
</div>`;

const selo = cor => `<div class="nw" style="font-weight:900;font-size:calc(var(--u)*3.4);letter-spacing:.3em;
  color:${cor};margin-bottom:calc(var(--u)*2)">${EVENTO}</div>`;

const dataBloco = (fundoChip, corChip) => `
<div class="nw" style="display:flex;align-items:center;gap:calc(var(--u)*2.2);margin-top:calc(var(--u)*3)">
  <span style="background:${fundoChip};color:${corChip};border-radius:999px;
        padding:calc(var(--u)*1.1) calc(var(--u)*3.2);font-weight:900;
        font-size:calc(var(--u)*7.2);letter-spacing:-.02em">${DATA}</span>
  <span style="font-weight:900;font-size:calc(var(--u)*4.4);letter-spacing:.14em">${DIA}</span>
</div>`;

/* ---------- A · "não compre nada até quarta" ---------- */
const A = (W, H) => `<!doctype html><meta charset="utf-8"><style>${css(W, H,
  `background:radial-gradient(120% 90% at 50% 10%,#1A1D20 0%,${PR} 58%,#000 100%)`)}</style>
<div id="p"><div id="m">
  ${selo(VM)}
  <div class="nw" style="font-weight:900;font-size:calc(var(--u)*11.5);line-height:1.0;letter-spacing:-.04em;
       text-shadow:${extrude('#15181B')}">NÃO COMPRE NADA</div>
  <div class="nw" style="font-weight:900;font-size:calc(var(--u)*11.5);line-height:1.0;letter-spacing:-.04em;
       color:${VM};text-shadow:${extrude(VM_ESC)}">ATÉ QUARTA.</div>
  ${dataBloco(VM, '#fff')}
</div>${rodape(true)}<div id="vinheta"></div></div>${AJUSTE}`;

/* ---------- B · "ninguém vai ganhar desconto" · vermelho cheio ---------- */
const B = (W, H) => `<!doctype html><meta charset="utf-8"><style>${css(W, H,
  `background:radial-gradient(130% 105% at 50% 16%,#FF2A3C 0%,${VM} 46%,#B50D1E 100%)`)}</style>
<div id="p"><div id="m">
  ${selo('rgba(255,255,255,.78)')}
  <div class="nw" style="font-weight:900;font-size:calc(var(--u)*8.4);line-height:1.06;letter-spacing:-.03em;
       text-shadow:${extrude('#8A0A17', 8)}">AQUI NINGUÉM VAI</div>
  <div class="nw" style="font-weight:900;font-size:calc(var(--u)*8.4);line-height:1.06;letter-spacing:-.03em;
       text-shadow:${extrude('#8A0A17', 8)}">GANHAR DESCONTO.</div>
  <div class="nw" style="font-weight:900;font-size:calc(var(--u)*9.6);line-height:1.06;letter-spacing:-.035em;
       margin-top:calc(var(--u)*1.6);color:#0A0C0D">VAI GANHAR MAIS.</div>
  ${dataBloco('#0A0C0D', '#fff')}
</div>${rodape(false)}</div>${AJUSTE}`;

/* ---------- C · mínimo, só a logo e a data ---------- */
const C = (W, H) => `<!doctype html><meta charset="utf-8"><style>${css(W, H,
  `background:radial-gradient(120% 90% at 50% 12%,#1A1D20 0%,${PR} 58%,#000 100%)`)}
  #logoG{width:${W > H ? 'calc(var(--u)*26)' : 'calc(var(--u)*62)'};display:block;flex:0 0 auto}
</style>
<div id="p"><div id="m">
  <img id="logoG" src="${LOGO_CLARA}" alt="Tecno Cell">
  <div class="nw" style="font-weight:900;font-size:calc(var(--u)*7.6);letter-spacing:.26em;
       margin-top:calc(var(--u)*3.4);color:${VM};text-shadow:0 0 calc(var(--u)*4) rgba(240,22,43,.5)">VEM AÍ</div>
  ${dataBloco(VM, '#fff')}
  <div class="nw" style="font-weight:800;font-size:calc(var(--u)*2.8);letter-spacing:.16em;
       opacity:.82;margin-top:calc(var(--u)*2.2)">SEGUE PRA SER O PRIMEIRO A SABER</div>
</div>${rodape(true)}<div id="vinheta"></div></div>${AJUSTE}`;

const PAINEL = { w: 1920, h: 1080 }, STORY = { w: 1080, h: 1920 }, FEED = { w: 1080, h: 1350 };
const TELAS = [];
[['a-nao-compre', A], ['b-sem-desconto', B], ['c-vem-ai', C]].forEach(([n, f]) => {
  TELAS.push([`teaser-${n}-painel`, f(PAINEL.w, PAINEL.h), PAINEL]);
  TELAS.push([`teaser-${n}-story`, f(STORY.w, STORY.h), STORY]);
  TELAS.push([`teaser-${n}-feed`, f(FEED.w, FEED.h), FEED]);
});

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const b = await chromium.launch();
  for (const [nome, html, d] of TELAS) {
    const c = await b.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 1 });
    const pg = await c.newPage();
    pg.on('pageerror', e => { throw e; });
    await pg.setContent(html, { waitUntil: 'load' });
    await pg.waitForFunction(() => document.documentElement.dataset.pronto === '1', null, { timeout: 15000 });
    await pg.waitForTimeout(120);
    const r = await pg.evaluate(() => {
      const m = document.getElementById('m');
      let h = 0, f = Array.from(m.children);
      const g = parseFloat(getComputedStyle(m).rowGap) || 0;
      f.forEach(el => { const cs = getComputedStyle(el);
        h += el.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); });
      h += g * Math.max(0, f.length - 1);
      return { fit: document.documentElement.dataset.fit, sobra: Math.round(m.clientHeight - h) };
    });
    const fit = r.fit + (r.sobra < 0 ? '  ⚠ VAZOU ' + (-r.sobra) + 'px' : '  sobra ' + r.sobra + 'px');
    await pg.screenshot({ path: path.join(SAIDA, nome + '.png') });
    console.log(`${nome.padEnd(28)} ${d.w}x${d.h}  ajuste ${fit}`);
    await c.close();
  }
  await b.close();
  console.log('\nPronto. Artes em marketing/teaser/');
})().catch(e => { console.error(e); process.exit(1); });
