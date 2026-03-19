

# Correções: Classification, Summary e Scores das Seções

## Problemas Identificados

### 1. Classification desalinhada do score
O campo `classification` vem direto da IA e não é validado pelo frontend. Score 47 mostra "Alto" porque a IA decide a classification independentemente. **Solução**: derivar a classification do score no frontend, ignorando o que a IA retorna.

### 2. Summary técnico em vez de user-facing
O prompt instrui a IA a incluir avaliação de autenticidade no campo `summary`, o que gera textos como "A análise do Gemini acerta no valor do hook...". O usuário final não quer saber sobre o Gemini. **Solução**: alterar o prompt para que o summary seja um resumo prático para o criador de conteúdo.

### 3. Scores das seções fora da escala
O prompt pede "Score 0-100" mas a IA às vezes retorna valores na escala 0-5 (ex: 4, 2, 3). O frontend renderiza esses valores diretamente na Progress bar de 0-100. **Solução**: adicionar normalização no frontend (se score ≤ 10, multiplicar por 10) e reforçar a escala 0-100 no prompt.

## Plano

### 1. Frontend (`AnalisadorViral.tsx`)

**Derivar classification do score** na função `normalizeAnalysis`:
```
0-25  → "Baixo"
26-45 → "Moderado"  
46-65 → "Alto"
66-80 → "Viral"
81+   → "Mega Viral"
```

**Normalizar scores das seções**: se `hookAnalysis.score`, `bodyAnalysis.score` ou `ctaAnalysis.score` forem ≤ 10, multiplicar por 10 para alinhar com a escala 0-100.

### 2. Backend (`analyze-viral/index.ts`)

**Prompt do Gemini**: mudar a instrução do `summary` de "inclua avaliação de autenticidade" para "escreva um resumo prático para o criador, explicando o que funciona e o que precisa melhorar — sem mencionar nomes de ferramentas ou agentes de IA".

**Prompt do OpenAI**: mesma instrução — summary deve ser user-facing.

**Reforçar escala**: adicionar nota explícita nos dois prompts: "IMPORTANTE: todos os scores (hookAnalysis.score, bodyAnalysis.score, ctaAnalysis.score) devem estar na escala 0-100, NÃO 0-5 ou 0-10."

### Arquivos alterados
- `src/pages/AnalisadorViral.tsx` — normalizeAnalysis
- `supabase/functions/analyze-viral/index.ts` — prompts do Gemini e OpenAI

