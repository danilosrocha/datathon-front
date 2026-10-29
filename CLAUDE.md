# Frontend — contexto para agentes de código

> Leia antes: `../CLAUDE.md`. Referências: `../docs/CONTRATOS_API.md` (§3 modelos, §7 eventos), `../docs/ARQUITETURA.md` (§3.1 encaixe na cotação oficial, §6.7 avatar, §7.6 contratação), `../docs/referencia/jornada-do-usuario.md` (jornada atual de cotação: campos e rótulos do produto), `../docs/DESIGN.md` (estilo — quando existir, **prevalece** sobre as sugestões visuais daqui).

## Stack

Next.js (App Router) · TypeScript estrito · Tailwind CSS · shadcn/ui · Motion · `@xyflow/react` · `openapi-typescript` · pnpm. Deploy: Vercel.

**Sem Zustand e sem TanStack Query** (decisão de 28/10/2026): o estado do caso é um `useReducer` alimentado pelos eventos SSE (`lib/case/reducer.ts` + `use-case-session.ts`); o cliente REST é `fetch` puro (`lib/api/client.ts`); o SSE usa um parser próprio sobre `fetch` (`lib/sse.ts`), porque o `EventSource` não envia `X-Case-Token`. Formulários simples usam estado local.

## Rotas

| Rota | Tela | Acesso |
|---|---|---|
| `/` | **Home** — landing | público |
| `/perfil` | Cria o caso (`POST /cases`) após consentimento e redireciona | público |
| `/perfil/[caseId]` | **Traçado de perfil** | `X-Case-Token` |
| `/perfil/[caseId]/ofertas` | Ofertas (melhor + 2 alternativas) | `X-Case-Token` |
| `/perfil/[caseId]/resumo/[offerId]` | **Resumo para cotação** da oferta escolhida, com link para o fluxo oficial | `X-Case-Token` |

Fora do escopo: login, área do cliente (acompanhamento de propostas), console do atendente com métricas e atendimento por WhatsApp.

## Estrutura

```
frontend/
├── app/                       # rotas acima (layout.tsx por área)
├── components/
│   ├── home/                  # Hero, Benefits, HowItWorks, CTA
│   ├── profile/               # QuestionBar, ChatPanel, AvatarStage, ProfileCards, FactCard, CardEditor,
│   │                          # EnrichmentToasts, ProgressMeter, ConsentDialog
│   ├── offers/                # OfferColumn, OfferItem, ReasonTrail, EligibilityBanner, IneligibleView,
│   │                          # AssistancePackages, PremiumBenefitPicker, TermSelector, CoverageCards,
│   │                          # CoverageSlider, QuotePrefillSummary, ExplainGraph
│   └── ui/                    # shadcn
├── lib/
│   ├── api/                   # client.ts (fetch + headers), schema.d.ts (gerado), hooks TanStack Query
│   ├── events.ts              # ServerEvent (cópia fiel do CONTRATOS_API §7)
│   ├── sse.ts                 # useCaseEvents(caseId): fetch-event-source + Last-Event-ID + reconexão
│   ├── case/                  # transport.ts (API ou mock), reducer.ts, use-case-session.ts
│   ├── mock/                  # roteiro-demo.ts (gravado) + mock-transport.ts (mesmo contrato REST + SSE)
│   └── format.ts              # dinheiro, faixas, datas (America/Sao_Paulo)
└── public/geniobb/            # imagens do personagem, fotografia e favicon
```

## Tela de traçado de perfil (`/perfil/[caseId]`)

```
┌───────────────────────────────────────────────┬──────────────────────────────┐
│ QuestionBar  (pergunta atual em destaque)       │        AvatarStage           │
│ "Quanto a padaria gasta por mês com aluguel,    │   [ ilustração · ouvindo ]   │
│  salários e contas?"      [ R$ 10 a 50 mil ▾ ]  │   Lia · assistente virtual   │
│  ⓘ por que pergunto isso?                       ├──────────────────────────────┤
├───────────────────────────────────────────────┤ ProfileCards (agrupados)     │
│ ChatPanel                                       │ ┌ Atividade: Padaria ✓ ┐     │
│  Lia: Olá! Sou a Lia, assistente virtual…       │ ┌ Refrigeração: Sim · Disponível ┐
│  Você: tenho uma padaria com 2 freezers         │ ┌ Vendaval na região: alto · Estimado ┐
│  Lia: Entendi! …                                │ ProgressMeter  6 de ~9       │
│ [ Escreva com suas palavras…          ] [Enviar]│                              │
└───────────────────────────────────────────────┴──────────────────────────────┘
```

- **QuestionBar** (topo, à esquerda): mostra `question.prompt` e o input do `question.input.type` (botões Sim/Não, select, número, CNPJ, CEP). Responder por ela envia `PUT /facts/{key}` (estado `confirmado`). O usuário também pode responder livremente no chat.
- **ChatPanel**: histórico + streaming de `message.delta`; `aria-live="polite"`.
- **AvatarStage**: pose estável enquanto a pergunta aguarda resposta; muda para `pensando` no envio e `comemorando` ao concluir o perfil. Crossfade com `AnimatePresence` e respeito a `prefers-reduced-motion`. Persona **ilustrada e fictícia** — não usar foto de pessoa real.
- **ProfileCards**: um `FactCard` por fato, agrupados por `group`, entrando com animação.
  - Selo de estado: `observado` → **Disponível** · `estimado` → **Estimado** · `confirmado` → **Confirmado** (rejeitado não aparece).
  - Clique abre popover com valor editável (`editable.type`), **Confirmar**, **Remover**, evidência e fonte ("Fonte: Receita Federal via BrasilAPI").
  - Remover: some na hora, toast "Desfazer" por 5 s; o `DELETE` só é enviado ao fim do prazo.
  - Atualização otimista; o `profile.patch` do servidor é a verdade final.
- **EnrichmentToasts**: `enrichment.status` → "Consultando o histórico de clima da sua região…" / "Pronto".
- **ConsentDialog** em `/perfil`, antes de criar o caso (uso dos dados para recomendação; revisão humana disponível); o aceite vai em `POST /cases` como `consent: true`.
- Ao receber `recommendation.ready`, mostrar CTA "Ver minhas opções" → `/perfil/[caseId]/ofertas`.
- **Mobile:** avatar compacto no topo junto da QuestionBar; cards numa gaveta inferior com contador.

## Tela de ofertas

- Três colunas no desktop (empilhadas no mobile); `melhor_ajuste` destacada e maior.
- Rótulos do produto, como na cotação oficial: **Coberturas e indenização máxima**, **Pacotes de assistências**, **Personalizar**, **Oferta padrão**, **Salvar**.
- Cada oferta mostra o **plano** (Essencial, Prático ou Total) e, em **Coberturas e indenização máxima**, as coberturas em blocos: **Incluídas em todos os planos** (as 6 fixas), **Do plano** (padrão), **Para a sua atividade** (específicas) e **Opcionais**. Cada cobertura traz faixa "R$ mín. – R$ máx.", selo de confiança (alta/média/baixa) e "o que confirmar". **Pacotes de assistências** é uma seção separada, com cada pacote expansível mostrando seus serviços (do catálogo), sem valor e sem opção de remover. No Total, `PremiumBenefitPicker`: cartões para escolher **um** Benefício Premium (detector de fumaça, câmera wi-fi ou Plataforma Minu Biz). Chips `diff_vs_best` ("+ Quebra de vidros", "− Vendaval e granizo"); fixas nunca aparecem como removíveis. **Por que?** (acordeão com a trilha fato → necessidade → cobertura → regra), limitações em texto discreto, botão **Quero esta**.
- `TermSelector`: vigência de 1 a 5 anos (padrão 1), com o intervalo de datas, como na cotação oficial. Não muda coberturas.
- **Personalizar** (P2): `CoverageCards` desenha `offer.coverage_cards` — um card por cobertura, agrupado em **Incluídas**, **Disponíveis para incluir** e **Indisponíveis** (com `lock_reason`). Clicar num card executa sua ação (`adicionar`, `remover`, `ajustar_is`) com `POST /offers/{id}/customize`; cada clique é cumulativo e a resposta traz os cards atualizados; `warning` aparece no card. As dimensionáveis têm `CoverageSlider` com os limites do produto (básica de R$ 100 mil a R$ 7,5 mi) e a **faixa recomendada destacada no trilho**; padrão, específicas e opcionais têm liga/desliga; fixas não têm. **Oferta padrão** volta à oferta recomendada (`{ reset: true }`); recusas do motor (`violations[]`) aparecem no cartão. A barra inferior mostra "Preço calculado na cotação oficial", nunca um valor.
- **Quero esta** → `/perfil/[caseId]/resumo/[offerId]`, que abre com o **Resumo para cotação** (`QuotePrefillSummary`): os campos de `quote_prefill` na ordem do formulário oficial (atividade, o que proteger, shopping, endereço, vigência, plano, coberturas e indenização máxima, Benefício Premium) e um link para seguir no fluxo oficial de cotação.
- `EligibilityBanner`: `pendente` → "Recomendação preliminar — falta confirmar: …" com link de volta à conversa; `inelegivel` → `IneligibleView` empática, motivo e o que fazer a seguir (sem ofertas).
- Rodapé fixo: "Isto não é uma cotação. Coberturas, limites e valores seguem as condições gerais do produto." + botão **Pedir revisão humana**.

## Home

Hero com a pergunta "Se algo acontecer amanhã, o que mantém seu negócio de pé?", três benefícios (perguntamos só o necessário · explicamos cada escolha · você personaliza o plano), "como funciona" em 3 passos, CTA principal **Descobrir o melhor produto para mim**. Atalho discreto "Ver um exemplo" que abre um caso de demonstração (modo mock) — salva a demo se a API cair.

## Dados e estado

- Tipos REST gerados: `pnpm gen:api` → `lib/api/schema.d.ts` a partir de `${NEXT_PUBLIC_API_URL}/openapi.json`. Eventos SSE tipados à mão em `lib/events.ts` — mantenham idênticos ao contrato.
- `useCaseEvents(caseId)`: abre o SSE com `X-Case-Token`, aplica eventos no store via reducer, reconecta com `Last-Event-ID` e, após reconectar, refaz `GET /cases/{id}` para ressincronizar.
- Token do caso em `localStorage` (`ndp:case:{caseId}`), sempre dentro de `try/catch`; sem token → oferecer recomeçar.
- `NEXT_PUBLIC_USE_MOCKS=true` (ou sem `NEXT_PUBLIC_API_URL`): `lib/mock/mock-transport.ts` reproduz o roteiro de `lib/mock/roteiro-demo.ts` emitindo os mesmos eventos do contrato — o front é desenvolvido antes do backend ficar pronto. O caso mock vive em memória: recarregar a página leva ao estado "recomeçar".

## Textos (PT-BR)

- Nunca chamar a recomendação de "cotação" nem mostrar "preço" ou "garantido" sem dado oficial: preço e cotação são do fluxo oficial ("Resumo para cotação" leva até ele). Usar "proteção", "cobertura", "assistência", "importância segurada (indenização máxima)".
- Explicar siglas na primeira ocorrência (IS, CNAE).
- Tom do produto: acolhedor, direto, sem jargão.

## Acessibilidade e qualidade

Contraste AA, foco visível, navegação por teclado nos cards e no popover, `aria-live` no chat, `prefers-reduced-motion`, layout funcional a partir de 360 px. Sem tela em branco: skeletons para snapshot e estados vazios/erro com ação.

## Variáveis de ambiente

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCKS=false
```

## Comandos

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm gen:api        # tipos a partir do OpenAPI do backend
pnpm lint
pnpm build
```
