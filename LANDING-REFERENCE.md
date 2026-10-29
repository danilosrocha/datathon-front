# Landing: referência visual e validação

## Direção

Reformulação da landing do Negócio de Pé para pequenos negócios, com linguagem de produto digital, composição espaçosa e identidade azul, amarela e branca. Mantidos Next.js, Tailwind, shadcn/ui, Motion, Lucide, Poppins/Inter, logo próprio e destino `/perfil`.

Parâmetros de composição: variedade 7/10, movimento 6/10 e densidade 3/10. Hero centralizada e minimalista conforme o pedido; bento com oito cenas demonstrativas. Tema claro acompanha a identidade existente. Cards com raio de 24 px; botões de conversão arredondados; elementos internos menores usam 12–18 px.

## Referência inspecionada

[Skydive](https://www.skydive.com/?ref=land-book.com), aberta no Chrome em 28/10/2026. Inspeção de entrada, rolagem, hover, estilos e animações em execução.

- Hero centralizada, com elementos orbitando e mudanças de posição/escala durante o scroll.
- Cenas de funcionalidades permanecem na tela durante trechos de rolagem; mensagens, dispositivos e painéis se sobrepõem e mudam de estado.
- Texto das cenas usa transições de opacidade e deslocamento de 16–18 px, em 500–550 ms, com curva `cubic-bezier(0.22, 0.61, 0.36, 1)`.
- Hover discreto em links e botões; escala nos elementos da hero.
- Pequenas animações de digitação, elementos orbitais e uma faixa contínua de depoimentos dão vida às composições.
- Fundo claro, bastante espaço entre blocos, bordas discretas e sombras suaves.

A versão atual da referência usa principalmente cenas fixadas durante o scroll. A adaptação organiza as demonstrações no bento solicitado, com entrada progressiva e escala, preservando a rolagem nativa e a leitura de todas as oito proteções. Não reproduz os longos trechos fixados nem copia assets, conteúdo ou identidade da Skydive.

## Implementação

- `hero.tsx`: mensagem em duas linhas no desktop, descrição curta, fundo amarelo `#FDEE4F` e CTA azul escuro.
- `protection-benefits.tsx`: oito cards semânticos, larguras variadas, entrada com intervalo de 70 ms e hover de 5 px.
- `protection-scenes.tsx`: camadas em torno da loja, pulsos elétricos, varredura de bens, indicadores nos equipamentos, proteção de terceiros, atividades, ferramentas e conversa.
- `reveal.tsx`: transições de 550 ms, executadas uma vez por entrada na viewport.
- `final-cta.tsx` e `how-it-works.tsx`: descoberta inteligente, três passos, imagem existente e CTA para `/perfil`.
- `landing.css`: composição restrita à landing; os tokens e componentes de `/perfil` não são alterados.

As ilustrações são decorativas (`aria-hidden`), com explicações estáticas nos cards. Não são cotações, simulações interativas ou confirmações de cobertura. O texto distingue cobertura e assistência e explicita condições e elegibilidade.

## Acessibilidade e movimento

`useInView` limita os loops aos cards visíveis. O botão de pausa interrompe as cenas e o hover dos cards. `prefers-reduced-motion` elimina loops e deslocamentos, inclusive no CSS inicial. Conteúdo e links permanecem disponíveis sem JavaScript. Botões e links mantêm foco visível; os cards informativos não acrescentam paradas artificiais de teclado.

Referências técnicas: [Motion: acessibilidade](https://motion.dev/docs/react-accessibility) e [useInView](https://motion.dev/docs/react-use-in-view).

## Verificação

Comandos: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

Revisão no Chrome: desktop e mobile; larguras 320, 390, 768, 1024 e 1440 px; oito cards; CTAs; âncoras; teclado; pausa/retomada; movimento reduzido; conteúdo sem JavaScript. Auditoria automatizada com axe e Lighthouse complementa a inspeção visual, sem substituir avaliação manual com tecnologias assistivas.

Resultado local em 28/10/2026: lint, typecheck e build aprovados. Playwright confirmou responsividade, controle de animação, conteúdo sem JavaScript, âncoras, teclado e navegação para `/perfil`. Axe: nenhuma violação nas regras WCAG 2 A/AA e 2.1 A/AA executadas. Lighthouse no build de produção, com simulação mobile: desempenho 95, acessibilidade 100, boas práticas 100; FCP 0,9 s, LCP 2,8 s, TBT 70 ms e CLS 0. São medições de laboratório local, não métricas de usuários em produção. O título da hero já é visível no HTML inicial para não depender da hidratação para aparecer.
