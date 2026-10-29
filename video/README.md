# Vídeo de apresentação — Negócio de Pé

Projeto Remotion **independente da aplicação** que produz o vídeo do pitch: storytelling, motion graphics, o Gênio BB animado e **capturas reais** do protótipo (modo demonstração). Nada aqui altera o `frontend/`.

| Saída | Arquivo |
|---|---|
| Versão principal, 1920×1080, 30 fps, 2:00 | `out/negocio-de-pe-120s.mp4` |
| Versão curta, 1:00 | `out/negocio-de-pe-60s.mp4` |
| Legendas PT-BR (também desenhadas no vídeo) | `out/negocio-de-pe-120s.srt`, `out/negocio-de-pe-60s.srt` |
| Roteiro e narração | [`narration/ROTEIRO.md`](narration/ROTEIRO.md) |

## Requisitos

- Node 22+ e pnpm (testado com Node 24 e pnpm 11).
- Google Chrome instalado (usado pelo Playwright na captura; `CAPTURE_CHANNEL=chromium` usa o navegador do Playwright).
- macOS para regenerar a locução provisória (comando `say`). O FFmpeg vem embutido no Remotion — não precisa instalar.

```bash
cd video
pnpm install
```

## Fluxo completo

```bash
# 1. Suba a aplicação em modo demonstração (sem NEXT_PUBLIC_API_URL)
cd ../frontend && pnpm dev            # http://localhost:3000

# 2. Grave os trechos reais (Home → consentimento → Restaurante → CEP →
#    enriquecimento → estoque → correção → análise → recomendação)
cd ../video
pnpm capture                          # APP_URL=… para outro endereço

# 3. Locução com a voz clonada no ElevenLabs + legendas (SRT)
#    (chave em video/.env: ELEVENLABS_API_KEY=…, fora do git; Voice ID em narration/script.json)
pnpm narration:eleven                 # ou só algumas falas: pnpm narration:eleven -- n05 s05
pnpm narration -- --measure-only      # durações e legendas
#    Alternativa offline (voz sintética do macOS): pnpm narration

# 4. Trilha e efeitos sonoros (sintetizados, sem direitos de terceiros)
pnpm audio

# 5. Pré-visualizar e ajustar
pnpm studio

# 6. Renderizar
pnpm render                           # versão principal
pnpm render:short                     # versão de 60 s
```

Os passos 2–4 já foram executados; os resultados estão em `public/`. Rode-os de novo só se mudar a aplicação, o texto ou a trilha.

Prévias rápidas sem renderizar o vídeo: `node scripts/stills.mjs NegocioDePe 12 48.5 70` (segundos) → `out/stills/`.

## Estrutura

```
video/
├── capture/capture.mjs        # Playwright + screencast (2×) → public/capture/*.mp4 + markers.json
├── narration/
│   ├── script.json            # falas, início de cada uma e versão (fonte única)
│   └── ROTEIRO.md             # roteiro legível
├── scripts/
│   ├── narration.mjs          # voz provisória (say), durações e SRT
│   ├── synth-audio.mjs        # trilha e efeitos sintetizados
│   └── stills.mjs             # quadros de prévia
├── public/
│   ├── capture/               # gravações reais da aplicação + marcas de tempo
│   ├── genio/                 # quadros do Gênio BB (copiados de frontend/public/genio_bb_frames_webp)
│   └── audio/                 # narração, trilha (music-*.wav) e efeitos (sfx/)
└── src/
    ├── timeline.ts            # duração de cada cena nas duas versões (ajuste aqui)
    ├── Film.tsx               # monta cenas, narração, trilha com ducking e legendas
    ├── Root.tsx               # composições: NegocioDePe, NegocioDePe60 e cada cena isolada
    ├── scenes/S01…S09*.tsx    # uma cena por arquivo
    └── components/            # Device (janela + câmera), Genio, Restaurant, Captions, Type, Sfx…
```

## Como editar

- **Tempo de uma cena:** mude `seconds` em `src/timeline.ts` e ajuste o `start` das falas seguintes em `narration/script.json`; depois `pnpm narration -- --measure-only` para refazer as legendas.
- **Texto da narração:** edite `script.json` e rode `pnpm narration`.
- **Trocar a voz pela gravação humana:** grave cada fala como WAV com o mesmo `id` (ex.: `n05.wav`), substitua em `public/audio/narration/` e rode `pnpm narration -- --measure-only`. Se alguma fala ficar mais longa, avance o `start` das seguintes.
- **Trocar a trilha:** substitua `public/audio/music-full.wav` / `music-short.wav` por uma faixa licenciada da mesma duração. O ducking sob a voz é automático (`Film.tsx`).
- **Regravar a aplicação:** `pnpm capture`. As cenas usam as marcas de `markers.json` (ex.: `M["03-cep"].submit`), então os cortes acompanham a nova gravação.
- **Câmera e destaques:** cada cena com captura declara `camera` (foco em pixels da captura 1440×810 + aproximação) e `Spot` (contorno de destaque) no próprio arquivo.
- **Cena isolada:** no Studio, pasta "Cenas" → `Cena05-wow`, por exemplo.

## Fidelidade ao produto

- As telas são **capturas reais** do protótipo em modo demonstração; a janela indica "captura real do protótipo".
- Os cards "Vendaval na região · Médio" e "Alagamento na região · Baixo" e o município "São Paulo (SP)" são os valores que a aplicação exibiu no modo demonstração (dados simulados pela própria aplicação); a recapitulação animada da cena 5 diz isso na tela.
- A correção do valor do estoque aparece como ação do usuário ("corrigido por você"), não como validação automática.
- Recomendações: selo **"Prévia demonstrativa"** na cena inteira e o aviso "Composição ilustrativa do protótipo. Sem preço, cotação ou contratação." Não mostramos a aba de detalhes (que contém o texto "Coberturas Garantidas" e serviços adicionais ainda não ligados ao catálogo oficial), faixas de indenização, preços nem regras inexistentes.
- Na arquitetura (cena 7), a IA conduz a conversa; as regras de negócio decidem elegibilidade e coberturas.
- O formulário da cena 2 é ilustrativo (não reproduz nenhum site real).

## Assets utilizados

| Asset | Origem | Uso |
|---|---|---|
| Quadros do Gênio BB (`public/genio/*`, 6 animações × 12 quadros, 1600×1100 WebP) | `frontend/public/genio_bb_frames_webp` + `manifest.json` (do projeto) | Cenas 3 e 9 |
| Gravações da aplicação (`public/capture/*.mp4`, 2880×1620) | Geradas por `pnpm capture` a partir de `localhost:3000` em modo demonstração | Cenas 3–6 e 8 |
| Marca Negócio de Pé (SVG) | Reproduzida de `frontend/components/brand/logo.tsx` | Cenas 3 e 9 |
| Ilustração do restaurante "Cantina da Vila" | Vetorial, criada em `src/components/Restaurant.tsx` | Cena 1 |
| Fontes Poppins e Inter | Google Fonts via `@remotion/google-fonts` (SIL Open Font License) | Todo o vídeo |
| Locução | Voz do autor clonada no ElevenLabs (`eleven_multilingual_v2`), gerada por `pnpm narration:eleven`; a versão sintética anterior fica em `public/audio/narration-say/` | Todo o vídeo |
| Trilha e efeitos | Sintetizados por `scripts/synth-audio.mjs` (sem amostras de terceiros) | Todo o vídeo |

## Limitações e pendências

1. **Locução por voz clonada.** Gerada pelo ElevenLabs a partir da voz do autor; para regravar uma fala com outra entonação, ajuste `elevenlabs.voiceSettings` em `script.json` e rode `pnpm narration:eleven -- <id>`. O texto das falas é enviado ao ElevenLabs e consome créditos da conta.
2. **Trilha simples.** A trilha sintetizada cumpre o arco emocional, mas é minimalista; uma faixa com licença comercial daria mais acabamento.
3. **Modo demonstração.** O backend ainda não existe; todas as capturas vêm do roteiro gravado do front (`frontend/lib/mock`). Quando o motor estiver integrado, regrave com `pnpm capture`.
4. **Tela de recomendação é protótipo.** Mostramos só a lista dos três caminhos; não mostramos faixas mín./máx., trilha "Por quê?", preço nem a aba de personalização.
5. **Resolução das capturas.** Gravadas em 1440×810 com densidade 2× (2880×1620); as aproximações vão até ~1,9× sem perda visível.
6. **Duração.** Versão principal com 2:00 e curta com 1:00 (o Guia permite vídeo de até 5 min).
