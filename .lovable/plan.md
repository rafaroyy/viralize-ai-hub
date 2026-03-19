

# Diagnóstico: Por que o score está inflado (75/100 para vídeo fraco)

## Problemas encontrados

### 1. O Agente 2 (OpenAI) está FALHANDO — toda análise é só Gemini
Os logs mostram claramente:
```
OpenAI API error: 400 "Unsupported parameter: 'max_tokens' is not supported with this model. Use 'max_completion_tokens' instead."
Fallback: retornando análise do Gemini sem refinamento.
Pipeline finalizado. Fallback: true
```
O modelo `gpt-5.4` não aceita `max_tokens`, precisa de `max_completion_tokens`. Resultado: o refinamento estratégico com todos os frameworks de autenticidade, cringe e regras de decisão **nunca está sendo executado**. Toda análise retornada é só a extração bruta do Gemini.

### 2. Sem calibração de score — o Gemini é "bonzinho"
O prompt do Gemini pede "Score 0-100" mas não define o que cada faixa significa. Sem âncoras claras, LLMs tendem a dar scores altos (60-85) para qualquer conteúdo minimamente estruturado. Um vídeo com legendas quebradas, roteiro robotizado e sem naturalidade recebe 75 porque "tem hook, corpo e CTA".

### 3. Temperature 0.7 no Gemini — muito alta para análise crítica
Temperatura alta incentiva respostas mais "criativas" e generosas. Para análise crítica, deveria ser mais baixa.

## Plano de correção

### 1. Corrigir parâmetro OpenAI (`max_tokens` → `max_completion_tokens`)
Isso reativa o Agente 2, que é onde estão os frameworks de autenticidade, cringe e regras de decisão.

### 2. Adicionar calibração de score explícita nos prompts
Adicionar âncoras claras nos dois agentes:

```
CALIBRAÇÃO DE SCORE (OBRIGATÓRIO):
• 0-25 (Baixo): Sem estrutura viral, sem hook, sem retenção
• 26-45 (Moderado): Tem estrutura básica mas falhas graves (robotizado, cringe, sem naturalidade)
• 46-65 (Alto): Estrutura boa, algumas falhas de execução ou autenticidade
• 66-80 (Viral): Estrutura forte + execução boa + autenticidade percebida
• 81-100 (Mega Viral): Excepcional em estrutura, execução E autenticidade

PENALIDADES OBRIGATÓRIAS:
• Vídeo claramente gerado por IA (voz sintética, avatar, legendas mecânicas): -15 a -25 pontos
• Roteiro robotizado ou frases improváveis na fala real: -10 a -20 pontos
• Legendas quebradas ou mal sincronizadas: -5 a -15 pontos
• Falta de emoção real ou energia artificial: -10 a -20 pontos
• Mismatch entre promessa e entrega: -10 a -15 pontos

REGRA DE OURO: Um vídeo com estrutura P-C-R perfeita MAS sem autenticidade
percebida NUNCA deve passar de 55. Estrutura sem verdade = conteúdo genérico.
```

### 3. Reduzir temperature do Gemini de 0.7 → 0.4
Análise mais precisa e menos "generosa".

### 4. Instruir Gemini a também avaliar autenticidade
O Gemini (que vê o vídeo) é o único que pode detectar sinais visuais de IA. Adicionar instrução explícita no prompt do Gemini para avaliar artificialidade.

## Arquivo alterado
- `supabase/functions/analyze-viral/index.ts` — 4 correções pontuais

