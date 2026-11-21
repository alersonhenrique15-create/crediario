/* ============================================================
   Artes do combo celular + fone + relógio
   Rode com:  node marketing/gerar-combo.js
   Saída:     marketing/painel/combo-*.png
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/* ===================== EDITE AQUI ===================== */
const LOJA = { fone: "(37) 99148-6624", cidade: "LUZ · MG" };
/* ====================================================== */

const SAIDA = path.join(__dirname, 'painel');
const b64 = (d, p) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, d, p)).toString('base64');
const MARCA = b64('logo', 'tecnocell-marca.png');
const AM = '#FFC20E', PR = '#0E1113', BR = '#FFFFFF';

const CELULAR = `<svg viewBox="0 0 130 230">
<rect x="6" y="6" width="118" height="218" rx="26" fill="none" stroke="currentColor" stroke-width="12"/>
<rect x="48" y="20" width="34" height="7" rx="3.5" fill="currentColor"/>
<rect x="70" y="40" width="40" height="40" rx="12" fill="currentColor" opacity=".3"/>
<circle cx="83" cy="53" r="7" fill="currentColor"/><circle cx="97" cy="67" r="7" fill="currentColor"/>
<rect x="24" y="186" width="82" height="9" rx="4.5" fill="currentColor" opacity=".35"/></svg>`;

const FONE = `<svg viewBox="0 0 200 190">
<path d="M28 124V96a72 72 0 0 1 144 0v28" fill="none" stroke="currentColor" stroke-width="17" stroke-linecap="round"/>
<rect x="8" y="112" width="44" height="70" rx="20" fill="currentColor"/>
<rect x="148" y="112" width="44" height="70" rx="20" fill="currentColor"/></svg>`;

const RELOGIO = `<svg viewBox="0 0 150 230">
<rect x="46" y="4" width="58" height="56" rx="16" fill="currentColor" opacity=".4"/>
<rect x="46" y="170" width="58" height="56" rx="16" fill="currentColor" opacity=".4"/>
<rect x="16" y="54" width="112" height="122" rx="30" fill="none" stroke="currentColor" stroke-width="12"/>
<rect x="34" y="72" width="76" height="86" rx="20" fill="currentColor" opacity=".28"/>
<rect x="128" y="96" width="11" height="28" rx="5.5" fill="currentColor"/></svg>`;

const BASE = W => `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W.w}px;height:${W.h}px;overflow:hidden}
#p{width:${W.w}px;height:${W.h}px;background:${AM};color:${PR};display:flex;flex-direction:column;
   font-family:"Inter Display","Inter",sans-serif;--u:${W.w / 100}px}
.faixa{background:${PR};display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*2);
   flex:0 0 auto;height:calc(var(--u)*7.5);padding:0 calc(var(--u)*4)}
.faixa.topo{letter-spacing:.3em;font-weight:800;font-size:calc(var(--u)*2.9);color:${AM}}
.faixa.pe img{height:calc(var(--u)*4.4);display:block}
.faixa.pe span{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:calc(var(--u)*3);color:${BR}}
.faixa.pe i{font-style:normal;color:#7D858A;font-weight:700;font-size:calc(var(--u)*2.5);letter-spacing:.2em}
#m{flex:1;display:flex;align-items:center;justify-content:center;padding:calc(var(--u)*3) calc(var(--u)*5);min-height:0}
.ic svg{display:block;height:100%;width:auto}
.nowrap{white-space:nowrap}
`;

const AJUSTE = `<script>(function(){
  var p=document.getElementById('p'), m=document.getElementById('m'), u=parseFloat(getComputedStyle(p).getPropertyValue('--u')), k=1;
  function vaza(){ return m.scrollWidth>m.clientWidth+1 || m.scrollHeight>m.clientHeight+1; }
  while(vaza() && k>0.4){ k-=0.015; p.style.setProperty('--u',(u*k)+'px'); }
  document.documentElement.dataset.fit=k.toFixed(3);
})();<\/script>`;

const moldura = (W, topo, miolo) => `<!doctype html><meta charset="utf-8"><style>${BASE(W)}</style>
<div id="p"><div class="faixa topo">${topo}</div><div id="m">${miolo}</div>
<div class="faixa pe"><img src="${MARCA}"><i>${LOJA.cidade}</i><span>${LOJA.fone}</span></div></div>${AJUSTE}`;

/* ---------- A: o combo, bem direto ---------- */
const combo = W => moldura(W, 'BLACK DA TROCA · TECNO CELL', `
<div style="display:flex;flex-direction:column;align-items:center;text-align:center;width:100%">
  <div style="display:flex;align-items:center;gap:calc(var(--u)*4)">
    <span class="ic" style="height:calc(var(--u)*26)">${CELULAR}</span>
    <span style="font-weight:900;font-size:calc(var(--u)*14);line-height:1">+</span>
    <span class="ic" style="height:calc(var(--u)*18)">${FONE}</span>
  </div>
  <div style="font-weight:800;font-size:calc(var(--u)*5);letter-spacing:.05em;line-height:1.15;margin-top:calc(var(--u)*2.4)">
    NA COMPRA DE QUALQUER CELULAR<br>O FONE SAI POR</div>
  <div class="nowrap" style="background:${PR};color:${AM};border-radius:999px;margin-top:calc(var(--u)*1.6);
       padding:calc(var(--u)*1.2) calc(var(--u)*4.5);font-family:'JetBrains Mono',monospace;
       font-weight:800;font-size:calc(var(--u)*15);letter-spacing:-.045em;line-height:1.1">R$ 1,00</div>
</div>`);

/* ---------- B: a escada ---------- */
const linha = (icone, alt, titulo, valor, destaque) => `
<div style="display:flex;align-items:center;gap:calc(var(--u)*3);width:100%;
     padding:calc(var(--u)*1.6) 0;border-top:calc(var(--u)*.35) solid rgba(14,17,19,.22)">
  <span class="ic" style="height:calc(var(--u)*${alt});flex:0 0 calc(var(--u)*11);display:flex;justify-content:center">${icone}</span>
  <span style="font-weight:900;font-size:calc(var(--u)*5.6);letter-spacing:-.02em;flex:1;text-align:left">${titulo}</span>
  <span class="nowrap" style="font-weight:900;font-size:calc(var(--u)*${destaque ? 7.4 : 4.4});letter-spacing:-.02em;
        ${destaque ? `background:${PR};color:${AM};border-radius:999px;padding:calc(var(--u)*.9) calc(var(--u)*2.6)` : ''}">${valor}</span>
</div>`;

const escada = W => moldura(W, 'BLACK DA TROCA · 25, 26 E 27 DE NOVEMBRO', `
<div style="display:flex;flex-direction:column;align-items:center;width:100%">
  <div class="nowrap" style="font-weight:900;font-size:calc(var(--u)*8);letter-spacing:-.03em;margin-bottom:calc(var(--u)*1.2)">
    LEVOU O CELULAR?</div>
  ${linha(CELULAR, 13, 'SEU USADO VALE COMO ENTRADA', 'avaliamos na hora', false)}
  ${linha(FONE, 9.5, 'O FONE SAI POR', 'R$ 1,00', true)}
  ${linha(RELOGIO, 13, 'E O RELÓGIO CABE NA MESMA PARCELA', 'pergunte quanto', false)}
</div>`);

/* ---------- C: cartaz de balcão (A4, uso interno) ---------- */
const balcao = () => `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1240px;height:1754px;overflow:hidden}
#p{width:1240px;height:1754px;background:#fff;color:#0E1113;padding:70px 64px;
   font-family:"Inter","Inter Display",sans-serif;display:flex;flex-direction:column}
h1{font-family:"Inter Display",sans-serif;font-size:52px;font-weight:900;letter-spacing:-.03em;line-height:1.05}
.sel{display:inline-block;background:${AM};padding:7px 16px;border-radius:8px;font-size:19px;
   font-weight:900;letter-spacing:.16em;margin-bottom:18px}
h2{font-family:"Inter Display",sans-serif;font-size:27px;font-weight:900;margin:36px 0 14px;letter-spacing:-.01em}
ol{margin-left:26px}
li{font-size:22px;line-height:1.5;margin-bottom:11px}
li b{font-weight:800}
.frase{background:#F3F4F5;border-left:9px solid ${AM};padding:20px 24px;margin:14px 0;
   font-size:24px;line-height:1.45;font-style:italic;font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:21px}
th,td{text-align:left;padding:12px 10px;border-bottom:2px solid #E4E6E8}
th{font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:#6B7276;font-weight:800}
td b{font-weight:900}
.pe{margin-top:auto;border-top:3px solid #0E1113;padding-top:18px;font-size:19px;color:#5A6165;line-height:1.5}
.pe b{color:#0E1113}
</style>
<div id="p">
  <span class="sel">USO INTERNO · NÃO É CARTAZ DE VITRINE</span>
  <h1>Roteiro do balcão<br>Black da Troca</h1>

  <h2>A ordem certa, sempre</h2>
  <ol>
    <li><b>Avalie o usado na frente dele.</b> Liga, olha tela e bateria.</li>
    <li><b>Escreva o valor num papel e entregue na mão.</b> Valor falado o cliente esquece na porta; valor na mão vira compromisso.</li>
    <li>"Esse valor entra como <b>entrada</b>. Vamos ver o que você leva com ele?"</li>
    <li>Mostre <b>2 ou 3 aparelhos</b>, nunca a loja inteira.</li>
    <li>Fechou o celular → <b>"o fone sai por 1 real"</b>. Não pergunte se ele quer, informe que é dele.</li>
    <li><b>Com o fone na mão dele</b>, ofereça o relógio pela parcela (frase abaixo).</li>
    <li><b>Nome e WhatsApp antes de sair.</b> Sempre.</li>
    <li>Anote no caderno: entrou / avaliou / comprou.</li>
  </ol>

  <h2>A frase do relógio</h2>
  <div class="frase">"Sua parcela ficou em R$ ____.<br>
  Por mais R$ ____ por mês você leva o relógio junto. Quer?"</div>
  <p style="font-size:21px;line-height:1.5">Nunca pergunte "quer comprar um relógio?". O cliente já aceitou pagar
  por mês — some na parcela que existe, não crie uma compra nova.</p>

  <h2>Por que o fone a R$ 1 não é prejuízo</h2>
  <table>
    <tr><th>Item</th><th>Conta</th></tr>
    <tr><td>Fone entregue por R$ 1</td><td><b>custa R$ 23</b> (custo 24 − 1)</td></tr>
    <tr><td>Relógio vendido</td><td><b>deixa ~R$ 164</b> (venda 349 − custo 185)</td></tr>
    <tr><td>Equilíbrio</td><td><b>1 relógio paga 7 fones</b></td></tr>
  </table>
  <p style="font-size:21px;margin-top:14px;line-height:1.5">A cada <b>7 clientes</b> que levam o fone, basta <b>1</b> levar o
  relógio pra promoção se pagar. De 1 em 4 pra cima, ela dá lucro.</p>

  <div class="pe">
    <b>Enquanto durar o estoque de fones.</b> Conte quantos tem antes de abrir e avise a equipe quando acabar.<br>
    O fone é só <b>na compra de um celular</b>. Sem celular, não tem fone a R$ 1.
  </div>
</div>`;

const PAINEL = { w: 1920, h: 1080 }, FEED = { w: 1080, h: 1350 };
const TELAS = [
  ['combo-fone-painel', combo(PAINEL), PAINEL],
  ['combo-fone-feed', combo(FEED), FEED],
  ['combo-escada-painel', escada(PAINEL), PAINEL],
  ['combo-escada-feed', escada(FEED), FEED],
  ['balcao-roteiro-a4', balcao(), { w: 1240, h: 1754 }]
];

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const b = await chromium.launch();
  for (const [nome, html, dim] of TELAS) {
    const c = await b.newContext({ viewport: { width: dim.w, height: dim.h }, deviceScaleFactor: 1 });
    const pg = await c.newPage();
    pg.on('pageerror', e => { throw e; });
    await pg.setContent(html, { waitUntil: 'load' });
    await pg.waitForTimeout(220);
    const fit = await pg.evaluate(() => document.documentElement.dataset.fit || '—');
    await pg.screenshot({ path: path.join(SAIDA, nome + '.png') });
    console.log(`${nome.padEnd(24)} ${dim.w}x${dim.h}  ajuste ${fit}`);
    await c.close();
  }
  await b.close();
  console.log('\nPronto.');
})().catch(e => { console.error(e); process.exit(1); });
