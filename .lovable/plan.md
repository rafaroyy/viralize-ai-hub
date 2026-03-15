

# Plano: Upgrade Visual do PDF para Dashboard B2B

O PDF já usa jsPDF com sanitização de emojis funcional. O pedido foca em 4 melhorias de layout e 1 correção de bug.

## Alterações em `src/lib/generateViralPDF.ts`

### 1. Score Geral com destaque maior
- Aumentar o `fontSize` do score de `42` para `48` e mudar a cor para `#7C3AED` (roxo da marca) em vez de verde/laranja/vermelho condicional.
- Manter o `/100` ao lado com fonte menor.

### 2. Caixas de fundo (containers) para P-C-R e Diagnóstico
- **Problema atual**: As card boxes do diagnóstico usam uma abordagem de "estimar altura, desenhar fundo, depois conteúdo" que falha porque jsPDF não suporta z-order -- o fundo sobrepõe o texto.
- **Solução**: Usar uma abordagem de **duas passagens** -- renderizar o conteúdo numa posição temporária para medir a altura, depois voltar atrás, desenhar o fundo `#F3F4F6` com `roundedRect(..., 'F')`, e re-renderizar o conteúdo por cima.
- Aplicar isso tanto nas secções P-C-R (Hook/Body/CTA) como no Diagnóstico (Pontos Fortes/Fracos).
- Padding interno de ~4mm e `borderRadius` de 3mm.

### 3. Cabeçalho e divisórias branded
- Já implementado parcialmente. Reforçar: a linha roxa do header deve ter `lineWidth: 2` (actualmente 0.8). Garantir que `sectionTitle` usa a cor roxa e bold (já faz).

### 4. Correção de timestamps no Roteiro
- **Bug**: O `sanitize()` mantém timestamps `[00:00-00:05]` mas o `timestamp` do JSON já vem com colchetes, resultando em `[[00:00-00:05]]`. A `action` pode começar sem espaço.
- **Fix**: Na secção bodyPacing, limpar colchetes duplicados do `cut.timestamp` com `.replace(/^\[+|\]+$/g, '')` antes de envolver em `[...]`. Garantir espaço antes da action.

### Resumo de ficheiros alterados
- `src/lib/generateViralPDF.ts` -- todas as alterações concentradas aqui.

