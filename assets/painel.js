/* =====================================================================
   PAINEL DO CREDIARIO - fila de fichas, analise, decisao e avisos
   ===================================================================== */
(function () {
"use strict";
var C = window.CRED, $ = C.$, CFG = C.CFG;
var DOMINIO = CFG.dominioLogin || "tecnocell.app";
var EQUIPE = CFG.equipe || [{ usuario: "alerson", nome: "Alerson" }];

/* =====================================================================
   1. GUARDA DOS DADOS: nuvem (Supabase) ou local (so neste aparelho)
   ===================================================================== */
function numero(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
function normalizar(f) {
  if (!f) return f;
  ["renda", "outras_parcelas", "valor", "entrada", "parcela_calc", "comprometimento"]
    .forEach(function (k) { f[k] = numero(f[k]); });
  f.parcelas = parseInt(f.parcelas, 10) || 12;
  f.score = f.score == null ? null : (parseInt(f.score, 10) || 0);
  if (!f.conferencia || typeof f.conferencia !== "object") f.conferencia = {};
  return f;
}

var sb = null;
function cliente() {
  if (sb) return sb;
  if (!C.Nuvem.ativa || !window.supabase || !window.supabase.createClient) return null;
  sb = window.supabase.createClient(C.Nuvem.url, C.Nuvem.chave, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "crediario-login" }
  });
  return sb;
}
function erroSupabase(e) {
  var m = (e && (e.message || e.error_description)) || "";
  if (/Invalid login credentials/i.test(m)) return "Usuário ou senha errados.";
  if (/Email not confirmed/i.test(m)) return "Esse acesso ainda não foi confirmado no Supabase.";
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "Sem internet agora.";
  return m || "Não consegui falar com o servidor.";
}

var NUVEM = {
  tipo: "nuvem",
  entrar: function (usuario, senha) {
    var s = cliente();
    if (!s) return Promise.reject(new Error("Biblioteca do Supabase não carregou. Confira a internet."));
    return s.auth.signInWithPassword({ email: usuario + "@" + DOMINIO, password: senha })
      .then(function (r) { if (r.error) throw r.error; return NUVEM.perfil(); });
  },
  perfil: function () {
    var s = cliente(); if (!s) return Promise.resolve(null);
    return s.auth.getUser().then(function (u) {
      if (!u || !u.data || !u.data.user) return null;
      return s.from("perfis").select("*").eq("id", u.data.user.id).maybeSingle()
        .then(function (r) {
          if (r.error) throw r.error;
          if (!r.data) throw new Error("Seu login existe, mas ainda não foi liberado no banco. " +
            "Rode as 3 últimas linhas do arquivo banco.sql.");
          return r.data;
        });
    });
  },
  sair: function () { var s = cliente(); return s ? s.auth.signOut() : Promise.resolve(); },
  fichas: function (limite) {
    var s = cliente();
    return s.from("fichas").select("*").order("criado_em", { ascending: false })
      .limit(limite || 300)
      .then(function (r) { if (r.error) throw r.error; return (r.data || []).map(normalizar); });
  },
  salvar: function (id, patch) {
    var s = cliente();
    return s.from("fichas").update(patch).eq("id", id).select().maybeSingle()
      .then(function (r) { if (r.error) throw r.error; return normalizar(r.data); });
  },
  aoVivo: function (cb) {
    var s = cliente(); if (!s) return;
    s.channel("fichas-ao-vivo")
      .on("postgres_changes", { event: "*", schema: "public", table: "fichas" }, function (p) {
        cb(p.eventType, normalizar(p.new || p.old));
      }).subscribe();
  },
  regras: function () {
    var s = cliente();
    return s.from("regras").select("*").eq("id", 1).maybeSingle()
      .then(function (r) { if (r.error) throw r.error; return r.data || {}; });
  },
  salvarRegras: function (v) {
    var s = cliente();
    return s.from("regras").update(v).eq("id", 1).then(function (r) { if (r.error) throw r.error; });
  },
  integracoes: function () {
    var s = cliente();
    return s.from("integracoes").select("*").eq("id", 1).maybeSingle()
      .then(function (r) { if (r.error) throw r.error; return r.data || {}; });
  },
  salvarIntegracoes: function (v) {
    var s = cliente();
    return s.from("integracoes").update(v).eq("id", 1).then(function (r) { if (r.error) throw r.error; });
  },
  envioAutomatico: function () {
    var s = cliente();
    return s.rpc("whatsapp_automatico").then(function (r) { return !r.error && r.data === true; })
      .catch(function () { return false; });
  },
  testarAviso: function () {
    var s = cliente();
    return s.rpc("testar_aviso").then(function (r) {
      if (r.error) throw r.error; return r.data || "Aviso enviado.";
    });
  }
};

/* ---------- modo local: tudo guardado no proprio aparelho ---------- */
var CHAVE = "crediario.local.v1";
function lerLocal() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; }
}
function gravarLocal(d) {
  try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch (e) { C.toast("Sem espaço para salvar aqui"); }
}
var LOCAL = {
  tipo: "local",
  entrar: function (usuario) {
    var p = EQUIPE.filter(function (x) { return x.usuario === usuario; })[0] || EQUIPE[0];
    var perfil = { id: usuario, nome: p.nome, usuario: usuario, papel: usuario === "alerson" ? "admin" : "vendedor",
                   pode_decidir: usuario === "alerson" };
    var d = lerLocal(); d.perfil = perfil; gravarLocal(d);
    return Promise.resolve(perfil);
  },
  perfil: function () { return Promise.resolve(lerLocal().perfil || null); },
  sair: function () { var d = lerLocal(); delete d.perfil; gravarLocal(d); return Promise.resolve(); },
  fichas: function () {
    var d = lerLocal();
    return Promise.resolve((d.fichas || []).map(normalizar).sort(function (a, b) {
      return (b.criado_em || "").localeCompare(a.criado_em || "");
    }));
  },
  salvar: function (id, patch) {
    var d = lerLocal(), achou = null;
    d.fichas = (d.fichas || []).map(function (f) {
      if (f.id !== id) return f;
      Object.keys(patch).forEach(function (k) { f[k] = patch[k]; });
      if (patch.status && ["aprovado", "contraproposta", "recusado"].indexOf(patch.status) > -1) {
        f.decidido_em = new Date().toISOString();
        f.decidido_por = (d.perfil && d.perfil.nome) || "";
      }
      achou = f; return f;
    });
    gravarLocal(d);
    return Promise.resolve(normalizar(achou));
  },
  aoVivo: function () { },
  regras: function () { return Promise.resolve(lerLocal().regras || {}); },
  salvarRegras: function (v) {
    var d = lerLocal(); d.regras = Object.assign({}, d.regras, v); gravarLocal(d); return Promise.resolve();
  },
  integracoes: function () { return Promise.resolve(lerLocal().integracoes || {}); },
  salvarIntegracoes: function (v) {
    var d = lerLocal(); d.integracoes = Object.assign({}, d.integracoes, v); gravarLocal(d); return Promise.resolve();
  },
  envioAutomatico: function () { return Promise.resolve(false); },
  testarAviso: function () { return Promise.reject(new Error("No modo local não há envio automático.")); },
  exemplo: function () {
    var d = lerLocal(); d.fichas = d.fichas || [];
    var nomes = ["Maria Aparecida da Silva", "José Carlos Pereira", "Luciana Souza Lima"];
    var prods = ["iPhone 15 128GB", "Galaxy A55 256GB", "iPhone 13 128GB"];
    var i = d.fichas.length % 3;
    d.fichas.unshift(normalizar({
      id: "local-" + Date.now(), protocolo: "TC-EX-" + String(1000 + d.fichas.length),
      criado_em: new Date().toISOString(), nome: nomes[i], cpf: "52998224725",
      nascimento: "10/05/1990", telefone: "5537991234567",
      endereco: "Rua das Flores, 100, Centro, Luz", mae: "Joana da Silva",
      vinculo: "CLT (carteira assinada)", empresa: "Supermercado Luz", cargo: "Caixa",
      tempo_emprego: "1 a 2 anos", renda: 2800 + i * 600, outras_parcelas: 300,
      produto: prods[i], valor: 4500 - i * 800, entrada: 500, parcelas: 12,
      historico_loja: "Não, é a primeira vez", ref1_nome: "Ana Paula", ref1_fone: "(37) 99999-0000",
      autorizou_consulta: true, origem: "link", status: "novo", visto: false, conferencia: {}
    }));
    gravarLocal(d);
    return Promise.resolve();
  }
};

var Loja = C.Nuvem.ativa ? NUVEM : LOCAL;
var EU = null, FICHAS = [], REGRAS = { score_min: 70, teto_pct: 30, juros_mes: 0, loja_whats: CFG.whatsLoja || "" };
var AUTO_WA = false, atual = null, conf = {}, ultimo = null;

/* =====================================================================
   2. AVISO DE FICHA NOVA (som + notificacao do navegador)
   ===================================================================== */
function bip() {
  try {
    var A = window.AudioContext || window.webkitAudioContext; if (!A) return;
    var ctx = new A(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    o.start(); o.frequency.setValueAtTime(1320, ctx.currentTime + 0.18);
    o.stop(ctx.currentTime + 0.52);
    setTimeout(function () { try { ctx.close(); } catch (e) {} }, 900);
  } catch (e) {}
}
function avisar(f) {
  bip();
  C.toast("Ficha nova: " + C.primeiro(f.nome));
  try {
    if (window.Notification && Notification.permission === "granted") {
      var n = new Notification("Nova ficha de crediário", {
        body: f.nome + "\n" + (f.produto || "") + " · " + C.brl(f.valor) + " em " + f.parcelas + "x",
        icon: "assets/icone-192.png", badge: "assets/icone-192.png", tag: f.id, renotify: true
      });
      n.onclick = function () { window.focus(); abrirFicha(f.id); n.close(); };
    }
  } catch (e) {}
}
function pedirNotificacao() {
  if (!window.Notification) { estadoNotif("Este navegador não mostra aviso na tela."); return; }
  Notification.requestPermission().then(function (p) {
    estadoNotif();
    if (p === "granted") { C.toast("Aviso ligado neste aparelho"); bip(); }
  });
}
function estadoNotif(txt) {
  var e = $("notifEstado"); if (!e) return;
  if (txt) { e.textContent = txt; return; }
  var p = window.Notification ? Notification.permission : "indisponivel";
  e.textContent = p === "granted" ? "Ligado: este aparelho avisa quando chega ficha nova."
    : p === "denied" ? "Bloqueado no navegador. Libere as notificações deste site nos ajustes do navegador."
    : "Desligado. Toque no botão abaixo para ligar.";
  $("btnNotif").hidden = p === "granted";
}

/* =====================================================================
   3. LOGIN
   ===================================================================== */
var quemSel = EQUIPE[0].usuario;
function montarLogin() {
  var box = $("quem"); box.innerHTML = "";
  EQUIPE.forEach(function (p) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = p.nome;
    b.setAttribute("aria-pressed", p.usuario === quemSel ? "true" : "false");
    b.addEventListener("click", function () {
      quemSel = p.usuario;
      Array.prototype.forEach.call(box.children, function (c) {
        c.setAttribute("aria-pressed", c === b ? "true" : "false");
      });
      $("senha").focus();
    });
    box.appendChild(b);
  });
  if (Loja.tipo === "local") {
    $("senha").parentElement.hidden = true;
    $("loginNota").textContent = "Modo local: o sistema ainda não está ligado na nuvem, " +
      "então as fichas ficam guardadas só neste aparelho. Serve para testar.";
  } else {
    $("loginNota").textContent = "A senha é a que você cadastrou no Supabase.";
  }
}
function entrar() {
  var err = $("loginErr"); err.hidden = true;
  var senha = $("senha").value;
  if (Loja.tipo === "nuvem" && !senha) { err.textContent = "Digite sua senha."; err.hidden = false; return; }
  $("btnEntrar").disabled = true; $("btnEntrar").textContent = "Entrando...";
  Loja.entrar(quemSel, senha).then(function (perfil) {
    EU = perfil; iniciarApp();
  }).catch(function (e) {
    err.textContent = erroSupabase(e); err.hidden = false;
  }).then(function () {
    $("btnEntrar").disabled = false; $("btnEntrar").textContent = "Entrar";
  });
}

/* =====================================================================
   4. TELAS
   ===================================================================== */
function ver(v) {
  ["novas", "ficha", "hist", "cfg"].forEach(function (x) { $("v" + x).hidden = x !== v; });
  Array.prototype.forEach.call($("tabs").children, function (b) {
    b.setAttribute("aria-pressed", b.dataset.v === v ? "true" : "false");
  });
  window.scrollTo(0, 0);
}

function linkPublico() {
  return location.href.replace(/painel\.html.*$/, "index.html").replace(/\/$/, "/index.html");
}

function iniciarApp() {
  $("telaLogin").hidden = true; $("telaApp").hidden = false;
  $("quemSou").textContent = (EU.papel === "admin" ? "Administrador · " : "Vendedora · ") + EU.nome;
  $("cfgQuem").textContent = EU.nome + " · " + (EU.papel === "admin" ? "administrador" : "vendedora");
  $("cardIntegra").hidden = EU.papel !== "admin";
  $("cardRegras").querySelectorAll("input").forEach(function (i) { i.disabled = EU.papel !== "admin"; });
  $("btnRegras").hidden = EU.papel !== "admin";
  $("linkPublico").textContent = linkPublico();
  $("btnExemplo").hidden = Loja.tipo !== "local";
  if (Loja.tipo === "local") {
    $("avisoModo").hidden = false;
    $("avisoModo").innerHTML = "<b>Modo local.</b> As fichas estão guardadas só neste aparelho e o link " +
      "público ainda não entrega nada para a loja. Siga o passo a passo do arquivo " +
      "<b>COMO-LIGAR.md</b> para ligar na nuvem (uns 10 minutos).";
  }
  estadoNotif();
  if (window.Notification && Notification.permission === "default") pedirNotificacao();

  Loja.regras().then(function (r) {
    REGRAS = {
      score_min: parseInt(r.score_min, 10) || 70,
      teto_pct: parseInt(r.teto_pct, 10) || 30,
      juros_mes: numero(r.juros_mes),
      loja_whats: r.loja_whats || CFG.whatsLoja || "",
      painel_url: r.painel_url || location.href
    };
    mostrarRegras();
  }).catch(function () {});

  if (EU.papel === "admin") {
    Loja.integracoes().then(mostrarIntegracoes).catch(function () {});
  }
  Loja.envioAutomatico().then(function (v) { AUTO_WA = v; });

  carregar(true);
  Loja.aoVivo(function (tipo, f) {
    if (tipo === "INSERT") {
      if (!FICHAS.some(function (x) { return x.id === f.id; })) { FICHAS.unshift(f); desenhar(); avisar(f); }
    } else { carregar(false); }
  });
  setInterval(function () { if (!document.hidden) carregar(false); }, 25000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) carregar(false); });
}

function carregar(primeira) {
  return Loja.fichas().then(function (lista) {
    if (!primeira) {
      var antigos = {};
      FICHAS.forEach(function (f) { antigos[f.id] = true; });
      lista.forEach(function (f) { if (!antigos[f.id] && !f.visto) avisar(f); });
    }
    FICHAS = lista; desenhar();
    if (atual) {
      var at = FICHAS.filter(function (f) { return f.id === atual.id; })[0];
      if (at && at.status !== atual.status) { atual = at; abrirFicha(at.id); }
    }
  }).catch(function (e) {
    $("filaVazia").textContent = "Não consegui carregar as fichas: " + erroSupabase(e);
    $("filaVazia").hidden = false;
  });
}

/* =====================================================================
   5. FILA E NUMEROS DO DIA
   ===================================================================== */
function pendentes() {
  return FICHAS.filter(function (f) { return f.status === "novo" || f.status === "analisando"; });
}
function rotulo(s) {
  return { novo: "Nova", analisando: "Analisando", aprovado: "Aprovado",
           contraproposta: "Contraproposta", recusado: "Recusado" }[s] || s;
}
function classe(s) {
  return { novo: "p-novo", analisando: "p-warn", aprovado: "p-ok",
           contraproposta: "p-warn", recusado: "p-bad" }[s] || "p-idle";
}

function desenhar() {
  var fila = $("fila");
  Array.prototype.slice.call(fila.querySelectorAll(".fcard")).forEach(function (n) { n.remove(); });
  var pend = pendentes();
  $("filaVazia").hidden = pend.length > 0;
  pend.forEach(function (f) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "fcard"; b.dataset.novo = f.visto ? "0" : "1";
    b.innerHTML = '<b></b><span class="pill sm"></span><span class="quer"></span><span class="meta"></span>';
    b.querySelector("b").textContent = f.nome;
    var p = b.querySelector(".pill"); p.className = "pill sm " + classe(f.status); p.textContent = rotulo(f.status);
    b.querySelector(".quer").textContent = (f.produto || "Não informou o aparelho") + " · " +
      C.brl(f.valor) + " em " + f.parcelas + "x" + (f.entrada > 0 ? " · entrada " + C.brl(f.entrada) : "");
    b.querySelector(".meta").textContent = f.protocolo + " · " + C.quando(f.criado_em) +
      " · renda " + C.brl(f.renda) + (f.vendedor ? " · " + f.vendedor : "");
    b.addEventListener("click", function () { abrirFicha(f.id); });
    fila.appendChild(b);
  });

  var naoVistas = FICHAS.filter(function (f) { return !f.visto && f.status === "novo"; }).length;
  $("cntNovas").textContent = naoVistas; $("cntNovas").hidden = naoVistas === 0;
  document.title = (naoVistas ? "(" + naoVistas + ") " : "") + "Painel · Crediário Tecno Cell";

  var hoje = C.diaSP(), mes = hoje.slice(0, 7);
  var doDia = FICHAS.filter(function (f) { return C.diaSP(f.criado_em) === hoje; });
  var doMes = FICHAS.filter(function (f) { return C.diaSP(f.criado_em).slice(0, 7) === mes; });
  var ap = function (a) { return a.filter(function (f) { return f.status === "aprovado"; }).length; };
  var decididas = function (a) { return a.filter(function (f) { return ["aprovado", "recusado", "contraproposta"].indexOf(f.status) > -1; }).length; };
  $("kEsp").textContent = pend.length;
  $("kEspSub").textContent = pend.length === 1 ? "ficha esperando" : "fichas esperando";
  $("kAprov").textContent = ap(doDia);
  $("kAprovSub").textContent = doDia.length ? doDia.length + " chegaram hoje" : "nenhuma hoje";
  $("kTaxa").textContent = decididas(doMes) ? Math.round(ap(doMes) / decididas(doMes) * 100) + "%" : "—";
  $("kMesSub").textContent = doMes.length + (doMes.length === 1 ? " ficha no mês" : " fichas no mês");

  desenharHistorico();
}

function desenharHistorico() {
  var box = $("hist");
  Array.prototype.slice.call(box.querySelectorAll(".hrow")).forEach(function (n) { n.remove(); });
  var decididas = FICHAS.filter(function (f) {
    return ["aprovado", "recusado", "contraproposta"].indexOf(f.status) > -1;
  });
  $("histVazio").hidden = decididas.length > 0;
  decididas.slice(0, 80).forEach(function (f) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "hrow";
    b.innerHTML = '<span class="s"></span><span class="n"><b></b><small></small></span><span class="pill sm"></span>';
    b.querySelector(".s").textContent = f.score == null ? "—" : f.score;
    b.querySelector("b").textContent = f.nome + (f.produto ? " · " + f.produto : "");
    b.querySelector("small").textContent = C.dataHora(f.decidido_em || f.criado_em) + " · " +
      C.brl(f.valor) + (f.comprometimento ? " · " + f.comprometimento + "%" : "") +
      (f.decidido_por ? " · " + f.decidido_por : "");
    var p = b.querySelector(".pill"); p.className = "pill sm " + classe(f.status); p.textContent = rotulo(f.status);
    b.addEventListener("click", function () { abrirFicha(f.id); });
    box.appendChild(b);
  });
}

/* =====================================================================
   6. CONFERENCIA E SCORE
   ===================================================================== */
var ITENS = [
  { k: "spc",  t: "SPC/Serasa limpo", s: "Você consultou o CPF", opts: [["sim", "LIMPO", "ok"], ["nao", "RESTRIÇÃO", "bad"]] },
  { k: "cart", t: "Carteira ou renda fixa 6+ meses", s: "Pelo que veio na ficha e no holerite", opts: [["sim", "SIM", "ok"], ["nao", "NÃO", "warn"]] },
  { k: "ext",  t: "Extrato bancário", s: "Movimentação dos últimos 3 meses", opts: [["nao", "NÃO ENVIOU", "bad"], ["fraco", "FRACO", "warn"], ["bom", "BOM", "ok"]] },
  { k: "loja", t: "Histórico na Tecno Cell", s: "Já comprou no seu crediário", opts: [["nunca", "NUNCA", "flat"], ["atrasou", "ATRASOU", "bad"], ["pagou", "PAGOU OK", "ok"]] },
  { k: "ref",  t: "Referências confirmadas", s: "Ligou e confirmou", opts: [["sim", "SIM", "ok"], ["nao", "NÃO", "warn"]] }
];
(function montarChecks() {
  ITENS.forEach(function (it) {
    var row = document.createElement("div");
    row.className = "check"; row.id = "chk_" + it.k;
    row.innerHTML = '<div class="t"><b></b><small></small></div><div class="seg"></div>';
    row.querySelector("b").textContent = it.t;
    row.querySelector("small").textContent = it.s;
    it.opts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = o[1]; b.dataset.v = o[0]; b.dataset.tone = o[2];
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        conf[it.k] = conf[it.k] === o[0] ? undefined : o[0];
        sincronizar(); calcular(); salvarConferencia();
      });
      row.querySelector(".seg").appendChild(b);
    });
    $("checks").appendChild(row);
  });
})();
function sincronizar() {
  ITENS.forEach(function (it) {
    var row = $("chk_" + it.k), tom = "";
    Array.prototype.forEach.call(row.querySelectorAll("button"), function (b) {
      var on = b.dataset.v === conf[it.k];
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) tom = b.dataset.tone;
    });
    row.dataset.tone = tom;
  });
}
var tSalvar;
function salvarConferencia() {
  if (!atual) return;
  clearTimeout(tSalvar);
  tSalvar = setTimeout(function () {
    var patch = { conferencia: conf, score: ultimo ? ultimo.score : null };
    if (atual.status === "novo") patch.status = "analisando";
    Loja.salvar(atual.id, patch).then(function (f) {
      if (f) { atual = f; atualizarNaLista(f); }
    }).catch(function (e) { C.toast("Não salvou a conferência: " + erroSupabase(e)); });
  }, 700);
}
function atualizarNaLista(f) {
  FICHAS = FICHAS.map(function (x) { return x.id === f.id ? f : x; });
  desenhar();
}

function calcular() {
  if (!atual) return;
  var parc = C.valorDe("a_parcela"), sal = atual.renda;
  var carga = parc + atual.outras_parcelas, pct = sal > 0 ? carga / sal * 100 : null;
  var pCom = 0;
  if (pct !== null) { if (pct <= 20) pCom = 15; else if (pct <= 25) pCom = 11; else if (pct <= REGRAS.teto_pct) pCom = 6; }
  var extBom = conf.ext === "bom";
  var score = (conf.spc === "sim" ? 25 : 0) + (conf.cart === "sim" ? 20 : (extBom ? 14 : 0)) +
              (extBom ? 15 : conf.ext === "fraco" ? 7 : 0) + (conf.loja === "pagou" ? 15 : 0) +
              (conf.ref === "sim" ? 10 : 0) + pCom;
  var falta = ITENS.filter(function (it) { return !conf[it.k]; }).map(function (it) { return it.t; });
  var v, cls, why;
  if (conf.spc === "nao") { v = "Recusar"; cls = "p-bad"; why = "Restrição no SPC/Serasa."; }
  else if (pct !== null && pct > REGRAS.teto_pct) {
    v = "Recusar ou contraproposta"; cls = "p-bad";
    why = "A parcela compromete " + C.pctTxt(pct) + " da renda, acima do teto de " + REGRAS.teto_pct + "%.";
  } else if (conf.cart === "nao" && conf.ext && !extBom) {
    v = "Recusar"; cls = "p-bad"; why = "Sem renda formal e o extrato não comprova renda.";
  } else if (falta.length) { v = "Falta conferir"; cls = "p-idle"; why = "Falta: " + falta.join(", ") + "."; }
  else if (score >= REGRAS.score_min) {
    v = "Pode aprovar"; cls = "p-ok"; why = "Dentro da sua política. Parcela em " + C.pctTxt(pct) + " da renda.";
  } else if (score >= REGRAS.score_min - 15) {
    v = "Sua decisão"; cls = "p-warn";
    why = "Score " + score + ", perto do mínimo de " + REGRAS.score_min + ". Uma entrada maior resolve.";
  } else { v = "Recusar"; cls = "p-bad"; why = "Score " + score + ", bem abaixo do mínimo de " + REGRAS.score_min + "."; }
  if (conf.loja === "atrasou") why += " Já atrasou no seu crediário.";

  $("aScore").innerHTML = score + "<small>/100</small>";
  $("aPill").className = "pill " + cls; $("aPill").textContent = v;
  $("aReason").textContent = why;
  var cor = pct === null ? "var(--rule)" : pct <= 25 ? "var(--ok)" : pct <= REGRAS.teto_pct ? "var(--warn)" : "var(--bad)";
  $("aPct").textContent = pct === null ? "—" : C.pctTxt(pct); $("aPct").style.color = cor;
  $("aFill").style.width = (pct === null ? 0 : Math.min(100, pct / 50 * 100)) + "%";
  $("aFill").style.background = cor;
  var teto = sal * REGRAS.teto_pct / 100 - atual.outras_parcelas;
  $("aPctNote").textContent = pct === null ? "" : "Parcela máxima dentro do teto: " +
    C.brl(Math.max(0, teto)) + (atual.outras_parcelas ? " (já descontando o que ele paga hoje)." : ".");
  ultimo = { score: score, pct: pct === null ? null : Math.round(pct * 10) / 10, parc: parc,
             sugestao: v, tetoParc: Math.max(0, teto) };
}

/* =====================================================================
   7. ABRIR UMA FICHA
   ===================================================================== */
function abrirFicha(id) {
  var f = FICHAS.filter(function (x) { return x.id === id; })[0];
  if (!f) return;
  atual = f; conf = Object.assign({}, f.conferencia || {});
  ver("ficha");
  $("aNome").textContent = f.nome;
  $("aProto").textContent = f.protocolo + " · chegou " + C.quando(f.criado_em) +
    (f.origem === "vendedor" && f.vendedor ? " · preenchida por " + f.vendedor : " · pelo link");
  var st = $("aStatus"); st.className = "pill sm " + classe(f.status); st.textContent = rotulo(f.status);

  var linhas = [
    ["CPF", C.mascCpf(f.cpf)], ["Nascimento", f.nascimento],
    ["WhatsApp", C.foneBonito(f.telefone), C.waHref(f.telefone, "Olá, " + C.primeiro(f.nome) + "! Sou da Tecno Cell.")],
    ["Endereço", f.endereco], ["Mãe", f.mae],
    ["Renda", [f.vinculo, f.empresa, f.cargo ? "(" + f.cargo + ")" : ""].filter(Boolean).join(" · ")],
    ["Tempo", f.tempo_emprego],
    ["Renda mensal", C.brl(f.renda) + (f.outras_parcelas ? " · já paga " + C.brl(f.outras_parcelas) : "")],
    ["Quer", (f.produto || "") + " · " + C.brl(f.valor) + (f.entrada ? " · entrada " + C.brl(f.entrada) : "")],
    ["Na loja", f.historico_loja],
    ["Referências", [f.ref1_nome ? f.ref1_nome + " – " + f.ref1_fone : "",
                     f.ref2_nome ? f.ref2_nome + " – " + f.ref2_fone : ""].filter(Boolean).join("\n")]
  ];
  var dl = $("aResumo"); dl.innerHTML = "";
  linhas.forEach(function (r) {
    if (!r[1]) return;
    var d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = r[0];
    if (r[2]) { var a = document.createElement("a"); a.href = r[2]; a.target = "_blank"; a.rel = "noopener";
                a.textContent = r[1]; dd.appendChild(a); }
    else dd.textContent = r[1];
    d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
  });

  $("a_n").value = f.parcelas;
  C.porDinheiro("a_parcela", f.parcela_calc > 0 ? f.parcela_calc :
    Math.round(C.parcelaDe(Math.max(0, f.valor - f.entrada), f.parcelas, REGRAS.juros_mes) * 100) / 100);
  $("aObs").value = f.observacao || "";

  var decidida = ["aprovado", "contraproposta", "recusado"].indexOf(f.status) > -1;
  var podeDecidir = EU.papel === "admin" || EU.pode_decidir;
  $("decide").hidden = decidida || !podeDecidir;
  $("semPermissao").hidden = decidida || podeDecidir;
  $("reply").hidden = true;
  $("jaDecidido").hidden = !decidida;
  if (decidida) {
    $("jaDecidido").textContent = rotulo(f.status) + " por " + (f.decidido_por || "—") + " em " +
      C.dataHora(f.decidido_em || f.criado_em) + ".";
  }
  sincronizar(); calcular();

  if (!f.visto) {
    Loja.salvar(f.id, { visto: true }).then(function (x) { if (x) { atual = x; atualizarNaLista(x); } })
      .catch(function () {});
  }
}

/* =====================================================================
   8. DECISAO E MENSAGEM PARA O CLIENTE
   ===================================================================== */
var MSG = {
  aprovado: function (f, l) {
    return "Olá, " + C.primeiro(f.nome) + "! 😊\n\nSua ficha de crediário na *" + (CFG.loja || "loja") +
      "* foi *APROVADA* ✅\n\n📱 *" + (f.produto || "Aparelho") + "*\n" +
      (f.entrada > 0 ? "Entrada: " + C.brl(f.entrada) + "\n" : "") +
      f.parcelas + "x de *" + C.brl(l.parc) + "* no boleto\n\n" +
      "Para retirar seu aparelho, venha até a loja com seu documento original. " +
      "Qual o melhor dia e horário pra você?";
  },
  contraproposta: function (f, l) {
    var maxValor = f.entrada + l.tetoParc * f.parcelas;
    return "Olá, " + C.primeiro(f.nome) + "! 😊\n\nAnalisamos sua ficha na *" + (CFG.loja || "loja") +
      "*. Do jeito que veio não conseguimos aprovar, mas temos uma condição pra você:\n\n" +
      "✅ Aprovamos até *" + C.brl(Math.floor(maxValor)) + "* em " + f.parcelas +
      "x (parcela de até " + C.brl(l.tetoParc) + ")\nou\n✅ O " + (f.produto || "aparelho") +
      " com uma entrada maior.\n\nQuer que eu te mostre as opções que cabem nesse valor?";
  },
  recusado: function (f) {
    return "Olá, " + C.primeiro(f.nome) + "!\n\nObrigado pelo interesse na *" + (CFG.loja || "loja") +
      "*. Analisamos sua ficha e, neste momento, não conseguimos aprovar a compra no boleto.\n\n" +
      "Você ainda pode comprar à vista com desconto ou parcelar no cartão. " +
      "Quer que eu te mande as condições?";
  }
};
var decisaoEscolhida = null;
function decidir(tipo) {
  if (!atual || !ultimo) return;
  decisaoEscolhida = tipo;
  $("replyLab").textContent = "Mensagem para o cliente · " + rotulo(tipo);
  $("replyTxt").value = MSG[tipo](atual, ultimo);
  $("reply").hidden = false;
  $("replyNota").textContent = AUTO_WA
    ? "Ao confirmar, esta mensagem sai sozinha no WhatsApp do cliente."
    : "Ao confirmar, a decisão fica registrada e o WhatsApp do cliente abre com a mensagem pronta.";
  var bw = $("btnWa");
  bw.className = AUTO_WA ? "btn btn-ghost" : "btn btn-wa";
  bw.textContent = AUTO_WA ? "Prefiro mandar eu mesmo no WhatsApp" : "Abrir no WhatsApp e mandar eu mesmo";
  atualizarWa();
  $("reply").scrollIntoView({ behavior: "smooth", block: "center" });
}
function atualizarWa() {
  $("btnWa").href = C.waHref(atual && atual.telefone, $("replyTxt").value);
}
function confirmar() {
  if (!atual || !decisaoEscolhida) return;
  var b = $("btnConfirmar");
  b.disabled = true; b.textContent = "Salvando...";
  var patch = {
    status: decisaoEscolhida, mensagem_enviada: $("replyTxt").value,
    conferencia: conf, score: ultimo.score, parcela_calc: ultimo.parc,
    comprometimento: ultimo.pct, visto: true, observacao: $("aObs").value || null
  };
  Loja.salvar(atual.id, patch).then(function (f) {
    atual = f || atual; atualizarNaLista(atual);
    $("reply").hidden = true; $("decide").hidden = true;
    $("jaDecidido").hidden = false;
    $("jaDecidido").textContent = rotulo(decisaoEscolhida) + " registrado" +
      (AUTO_WA ? ". Mensagem enviada no WhatsApp do cliente." : ". Agora mande a mensagem no WhatsApp.");
    var st = $("aStatus"); st.className = "pill sm " + classe(decisaoEscolhida);
    st.textContent = rotulo(decisaoEscolhida);
    C.toast(rotulo(decisaoEscolhida) + " · " + C.primeiro(atual.nome));
    if (!AUTO_WA) window.open(C.waHref(atual.telefone, patch.mensagem_enviada), "_blank", "noopener");
  }).catch(function (e) {
    C.toast("Não deu para salvar: " + erroSupabase(e));
  }).then(function () {
    b.disabled = false; b.textContent = "Confirmar e avisar o cliente";
  });
}

/* =====================================================================
   9. AJUSTES
   ===================================================================== */
function mostrarRegras() {
  $("s_min").value = REGRAS.score_min;
  $("s_teto").value = REGRAS.teto_pct;
  $("s_juros").value = REGRAS.juros_mes ? String(REGRAS.juros_mes).replace(".", ",") : "";
  $("s_whats").value = REGRAS.loja_whats || "";
}
function salvarRegras() {
  var v = {
    score_min: parseInt(C.digitos($("s_min").value), 10) || 70,
    teto_pct: parseInt(C.digitos($("s_teto").value), 10) || 30,
    juros_mes: C.dinheiro($("s_juros").value) || 0,
    loja_whats: C.digitos($("s_whats").value),
    painel_url: location.href.split("#")[0]
  };
  Loja.salvarRegras(v).then(function () {
    REGRAS = Object.assign(REGRAS, v); mostrarRegras(); calcular(); C.toast("Regras salvas");
  }).catch(function (e) { C.toast("Não salvou: " + erroSupabase(e)); });
}
function mostrarIntegracoes(i) {
  i = i || {};
  $("i_tgtoken").value = i.telegram_token || "";
  $("i_tgchat").value = i.telegram_chat || "";
  $("i_prov").value = i.wa_provider || "";
  $("i_waurl").value = i.wa_url || "";
  $("i_watoken").value = i.wa_token || "";
  $("i_auto").checked = i.enviar_auto !== false;
  $("i_notifwa").checked = !!i.notificar_admin_wa;
  $("i_adminwa").value = i.admin_whats || "";
}
function salvarIntegracoes() {
  var v = {
    telegram_token: $("i_tgtoken").value.trim() || null,
    telegram_chat: C.digitos($("i_tgchat").value) || null,
    wa_provider: $("i_prov").value || "",
    wa_url: $("i_waurl").value.trim() || null,
    wa_token: $("i_watoken").value.trim() || null,
    enviar_auto: $("i_auto").checked,
    notificar_admin_wa: $("i_notifwa").checked,
    admin_whats: C.digitos($("i_adminwa").value) || null
  };
  Loja.salvarIntegracoes(v).then(function () {
    $("integraNota").textContent = "Salvo. Agora toque em “Mandar aviso de teste agora”.";
    Loja.envioAutomatico().then(function (x) { AUTO_WA = x; });
    C.toast("Configuração salva");
  }).catch(function (e) { $("integraNota").textContent = "Não salvou: " + erroSupabase(e); });
}

/* =====================================================================
   10. LIGACAO DOS BOTOES
   ===================================================================== */
C.ligarDinheiro($("a_parcela"));
$("a_parcela").onmoney = function () { calcular(); salvarConferencia(); };
$("a_n").addEventListener("input", function () {
  if (!atual) return;
  var n = parseInt(C.digitos(this.value), 10) || 0;
  atual.parcelas = n;
  C.porDinheiro("a_parcela", Math.round(C.parcelaDe(Math.max(0, atual.valor - atual.entrada), n, REGRAS.juros_mes) * 100) / 100);
  calcular();
});
$("replyTxt").addEventListener("input", atualizarWa);
$("dAprova").addEventListener("click", function () { decidir("aprovado"); });
$("dContra").addEventListener("click", function () { decidir("contraproposta"); });
$("dRecusa").addEventListener("click", function () { decidir("recusado"); });
$("btnConfirmar").addEventListener("click", confirmar);
$("btnCancelar").addEventListener("click", function () { $("reply").hidden = true; decisaoEscolhida = null; });
$("btnObs").addEventListener("click", function () {
  if (!atual) return;
  Loja.salvar(atual.id, { observacao: $("aObs").value || null })
    .then(function () { C.toast("Anotação salva"); })
    .catch(function (e) { C.toast("Não salvou: " + erroSupabase(e)); });
});
$("btnVoltar").addEventListener("click", function () { atual = null; ver("novas"); });
Array.prototype.forEach.call($("tabs").children, function (b) {
  b.addEventListener("click", function () { ver(b.dataset.v); });
});
$("btnEntrar").addEventListener("click", entrar);
$("senha").addEventListener("keydown", function (e) { if (e.key === "Enter") entrar(); });
$("btnNotif").addEventListener("click", pedirNotificacao);
$("btnRegras").addEventListener("click", salvarRegras);
$("btnIntegra").addEventListener("click", salvarIntegracoes);
$("btnTestar").addEventListener("click", function () {
  $("integraNota").textContent = "Enviando teste...";
  Loja.testarAviso().then(function (r) { $("integraNota").textContent = r; })
    .catch(function (e) { $("integraNota").textContent = "Não enviou: " + erroSupabase(e); });
});
$("btnSair").addEventListener("click", function () {
  Loja.sair().then(function () { location.reload(); });
});
$("btnExemplo").addEventListener("click", function () {
  LOCAL.exemplo().then(function () { carregar(false); C.toast("Ficha de exemplo criada"); });
});
function copiarLink() { C.copiar(linkPublico()); }
$("btnCopiarLink").addEventListener("click", copiarLink);
$("btnCopiarLink2").addEventListener("click", copiarLink);
$("btnLink").href = linkPublico();

/* =====================================================================
   11. ARRANQUE
   ===================================================================== */
montarLogin();
Loja.perfil().then(function (p) {
  if (p) { EU = p; iniciarApp(); }
  else { $("telaLogin").hidden = false; }
}).catch(function () { $("telaLogin").hidden = false; });

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}
})();
