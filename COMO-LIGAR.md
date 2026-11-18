# Como ligar o sistema de crediário (uns 15 minutos)

Hoje o sistema já funciona em **modo local** (fichas guardadas só no aparelho, para você
testar). Para o link do Stories cair de verdade no seu painel, com notificação na hora,
siga os passos abaixo. É tudo de graça.

---

## Passo 1 — Criar o banco (Supabase)

1. Entre em **supabase.com** e clique em *Start your project*. Pode entrar com sua conta Google.
2. Clique em **New project**:
   - **Name:** `crediario`
   - **Database password:** crie uma senha e **guarde** (você quase não vai usar).
   - **Region:** `South America (São Paulo)`
3. Espere uns 2 minutos até o projeto ficar pronto.

## Passo 2 — Ligar o envio automático do banco

No menu da esquerda: **Database → Extensions** → procure **`pg_net`** → ligue a chavinha.

> É isso que deixa o banco mandar a notificação e o WhatsApp sozinho.

## Passo 3 — Criar os acessos da equipe

Menu **Authentication → Users → Add user → Create new user**. Marque
**Auto Confirm User** e crie os três:

| E-mail                  | Senha                  | Quem é                      |
|-------------------------|------------------------|-----------------------------|
| `alerson@tecnocell.app` | a que você escolher    | Administrador (aprova)      |
| `camila@tecnocell.app`  | a que você escolher    | Vendedora                   |
| `andreia@tecnocell.app` | a que você escolher    | Vendedora                   |

> Esses e-mails são só nomes de acesso, não precisa existir e-mail de verdade.
> No painel cada uma entra tocando no nome dela e digitando a senha.

## Passo 4 — Montar as tabelas

1. Menu **SQL Editor → New query**.
2. Abra o arquivo **`banco/banco.sql`** deste projeto, copie **tudo** e cole lá.
3. Clique em **Run**.

No fim deve aparecer `OK: Alerson (admin)`, `OK: Camila (vendedor)` e `OK: Andreia (vendedor)`.
Se aparecer *"NAO ENCONTREI"*, é porque faltou criar alguém no Passo 3: crie e rode de novo.

## Passo 5 — Ligar o site no banco

1. Menu **Project Settings → API**. Copie dois valores:
   - **Project URL** (algo como `https://abcdefg.supabase.co`)
   - **anon public** (uma chave grande)
2. Aqui no GitHub, abra o arquivo **`config.js`**, clique no lápis e preencha:

```js
supabaseUrl: "https://abcdefg.supabase.co",
supabaseKey: "cole-aqui-a-chave-anon",
```

3. **Commit changes**.

> Essa chave pode ficar pública: com ela só dá para **enviar** ficha, nunca para ler as fichas
> dos clientes. Ler e aprovar só com login.

## Passo 6 — Publicar o site

No GitHub: **Settings → Pages → Branch: `main` → /(root) → Save**.

Em 1 minuto o site fica no ar em:

- Ficha do cliente (**este é o link do Stories**):
  `https://alersonhenrique15-create.github.io/crediario/`
- Painel da loja:
  `https://alersonhenrique15-create.github.io/crediario/painel.html`

Para saber quem trouxe o cliente, use o link com o nome da vendedora no fim:
`.../crediario/?v=camila`

---

## Passo 7 — Notificação na hora, pelo Telegram (grátis)

O painel avisa com som sempre que estiver aberto. Para o aviso chegar **com o celular no bolso**,
use o Telegram (1 minuto, não precisa pagar nada):

1. Instale o **Telegram** no seu celular.
2. Procure **@BotFather** → mande `/newbot` → dê um nome (ex.: `Crediário Tecno Cell`) →
   ele devolve um **token** parecido com `7123456789:AAE...`. Copie.
3. Procure **@userinfobot** → mande `/start` → ele responde seu **Id** (só números). Copie.
4. Mande um "oi" para o **seu** bot (o que você criou), senão ele não pode te escrever.
5. Abra o painel → **Ajustes** → cole o token e o Id → **Salvar** → **Mandar aviso de teste agora**.

Pronto: cada ficha nova chega como notificação no seu celular, com nome, aparelho, valor e renda.

## Passo 8 — WhatsApp automático para o cliente (opcional, pago)

Sem isso, quando você aprova, o WhatsApp do cliente **abre com a mensagem pronta** e você só
toca em enviar. Para sair 100% sozinho, o WhatsApp precisa de uma API (o WhatsApp não deixa
nenhum site mandar mensagem pelo seu número sem isso).

O mais usado no Brasil é a **Z-API** (conecta no número da loja por QR Code, custa por volta de
R$ 100/mês). Depois de contratar:

1. No painel → **Ajustes → WhatsApp automático**:
   - **Provedor:** Z-API
   - **URL:** `https://api.z-api.io/instances/SUA-INSTANCIA/token/SEU-TOKEN`
   - **Token:** o *Client-Token* da sua conta
   - Marque **mandar a mensagem automaticamente**
   - Marque **avisar ficha nova no meu WhatsApp** e ponha seu número (aí nem precisa de Telegram)
2. **Salvar** → **Mandar aviso de teste agora**.

Também funciona com **Evolution API**, **WhatsApp Cloud API (Meta)** ou um **webhook**
(n8n, Make, Zapier).

## Passo 9 — Botar o painel na tela do celular

- **Android (Chrome):** abra o painel → menu ⋮ → *Instalar aplicativo*.
- **iPhone (Safari):** abra o painel → Compartilhar → *Adicionar à Tela de Início*.

Fica com ícone igual a um aplicativo.

---

## Dúvidas rápidas

**Trocar a senha de alguém:** Supabase → Authentication → Users → clique na pessoa → *Reset password*
(ou *Update user*).

**Entrou gente nova na loja:** crie o usuário no Passo 3 e rode no SQL Editor:
`select public.vincular_perfil('matheus@tecnocell.app','Matheus','matheus','vendedor');`
Depois acrescente o nome na lista `equipe` do `config.js`.

**Quem pode aprovar:** só quem é `admin` (hoje, Alerson). As vendedoras veem a ficha, fazem a
conferência e anotam, mas o botão de aprovar/recusar não aparece para elas.

**Não chegou notificação:** confira se mandou "oi" para o seu bot e se o `pg_net` está ligado
(Passo 2). Teste pelo botão *Mandar aviso de teste agora*.

**O cliente não recebeu a mensagem:** sem a API do Passo 8 o envio é manual (o WhatsApp abre
pronto, você toca em enviar). Com API, veja no Supabase: **Table Editor → envios**, a coluna
`erro` mostra o que deu errado.

**Alguém pode ver as fichas sem senha?** Não. O link público só consegue **enviar** ficha.
Ler, analisar e aprovar exige login.
