# Gênio BB — Pacote de frames HD

Pacote com 84 PNGs individuais organizados por movimento (7 sequências × 12 quadros).

- Resolução de **cada frame**: 1600 × 1100 pixels.
- Formato: **PNG RGBA, com transparência real**.
- As imagens têm um **canvas fixo**, sem saltos causados por alterações de dimensões.
- A duração por animação pode ser consultada em `manifest.json`.
- Prévia de cada movimento em `previas/*.webp` (animado).

## Uso no React

Renderize `frame_001.png` → `frame_012.png` sequencialmente na mesma área visual, usando a duração definida no manifesto.
Defina `object-fit: contain` e mantenha a mesma largura/altura para todos os frames.
Para um movimento do Gênio ao longo da página, use GSAP apenas no contêiner da sequência de quadros.

## Limitação importante

As sete ilustrações originais do usuário estão em 1536 × 1024. Para manter o design e a resolução, estes frames foram criados por animação 2D com *motion deformation* localizada (cauda, braços, cards e flutuação) sobre essas artes originais.
O movimento é **sutil**; isto não é animação 2D desenhada quadro a quadro com poses independentes de mãos/corpo e tampouco um arquivo Rive com rigging. Para expressões complexas e acenos amplos, é necessário separar membros em camadas ou criar poses intermediárias desenhadas.
