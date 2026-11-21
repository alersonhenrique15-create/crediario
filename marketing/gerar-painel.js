/* ============================================================
   Artes de Black Friday para o PAINEL DE LED  (1920x1080)
   Rode com:  node marketing/gerar-painel.js
   Saída:     marketing/painel/*.png
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/* ===================== EDITE AQUI ===================== */
const LOJA = { fone: "(37) 99148-6624", cidade: "LUZ · MG" };
const DIAS = [6, 5, 4, 3, 2, 1];          /* contagem regressiva */
/* ====================================================== */

const SAIDA = path.join(__dirname, 'painel');
const b64 = p => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'logo', p)).toString('base64');
const MARCA   = b64('tecnocell-marca.png');            /* prateada, p/ faixa preta */
const ESCURA  = b64('tecnocell-escura-solida.png');    /* grafite, p/ fundo amarelo */

const AM = '#FFC20E', PR = '#0E1113', BR = '#FFFFFF';

/* desenhos chapados: em LED leem melhor que foto */
const FONE = `<svg viewBox="0 0 200 190"><g fill="none" stroke="currentColor" stroke-width="17" stroke-linecap="round">
<path d="M28 124V96a72 72 0 0 1 144 0v28"/></g>
<rect x="8" y="112" width="44" height="70" rx="20" fill="currentColor"/>
<rect x="148" y="112" width="44" height="70" rx="20" fill="currentColor"/></svg>`;

const CELULAR = `<svg viewBox="0 0 130 230">
<rect x="6" y="6" width="118" height="218" rx="26" fill="none" stroke="currentColor" stroke-width="12"/>
<rect x="48" y="20" width="34" height="7" rx="3.5" fill="currentColor"/>
<rect x="70" y="40" width="40" height="40" rx="12" fill="currentColor" opacity=".3"/>
<circle cx="83" cy="53" r="7" fill="currentColor"/><circle cx="97" cy="67" r="7" fill="currentColor"/>
<rect x="24" y="186" width="82" height="9" rx="4.5" fill="currentColor" opacity=".35"/></svg>`;

const BASE = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden}
#p{width:1920px;height:1080px;background:${AM};color:${PR};display:flex;flex-direction:column;
   font-family:"Inter Display","Inter",sans-serif;--u:19.2px}
.faixa{background:${PR};display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*2);
   flex:0 0 auto;height:calc(var(--u)*7.5);padding:0 calc(var(--u)*4)}
.faixa.topo{letter-spacing:.3em;font-weight:800;font-size:calc(var(--u)*2.9);color:${AM}}
.faixa.pe img{height:calc(var(--u)*4.4);display:block}
.faixa.pe span{font-family:"JetBrains Mono",monospace;font-weight:700;
   font-size:calc(var(--u)*3);color:${BR};letter-spacing:.02em}
.faixa.pe i{font-style:normal;color:#7D858A;font-weight:700;font-size:calc(var(--u)*2.5);letter-spacing:.2em}
#m{flex:1;display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*6);
   padding:calc(var(--u)*3) calc(var(--u)*5);min-height:0}
.col{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.ic{color:${PR};flex:0 0 auto}
.ic svg{display:block;height:100%;width:auto}
.nowrap{white-space:nowrap}
`;

/* encolhe a unidade base ate o miolo caber, em largura e altura */
const AJUSTE = `<script>
(function(){
  var p = document.getElementById('p'), m = document.getElementById('m'), k = 1;
  function vaza(){ return m.scrollWidth > m.clientWidth + 1 || m.scrollHeight > m.clientHeight + 1; }
  while (vaza() && k > 0.45) { k -= 0.015; p.style.setProperty('--u', (19.2 * k) + 'px'); }
  document.documentElement.dataset.fit = k.toFixed(3);
})();
<\/script>`;

function moldura(topo, miolo) {
  return `<!doctype html><meta charset="utf-8"><style>${BASE}</style>
<div id="p">
  <div class="faixa topo">${topo}</div>
  <div id="m">${miolo}</div>
  <div class="faixa pe">
    <img src="${MARCA}"><i>${LOJA.cidade}</i><span>${LOJA.fone}</span>
  </div>
</div>${AJUSTE}`;
}

/* ---------- telas ---------- */
function contagem(n) {
  const plural = n > 1;
  return moldura('BLACK FRIDAY · TECNO CELL', `
  <div class="col">
    <div class="nowrap" style="font-weight:800;font-size:calc(var(--u)*5.5);letter-spacing:.26em">
      ${plural ? 'FALTAM' : 'FALTA'}</div>
    <div class="nowrap" style="font-weight:900;font-size:calc(var(--u)*27);line-height:.84;
         letter-spacing:-.06em;margin:calc(var(--u)*.8) 0 calc(var(--u)*.2)">${n}</div>
    <div class="nowrap" style="font-weight:900;font-size:calc(var(--u)*9);letter-spacing:.02em">
      ${plural ? 'DIAS' : 'DIA'}</div>
  </div>`);
}

function hoje() {
  return moldura('BLACK FRIDAY · TECNO CELL', `
  <div class="col">
    <div class="nowrap" style="font-weight:900;font-size:calc(var(--u)*26);line-height:.85;letter-spacing:-.05em">É HOJE</div>
    <div class="nowrap" style="font-weight:800;font-size:calc(var(--u)*6);letter-spacing:.2em;margin-top:calc(var(--u)*2.5)">
      VEM PRA TECNO CELL</div>
  </div>`);
}

function fone() {
  return moldura('BLACK FRIDAY · TECNO CELL', `
  <div class="col" style="width:100%">
    <div class="nowrap" style="font-weight:800;font-size:calc(var(--u)*5);letter-spacing:.05em">
      NA COMPRA DE QUALQUER CELULAR</div>
    <div class="nowrap" style="background:${PR};color:${AM};border-radius:999px;
         padding:calc(var(--u)*1.3) calc(var(--u)*4);margin:calc(var(--u)*1.6) 0;
         font-family:'JetBrains Mono',monospace;font-weight:800;
         font-size:calc(var(--u)*14);letter-spacing:-.045em;line-height:1.1">+ R$ 1,00</div>
    <div class="nowrap" style="display:flex;align-items:center;gap:calc(var(--u)*2.2)">
      <span class="ic" style="height:calc(var(--u)*8.5)">${FONE}</span>
      <span style="font-weight:900;font-size:calc(var(--u)*8.5);letter-spacing:-.025em">VOCÊ LEVA UM FONE</span>
    </div>
  </div>`);
}

function troca() {
  return moldura('TECNO CELL · LUZ, MG', `
  <div class="ic" style="height:calc(var(--u)*34)">${CELULAR}</div>
  <div class="col" style="align-items:flex-start;text-align:left">
    <div class="nowrap" style="font-weight:800;font-size:calc(var(--u)*5.2);letter-spacing:.04em">SEU CELULAR USADO</div>
    <div class="nowrap" style="font-weight:900;font-size:calc(var(--u)*11);letter-spacing:-.035em;line-height:1.02;
         margin:calc(var(--u)*1.2) 0">VALE DINHEIRO</div>
    <div class="nowrap" style="background:${PR};color:${AM};border-radius:999px;
         padding:calc(var(--u)*1.3) calc(var(--u)*3.4);font-weight:900;
         font-size:calc(var(--u)*6);letter-spacing:.06em">TRAGA E TROQUE</div>
  </div>`);
}

function marca() {
  return `<!doctype html><meta charset="utf-8"><style>${BASE}
  #p{align-items:center;justify-content:center;padding:calc(var(--u)*4)}
  </style>
<div id="p">
  <img src="${ESCURA}" style="width:58%;display:block">
  <div style="display:flex;align-items:center;gap:calc(var(--u)*1.6);margin-top:calc(var(--u)*3.4);
       background:${PR};color:${BR};border-radius:999px;padding:calc(var(--u)*1.5) calc(var(--u)*3.6);
       font-family:'JetBrains Mono',monospace;font-weight:800;font-size:calc(var(--u)*4.6)">
    <svg viewBox="0 0 24 24" style="width:calc(var(--u)*4.6);height:calc(var(--u)*4.6);fill:${BR}"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
    <span>${LOJA.fone}</span>
  </div>
  <div style="margin-top:calc(var(--u)*2.4);font-weight:700;font-size:calc(var(--u)*2.7);
       letter-spacing:.1em;color:#7A5D05">CARTÃO · PIX · CREDIÁRIO PRÓPRIO</div>
</div>`;
}

const TELAS = [
  ...DIAS.map(n => [`contagem-${n}dias`, contagem(n)]),
  ['contagem-e-hoje', hoje()],
  ['oferta-fone-1real', fone()],
  ['oferta-troca-usado', troca()],
  ['marca-fechamento', marca()]
];

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => { throw e; });
  for (const [nome, html] of TELAS) {
    await pg.setContent(html, { waitUntil: 'load' });
    await pg.waitForTimeout(160);
    const r = await pg.evaluate(() => {
      const m = document.getElementById('m');
      return {
        fit: document.documentElement.dataset.fit || '1.000',
        vaza: m ? Math.max(0, m.scrollWidth - m.clientWidth, m.scrollHeight - m.clientHeight) : 0
      };
    });
    await pg.screenshot({ path: path.join(SAIDA, nome + '.png') });
    console.log(`${nome.padEnd(22)} ajuste ${r.fit}${r.vaza ? '   ⚠ ainda vaza ' + r.vaza + 'px' : ''}`);
  }
  await b.close();
  console.log('\nPronto. Artes em marketing/painel/');
})().catch(e => { console.error(e); process.exit(1); });
