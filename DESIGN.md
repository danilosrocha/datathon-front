# DESIGN.md — Sistema visual "Proteção Azul & Amarelo"

> Sistema de design inspirado na linguagem visual do site **bbseguros.com.br** (analisado em out/2026).
> Não é uma cópia: as fontes proprietárias foram substituídas por alternativas livres, e os valores foram arredondados para um sistema de tokens coerente. Use **marca, logo e nomes próprios seus** — não reutilize os da BB Seguros.

---

## 1. Princípios

1. **Azul que acolhe, amarelo que chama.** O azul-violeta vibrante dá a identidade e o fundo das áreas institucionais; o amarelo é reservado para destaque e atenção (títulos de hero, badges, CTAs secundários).
2. **Títulos grandes e arredondados.** Tipografia de display pesada (700), geométrica e amigável, em tamanhos generosos.
3. **Superfícies planas.** Quase nada de sombra; profundidade vem de contraste de cor, fotos com overlay escuro e bordas finas.
4. **Cantos discretos.** Raio pequeno (4–8px) — sério, financeiro, mas não rígido.
5. **Linguagem direta e humana.** Microcopy em verbos de ação: "Contrate", "Simule agora", "Faça cotação", "Conheça".
6. **Acessibilidade visível.** Atalhos de acessibilidade (alto contraste / Libras) fixos na lateral.

---

## 2. Cores

### 2.1 Tokens

```css
:root {
  /* Primária — azul-violeta */
  --color-primary-900: #003087; /* azul institucional profundo (rodapé, detalhes) */
  --color-primary-700: #3751FF; /* hover / pressed */
  --color-primary-600: #465EFF; /* links e botões ativos */
  --color-primary-500: #5A6FFF; /* COR DE MARCA — header, botões, títulos */
  --color-primary-300: #9CA9FF; /* bordas, ícones secundários */
  --color-primary-200: #C6CEFF; /* bordas suaves */
  --color-primary-100: #E5E8FF; /* fundos de banner/cookie, chips */
  --color-primary-50:  #F9F7FF; /* fundo de seção alternada (lavanda quase branco) */

  /* Acento — amarelo */
  --color-accent-500:  #FCFC30; /* amarelo-limão: títulos de hero sobre azul/foto */
  --color-accent-400:  #FCEE4F; /* amarelo-quente: blocos, badges, sublinhado de título */

  /* Apoio */
  --color-mint-400:    #6AEDD3; /* CTA secundário em hero ("Saiba mais") */
  --color-coral-400:   #FF6F68; /* links de ação em cards ("Simule agora"), alertas leves */

  /* Neutros */
  --color-ink-900:     #121212;
  --color-ink-800:     #212529; /* texto principal */
  --color-ink-600:     #4C4C4C; /* texto secundário */
  --color-ink-500:     #656565; /* legenda, meta */
  --color-white:       #FFFFFF;
  --color-black:       #000000; /* fundo de cards com foto */

  /* Semânticos */
  --color-bg:          var(--color-white);
  --color-bg-alt:      var(--color-primary-50);
  --color-text:        var(--color-ink-800);
  --color-text-muted:  var(--color-ink-600);
  --color-link:        var(--color-primary-600);
  --color-border:      #E3E5EE;
  --color-focus:       var(--color-accent-400);
}
```

### 2.2 Uso e proporção

| Papel | Cor | Proporção aproximada |
|---|---|---|
| Fundo geral | Branco / `primary-50` alternando por seção | 60% |
| Marca (header, botões, títulos de seção) | `primary-500` | 25% |
| Destaque | `accent-500` / `accent-400` | 5–8% |
| Apoio (mint, coral) | pontual, só CTAs e links de ação | < 5% |

**Regras**
- Amarelo **nunca** como texto sobre branco (contraste insuficiente). Use sobre `primary-500`, `primary-900` ou fotos com overlay escuro.
- Texto branco sobre `primary-500` só a partir de 16px/700 ou 18px/400 (contraste ~4,3:1). Para texto pequeno, use `primary-700` ou `primary-900` como fundo.
- Coral é para links de ação em cards, não para erros críticos (para erro, use um vermelho próprio, ex. `#D92D20`).

---

## 3. Tipografia

O original usa fontes proprietárias (títulos e textos da família da marca) + **Inter**. Substituições sugeridas:

| Papel | Original (referência) | Alternativa livre |
|---|---|---|
| Display / títulos | Fonte de títulos proprietária, geométrica arredondada, 700 | **Nunito Sans 800** ou **Poppins 700** |
| Texto de marca (menus, labels) | Fonte de textos proprietária | **Nunito Sans 400/700** |
| Corpo / UI | Inter | **Inter** |

```css
:root {
  --font-display: "Poppins", "Nunito Sans", system-ui, sans-serif;
  --font-brand:   "Nunito Sans", system-ui, sans-serif;
  --font-body:    "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

### 3.1 Escala

| Token | Tamanho / altura de linha | Peso | Fonte | Uso |
|---|---|---|---|---|
| `display-xl` | 96 / 100px | 700 | display | Palavra-chave do hero (ex.: nome da marca em amarelo) |
| `display-lg` | 48 / 56px | 700 | display | Linha principal do hero |
| `h1` | 44 / 52px | 700 | display | Título de seção |
| `h2` | 36 / 42px | 700 | display | Título de card de produto (sobre foto) |
| `h3` | 32 / 40px | 700 | display | Títulos de bloco institucional |
| `h4` | 28 / 34px | 700 | display | Subtítulos de seção, em `primary-500` |
| `title` | 18 / 26px | 700 | brand | Título de card simples |
| `body-lg` | 18 / 30px | 400 | body | Parágrafo introdutório de seção |
| `body` | 15 / 24px | 400 | body | Texto corrido padrão |
| `body-strong` | 15 / 24px | 700 | body | Ênfase |
| `label` | 12 / 16px | 700 | brand | CTAs textuais em CAIXA ALTA, tags, nav |
| `caption` | 12 / 18px | 400 | body | Notas legais, rodapé |

**Regras**
- Títulos com tracking levemente negativo (`-0.01em`); labels em caixa alta com `+0.02em`.
- Mobile: reduza display em ~40% (96→56, 48→32, 44→28, 36→26).

---

## 4. Espaçamento, grid e layout

```css
:root {
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px;  --space-7: 48px; --space-8: 64px;
  --space-9: 96px;

  --container-max: 1140px;
  --container-pad: 16px;          /* 24px a partir de 768px */
  --section-pad-y: var(--space-8); /* 96px no desktop */
}
```

- Grid de 12 colunas, gutter de 24px (padrão estilo Bootstrap).
- Breakpoints: `576 / 768 / 992 / 1200px`.
- Seções alternam fundo **branco** ↔ **`primary-50`** para separar conteúdo sem linhas.
- Hero ocupa largura total (full-bleed); conteúdo das demais seções fica no container.

---

## 5. Forma e elevação

```css
:root {
  --radius-xs: 2px;   /* botões compactos (ex.: banner de cookies) */
  --radius-sm: 4px;   /* padrão: botões, inputs, cards */
  --radius-md: 8px;   /* cards de produto, modais */
  --radius-lg: 12px;  /* abas/painéis com canto em um lado só */
  --radius-full: 999px; /* indicadores do carrossel, avatares, ícones circulares */

  --shadow-none: none;
  --shadow-inset-line: inset 0 1px 0 rgba(255,255,255,.08); /* divisor em fundos escuros */
  --shadow-sm: 0 2px 8px rgba(18, 18, 18, .06); /* uso opcional, hover de cards */
}
```

Elevação é **mínima**: cards brancos usam borda `1px var(--color-border)` em vez de sombra.

---

## 6. Componentes

### 6.1 Header
- Fundo `primary-500`, altura ~64px; logo em amarelo/branco à esquerda, ícone de menu (hambúrguer) branco.
- Abaixo, **barra de atalhos** com 3 botões "pílula retangular" centralizados: *Contratar um seguro · Acionar e acompanhar · Solicitar assistência*.
  - Fundo `rgba(255,255,255,.12)` ou `primary-600`, texto branco `label` em caixa alta, raio 4px, padding `12px 20px`.

### 6.2 Botões

| Variante | Fundo | Texto | Borda | Uso |
|---|---|---|---|---|
| Primário | `primary-500` | branco | — | Ação principal |
| Primário hover | `primary-700` | branco | — | |
| Acento | `accent-400` | `primary-900` | — | CTA sobre fundo azul |
| Mint | `mint-400` | `primary-900` | — | CTA em hero sobre foto |
| Secundário | transparente | `primary-500` | 1px `primary-500` | Ação alternativa |
| Link de ação | transparente | `coral-400` | — | "SIMULE AGORA ›" em cards |

- Texto: `label` (12px/700, caixa alta) ou 14px/700 em botões maiores.
- Padding: `12px 24px` (md), `8px 16px` (sm). Altura mínima de toque: 44px.
- Foco: `outline: 3px solid var(--color-focus); outline-offset: 2px`.

### 6.3 Hero (carrossel)
- Foto full-bleed com overlay gradiente escuro à esquerda (`linear-gradient(90deg, rgba(0,0,0,.45), transparent 60%)`).
- Linha 1 em branco (`display-lg`); palavra-chave em amarelo `accent-500` gigante (`display-xl`), opcionalmente com faixa azul por trás do texto (efeito "marca-texto").
- CTA mint pequeno abaixo.
- Indicadores: pontos de 12px, ativo = cápsula preenchida `primary-500` (≈32px de largura), inativos = círculo com borda `primary-500` e fundo branco.

### 6.4 Card de produto (com foto)
- Raio 8px, overflow hidden, foto de pessoas/situações reais com overlay escuro em degradê de baixo para cima.
- Título `h2` branco centralizado, descrição `body` branca, link "CONHEÇA" em `label` branco.
- Rodapé do card: faixa sólida `primary-500` com CTA "FAÇA COTAÇÃO" (ou faixa preta quando não há cotação).
- Exibidos em carrossel horizontal com 2–3 cards visíveis.

### 6.5 Card de informação (simples)
- Fundo branco, borda `1px var(--color-border)`, raio 4–8px, padding 32px.
- Título `title`, texto `body` `ink-600`, link de ação coral com chevron `›` no rodapé.

### 6.6 Bloco institucional
- Fundo `primary-500` ou `primary-900`, título `h3` em amarelo, texto branco, imagem lateral.

### 6.7 Banner de consentimento (cookies)
- Fixo no rodapé, fundo `primary-100`, texto 15px `ink-800`.
- Dois botões primários empilhados à direita (raio 2px) + link com ícone de ajustes em `primary-300`.

### 6.8 Widget de acessibilidade
- Botões quadrados 40px empilhados, fixos na borda direita, fundo `primary-900`/`primary-600`, ícone branco, raio 8px apenas do lado esquerdo.

### 6.9 Rodapé
- Fundo `primary-900` ou `ink-900`, texto branco/`primary-200`, colunas de links 14px, divisores `--shadow-inset-line`.

---

## 7. Imagens e iconografia
- **Fotografia**: pessoas brasileiras reais, luz natural, contextos de vida (casa, campo, família, viagem). Evite banco de imagens com aparência corporativa genérica.
- **Ícones**: linha (stroke 1.5–2px), cantos arredondados, cor `primary-500` ou branco. Chevron `›` para navegação.
- **Ilustração**: pouco usada; se usar, chapada nas cores de marca, sem gradientes.

---

## 8. Movimento
- Transições curtas: `150ms ease-out` para hover/foco, `300ms ease` para carrossel.
- Carrossel com autoplay ≥ 6s e botão de pausa visível; respeitar `prefers-reduced-motion`.

---

## 9. Acessibilidade (checklist)
- [ ] Contraste AA em todo texto (verificar branco sobre `primary-500` em tamanhos pequenos).
- [ ] Amarelo apenas sobre fundos escuros.
- [ ] Foco visível em todos os elementos interativos.
- [ ] Alvos de toque ≥ 44×44px.
- [ ] Atalhos de acessibilidade/VLibras visíveis.
- [ ] Textos alternativos descritivos nas fotos dos cards.

---

## 10. Tokens prontos (resumo para Tailwind)

```js
// tailwind.config.js (trecho)
theme: {
  extend: {
    colors: {
      primary: { 50:'#F9F7FF',100:'#E5E8FF',200:'#C6CEFF',300:'#9CA9FF',500:'#5A6FFF',600:'#465EFF',700:'#3751FF',900:'#003087' },
      accent:  { 400:'#FCEE4F', 500:'#FCFC30' },
      mint:    { 400:'#6AEDD3' },
      coral:   { 400:'#FF6F68' },
      ink:     { 500:'#656565', 600:'#4C4C4C', 800:'#212529', 900:'#121212' },
    },
    fontFamily: {
      display: ['Poppins','Nunito Sans','sans-serif'],
      brand:   ['Nunito Sans','sans-serif'],
      body:    ['Inter','system-ui','sans-serif'],
    },
    borderRadius: { xs:'2px', sm:'4px', md:'8px', lg:'12px' },
    maxWidth: { container:'1140px' },
  },
}
```

## 11. Landing reformulada (28/10/2026)

Na rota `/`, o briefing de reformulação adota a composição e o ritmo da Skydive: hero minimalista com fundo `#FDEE4F`, bento de oito proteções com cenas animadas e conversão para `/perfil`. O cabeçalho da landing e da jornada de perfil usa `#5A6FFF`; logo e selo ficam sobre branco para manter contraste. Os cards usam raio de 24 px e os CTAs são arredondados. A identidade, as fontes e o logo próprio são preservados. Estas escolhas substituem as sugestões de hero/carrossel e raios anteriores nessas telas. Análise da referência, implementação e critérios de verificação: [LANDING-REFERENCE.md](LANDING-REFERENCE.md).

## 12. Jornada de perfil

A abertura de `/perfil` usa painel amarelo, imagem de recepção do gênio e consentimento sobre branco. O painel de conversa mantém perguntas, chat e fatos separados, agora com o mesmo cabeçalho azul, cartões arredondados e destaque amarelo do personagem. A nova pose `recepcao` aparece na abertura e quando o guia está ouvindo; apresentação, espera e conclusão permanecem nos estados correspondentes.

A imagem fornecida em `assets/recepcao.webp` tinha o quadriculado incorporado. `public/geniobb/recepcao-transparente.webp` foi criada com a ferramenta integrada `image_gen`, em edição `background-extraction`. Prompt: remover apenas o fundo quadriculado e produzir transparência real, preservando rosto, sorriso, gesto, roupa, contornos, cores, composição e proporções do gênio, sem objetos ou texto novos.

As poses em uso na aplicação são arquivos `.webp`. A fotografia da seção de conversão também foi convertida para WebP, preservando a atribuição em `public/geniobb/CREDITOS.md`. Na jornada, o gênio recebe o usuário, espera a resposta, pensa ao receber uma informação, consulta fontes quando necessário, explica e conclui. As transições sobrepõem os frames com desfoque breve; cada reação fica visível por tempo próprio e uma nova resposta interrompe gestos antigos. O personagem reage de forma sutil ao foco nos campos.

Ao encerrar as perguntas, a jornada mostra uma análise com barra de progresso antes da comparação de três opções. O modo demonstração emite uma recomendação preliminar com Prático, Essencial e Total; a tela deixa claro que não calcula valor de seguro nem substitui as condições do produto. O gênio aparece pensando na análise e apontando para as opções no resultado. O usuário pode voltar ao perfil para rever respostas.
