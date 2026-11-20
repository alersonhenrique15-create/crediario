# Artes e vídeos da Tecno Cell

Gera os posts e os vídeos de Black Friday a partir da logo da loja, sem depender
de Canva nem de designer. Tudo é desenhado em código e renderizado em alta resolução.

## Como gerar

```bash
node marketing/gerar.js
```

Leva uns 5 minutos. Os arquivos saem em `marketing/saida/`.

## O que sai

| Arquivo | Formato | Onde usar |
|---|---|---|
| `bf-iphone17-story.mp4` | 1080×1920, 10s | Stories e Reels |
| `bf-iphone17-feed.mp4` | 1080×1350, 10s | Feed do Instagram |
| `bf-crediario-story.mp4` | 1080×1920, 10s | Stories e Reels |
| `bf-crediario-feed.mp4` | 1080×1350, 10s | Feed do Instagram |
| `bf-iphone17-story.png` | 1080×1920 | Story estático / status do WhatsApp |
| `bf-iphone17-feed.png` | 1080×1350 | Post do feed |
| `bf-crediario-story.png` | 1080×1920 | Story estático / status do WhatsApp |
| `bf-crediario-feed.png` | 1080×1350 | Post do feed |

Os vídeos são **mudos de propósito**: no Reels você põe um áudio em alta na hora
de postar, que é o que o Instagram entrega melhor.

## Vídeo do painel de LED

Arquivo separado, porque painel de LED não é celular:

```bash
node marketing/gerar-led.js
```

Sai `led-blackfriday-16x9.mp4` (1920×1080) e `led-blackfriday-2x1.mp4` (1280×640).
Teste qual encaixa no seu painel e descarte o outro. Renderizo grande de
propósito: o player do painel reduz pra resolução real dele sem perder nitidez.

O que muda em relação aos vídeos do Instagram:

- **Fundo preto puro.** No LED, preto é pixel apagado. Qualquer degradê escuro
  vira mancha suja.
- **Letra gigante e pesada.** Quem vê está na calçada ou no carro, não a 30cm
  do aparelho.
- **4 telas em 10s, não 5.** Painel é visto de relance; tela demais não lê.
- **Sem telefone em corpo pequeno** e sem "link na bio", que não faz sentido
  pra quem está passando na rua.
- **Animação lenta.** Painel de LED borra movimento rápido.
- **Degradê prateado clareado**, nunca abaixo de ~70% de brilho, senão as
  partes escuras da logo simplesmente somem no painel.

Cada tela se mede e encolhe sozinha pra caber no formato, então dá pra mudar
os textos no bloco `TEXTO` sem quebrar o layout. Se o seu painel for de outra
proporção (faixa 4:1, por exemplo), é só acrescentar em `FORMATOS`:

```js
const FORMATOS = {
  '16x9': { w: 1920, h: 1080 },
  '2x1':  { w: 1280, h: 640 },
  '4x1':  { w: 1536, h: 384 }   // exemplo
};
```

## As logos

Ficam em `marketing/logo/`, recortadas da arte oficial da loja e salvas **com
fundo transparente**, então encaixam em qualquer cor de fundo:

| Arquivo | O que é | Onde é usado |
|---|---|---|
| `tecnocell-completa.png` | 1176×864 — monograma + TECNO CELL + Celulares | o final dos vídeos, crescendo |
| `tecnocell-marca.png` | 773×587 — só o monograma TC | cabeçalho dos posts |

Se um dia a logo mudar, troque esses dois arquivos mantendo os mesmos nomes e
rode o gerador de novo. Todo o resto se ajusta sozinho.

## Como mudar o preço, o modelo e a chamada

Abra `marketing/gerar.js` e mexa só no bloco **EDITE AQUI**, no topo:

```js
const OFERTA = {
  modelo:   "iPhone 17",
  claim:    "O MELHOR PREÇO DO BRASIL",
  parcelas: 12,
  valor:    699.90        // valor de CADA parcela
};
```

Salvou, roda `node marketing/gerar.js` de novo e os 8 arquivos saem atualizados.

> ⚠️ **O preço que está hoje é um exemplo.** Troque pelo seu preço real antes de
> postar qualquer coisa.

## Duas versões, de propósito

- **`iphone17`** — tem modelo e preço na tela. Puxa mais atenção, mas depende de
  você conferir o preço antes de postar.
- **`crediario`** — não tem preço nenhum, fala de "até 24x no boleto, sem cartão".
  Esse você posta a qualquer momento sem precisar atualizar nada.

## Sobre a frase "o melhor preço do Brasil"

Pelo Código de Defesa do Consumidor (art. 37), propaganda que afirma superioridade
precisa poder ser comprovada. "O melhor preço do Brasil" é difícil de provar se
alguém reclamar no Procon. Alternativas que passam a mesma força sem esse risco:

- `O MELHOR PREÇO DA REGIÃO`
- `PREÇO DE BLACK FRIDAY`
- `O MENOR PARCELAMENTO DA CIDADE`
- `CONDIÇÃO SÓ DESSA SEMANA`

Troca na linha `claim` e roda de novo.

## Estrutura da animação (10 segundos)

| Tempo | O que aparece |
|---|---|
| 0,0 – 2,3s | "BLACK FRIDAY" em metal escovado, com brilho atravessando |
| 2,3 – 4,7s | Modelo do aparelho + a chamada em dourado |
| 4,7 – 7,2s | A parcela, com os selos entrando um a um |
| 7,2 – 8,4s | "Crediário próprio da loja · Resposta no mesmo dia" |
| 8,4 – 10,0s | **A logo crescendo**, com brilho, nome, telefone e CTA |

Pra mudar a duração ou a cadência, mexe em `DUR`, `FPS` e nos tempos dentro de
`window.render(t)`.
