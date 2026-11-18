/* =====================================================================
   Funcoes usadas pela ficha e pelo painel
   ===================================================================== */
(function (global) {
"use strict";
var CFG = global.CREDIARIO || {};

var BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function brl(n) { return BRL.format(isFinite(n) ? n : 0); }
function pctTxt(n) { return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"; }
function digitos(s) { return String(s == null ? "" : s).replace(/\D/g, ""); }
function $(id) { return document.getElementById(id); }

function dinheiro(s) {
  if (!s) return 0;
  var t = String(s).replace(/[^\d,.-]/g, "");
  if (t.indexOf(",") > -1) t = t.replace(/\./g, "").replace(",", ".");
  var n = parseFloat(t);
  return isFinite(n) ? n : 0;
}
function foneWa(f) { var d = digitos(f); if (d.length === 10 || d.length === 11) d = "55" + d; return d; }
function foneBonito(f) {
  var d = digitos(f); if (d.indexOf("55") === 0 && d.length > 11) d = d.slice(2);
  if (d.length === 11) return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  if (d.length === 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return f || "";
}
function waHref(num, texto) {
  return "https://api.whatsapp.com/send?" + (num ? "phone=" + foneWa(num) + "&" : "") +
         "text=" + encodeURIComponent(texto || "");
}
function cpfValido(v) {
  var d = digitos(v), s = 0, r, i;
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (i = 0; i < 9; i++) s += +d[i] * (10 - i);
  r = (s * 10) % 11; if (r === 10) r = 0;
  if (r !== +d[9]) return false;
  s = 0;
  for (i = 0; i < 10; i++) s += +d[i] * (11 - i);
  r = (s * 10) % 11; if (r === 10) r = 0;
  return r === +d[10];
}
function primeiro(n) { return String(n || "").trim().split(/\s+/)[0] || ""; }

/* ---------- mascaras ---------- */
function mascFone(v) {
  var d = digitos(v).slice(0, 11), o = d;
  if (d.length > 2) o = "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length > 6) { var c = d.length > 10 ? 7 : 6; o = "(" + d.slice(0, 2) + ") " + d.slice(2, c) + "-" + d.slice(c); }
  return o;
}
function mascCpf(v) {
  var d = digitos(v).slice(0, 11), o = d;
  if (d.length > 3) o = d.slice(0, 3) + "." + d.slice(3);
  if (d.length > 6) o = d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6);
  if (d.length > 9) o = d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6, 9) + "-" + d.slice(9);
  return o;
}
function mascData(v) {
  var d = digitos(v).slice(0, 8), o = d;
  if (d.length > 2) o = d.slice(0, 2) + "/" + d.slice(2);
  if (d.length > 4) o = d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
  return o;
}
function ligarDinheiro(el) {
  if (!el) return;
  el.addEventListener("input", function () {
    var d = digitos(this.value).slice(0, 10);
    this.dataset.v = d ? String(parseInt(d, 10) / 100) : "0";
    this.value = d ? (parseInt(d, 10) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "";
    this.removeAttribute("aria-invalid");
    if (this.onmoney) this.onmoney();
  });
}
function valorDe(id) { var e = $(id); return e ? (parseFloat(e.dataset.v || "0") || 0) : 0; }
function porDinheiro(id, n) {
  var e = $(id); if (!e) return;
  e.dataset.v = String(n || 0);
  e.value = n ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
}

/* ---------- avisos na tela ---------- */
var tToast;
function toast(t) {
  var e = $("toast"); if (!e) return;
  e.textContent = t; e.classList.add("on");
  clearTimeout(tToast);
  tToast = setTimeout(function () { e.classList.remove("on"); }, 2600);
}
function copiar(texto) {
  try {
    navigator.clipboard.writeText(texto).then(function () { toast("Copiado"); },
      function () { toast("Nao deu para copiar aqui"); });
  } catch (e) { toast("Nao deu para copiar aqui"); }
}

/* ---------- tempo ---------- */
function quando(iso) {
  var d = new Date(iso), ms = Date.now() - d.getTime(), m = Math.round(ms / 60000);
  if (!isFinite(m)) return "";
  if (m < 1) return "agora";
  if (m < 60) return "há " + m + " min";
  var h = Math.round(m / 60);
  if (h < 24) return "há " + h + "h";
  var dias = Math.round(h / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return "há " + dias + " dias";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
function dataHora(iso) {
  var d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
         d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function diaSP(iso) {
  var d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(d); // AAAA-MM-DD
}

/* ---------- parcela (Tabela Price) ---------- */
function parcelaDe(valor, n, jurosMes) {
  if (n <= 0) return 0;
  if (!jurosMes) return valor / n;
  var r = jurosMes / 100;
  return valor * r / (1 - Math.pow(1 + r, -n));
}

/* ---------- nuvem (Supabase) ---------- */
var Nuvem = {
  ativa: !!(CFG.supabaseUrl && CFG.supabaseKey),
  url: (CFG.supabaseUrl || "").replace(/\/+$/, ""),
  chave: CFG.supabaseKey || "",
  /* chama uma funcao do banco sem precisar de login (usado pela ficha publica) */
  rpc: function (nome, corpo) {
    return fetch(this.url + "/rest/v1/rpc/" + nome, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": this.chave,
        "Authorization": "Bearer " + this.chave
      },
      body: JSON.stringify(corpo || {})
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (!r.ok) {
          var msg = (j && (j.message || j.error_description || j.error)) || ("Erro " + r.status);
          var e2 = new Error(msg); e2.status = r.status; throw e2;
        }
        return j;
      });
    });
  }
};

global.CRED = {
  CFG: CFG, $: $, brl: brl, pctTxt: pctTxt, digitos: digitos, dinheiro: dinheiro,
  foneWa: foneWa, foneBonito: foneBonito, waHref: waHref, cpfValido: cpfValido,
  primeiro: primeiro, mascFone: mascFone, mascCpf: mascCpf, mascData: mascData,
  ligarDinheiro: ligarDinheiro, valorDe: valorDe, porDinheiro: porDinheiro,
  toast: toast, copiar: copiar, quando: quando, dataHora: dataHora, diaSP: diaSP,
  parcelaDe: parcelaDe, Nuvem: Nuvem
};
})(window);
