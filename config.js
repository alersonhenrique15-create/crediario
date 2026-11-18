/* =====================================================================
   CONFIGURACAO DA LOJA  -  este e o UNICO arquivo que voce precisa editar
   =====================================================================
   1) whatsLoja: numero do WhatsApp da loja (so numeros, com 55 e DDD)
   2) supabaseUrl / supabaseKey: aparecem no Supabase em
      Project Settings > API  ("Project URL" e a chave "anon public").
      Enquanto estiverem em branco, o sistema roda em MODO LOCAL
      (guarda tudo so no aparelho, para voce testar).
   ===================================================================== */
window.CREDIARIO = {
  loja:        "TECNO CELL",
  cidade:      "Luz, MG",
  whatsLoja:   "5537991486624",

  supabaseUrl: "",
  supabaseKey: "",

  /* logins da equipe (a senha de cada um fica no Supabase, nunca aqui) */
  dominioLogin: "tecnocell.app",
  equipe: [
    { usuario: "alerson", nome: "Alerson" },
    { usuario: "camila",  nome: "Camila"  },
    { usuario: "andreia", nome: "Andreia" }
  ]
};
