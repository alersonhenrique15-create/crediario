# Crediário Tecno Cell

Sistema de crediário próprio da loja: o cliente preenche a ficha por um link aberto
(Stories), a ficha cai na hora no painel da loja, o administrador aprova e o cliente
é avisado no WhatsApp.

**Comece por aqui: [COMO-LIGAR.md](COMO-LIGAR.md)**

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Ficha do cliente. É o link que vai no Stories. |
| `painel.html` | Painel da loja: fila de fichas, análise, aprovação, histórico e ajustes. |
| `config.js` | **O único arquivo que você edita**: WhatsApp da loja e chaves do Supabase. |
| `banco/banco.sql` | O banco de dados inteiro: tabelas, segurança, notificação e envio de WhatsApp. |
| `assets/` | Visual, ícones, programação do site e a biblioteca do Supabase. |
| `manifest.webmanifest`, `sw.js` | Fazem o painel virar aplicativo no celular. |

## Como funciona

1. O cliente abre o link e preenche a ficha (CPF conferido, sem cadastro, sem login).
2. A ficha entra no banco por uma única porta (`enviar_ficha`), que valida tudo e
   trava repetição e abuso.
3. O banco avisa na hora: Telegram e/ou WhatsApp do dono.
4. O painel mostra a ficha na fila (com som e aviso na tela), calcula a parcela,
   o comprometimento da renda e um score de 0 a 100 conforme as regras da loja.
5. Ao aprovar, recusar ou fazer contraproposta, a mensagem do cliente sai pronta —
   automática, se houver API de WhatsApp configurada.

Quem aprova é só o administrador. As vendedoras veem, conferem e anotam.
