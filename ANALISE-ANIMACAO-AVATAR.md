# Animação do avatar no formulário

## Objetivo

Criar uma experiência de formulário inspirada na interação do Akinator, com um avatar que reage aos momentos de cada pergunta e resposta, aproveitando as imagens existentes do personagem.

## Recomendação

Usar animação por sprites, controlada pelos estados do formulário. Essa abordagem aproveita a arte existente e permite que o personagem reaja às interações no frontend Next.js/React do projeto.

A implementação depende do tipo de imagem disponível:

- **Sequências de movimento:** reproduzir os frames como uma animação.
- **Poses diferentes**, como pensando, feliz e curioso: alternar as poses e acrescentar movimentos sutis com CSS. A troca de imagens não cria movimentos intermediários de braços ou rosto.

## Estados do personagem

| Momento do formulário | Comportamento do avatar |
| --- | --- |
| Apresentação | Cumprimento curto |
| Esperando resposta | Pose atenta, com movimento discreto |
| Resposta selecionada | Reação curta de reconhecimento |
| Processando resposta | Animação de pensamento |
| Próxima pergunta | Volta à pose atenta |
| Conclusão | Comemoração |

## Implementação sugerida

Criar um componente como `<Avatar state="thinking" />`, separado da lógica das perguntas. Cada estado define a sequência, a duração e se a animação deve repetir ou tocar apenas uma vez.

Para sequências de movimento, agrupar os frames em uma **sprite sheet por animação**: uma imagem contendo todos os quadros, exibidos em sequência com CSS `steps()`. Essa função permite avançar em saltos, sem deslizar visualmente entre os quadros.

Referência: [MDN — animation-timing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timing-function).

## Cuidados de experiência e execução

- Manter o mesmo tamanho de tela e alinhamento do personagem em todos os frames, evitando saltos de posição.
- Pré-carregar a animação inicial e as próximas reações para evitar piscadas durante a troca.
- Executar a reação junto da passagem para a próxima pergunta, sem obrigar o usuário a esperar pela animação.
- Usar expressões acolhedoras. Em perguntas de perfil, uma resposta não deveria parecer errada.
- Oferecer poses estáticas quando houver preferência por movimento reduzido, usando `prefers-reduced-motion`.

Referência: [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Escopo da primeira versão

Começar com quatro estados:

1. Atento.
2. Reconhecendo a resposta.
3. Pensando.
4. Comemorando.

Se houver apenas uma imagem de cada expressão, implementar a experiência com troca de poses e CSS. Se houver sequências completas, usar sprites para movimentos mais naturais.

## Limitação da análise

O site do Akinator bloqueou a consulta automatizada. A recomendação considera a experiência descrita e a existência dos assets informados, sem presumir como o Akinator foi implementado. Os frames ainda precisam ser inspecionados para definir a organização e os tempos de cada animação.
