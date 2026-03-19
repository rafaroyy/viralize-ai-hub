

# Simplificar Linguagem das Análises — Tom Didático

## Problema

Os prompts instruem o agente a usar termos técnicos como "micro-hooks", "pattern interrupts", "open loops", "mismatch promessa/entrega" etc. O público da Viralize é iniciante e não entende esse jargão.

## Solução

Adicionar uma **seção de tom de linguagem obrigatória** nos prompts do Gemini e do OpenAI dentro do `analyze-viral/index.ts`, instruindo os agentes a:

1. Escrever como se estivessem explicando para alguém que nunca fez um vídeo viral
2. Substituir jargões por explicações práticas e diretas
3. Usar exemplos concretos ao invés de termos abstratos

## Mudanças

### 1. `supabase/functions/analyze-viral/index.ts`

Adicionar nos **dois prompts** (Gemini e OpenAI) uma seção de linguagem obrigatória:

```
## TOM DE LINGUAGEM (OBRIGATÓRIO)
Escreva como se estivesse explicando para um criador INICIANTE que nunca estudou marketing.
• NÃO use jargões técnicos como "micro-hooks", "pattern interrupts", "open loops", "mismatch", "CTA teatral"
• SUBSTITUA por linguagem simples e direta:
  - "micro-hooks" → "pequenos momentos que prendem a atenção"
  - "pattern interrupt" → "algo inesperado que faz a pessoa parar e prestar atenção de novo"
  - "open loop" → "deixar uma curiosidade no ar pra pessoa querer ver até o final"
  - "mismatch" → "a promessa do início não bate com o que o vídeo entrega"
  - "CTA" → "convite pra ação no final (seguir, curtir, comentar)"
  - "retenção" → "manter a pessoa assistindo sem pular"
  - "engagement rate" → "nível de interação do público"
• Use frases curtas e diretas, como se estivesse conversando
• Dê exemplos práticos sempre que possível
• Evite palavras rebuscadas — prefira "funciona bem" ao invés de "tem alta performance"
```

Isso será inserido **antes** do bloco de JSON output nos dois prompts, garantindo que tanto o Gemini quanto o OpenAI sigam o tom simplificado.

## Arquivos alterados

| Arquivo | Ação |
|---|---|
| `supabase/functions/analyze-viral/index.ts` | Adicionar bloco de tom de linguagem nos prompts Gemini e OpenAI |

