

# Correções no Pipeline de Análise Viral

## Diagnóstico

O `knowledge_base.ts` está bem estruturado com 5 novas seções. Porém o `analyze-viral/index.ts` tem dois desalinhamentos:

### Problema 1: Agente OpenAI não recebe os novos frameworks
O prompt do OpenAI (Agente 2, linha 255-310) injeta apenas os 6 frameworks originais. Os 5 novos exports estão ausentes:
- `FRAMEWORK_ANALISE_AUTENTICIDADE`
- `REGRAS_DE_DECISAO_ANALISE`
- `SCORECARD_ANALISE_VIRAL`
- `FORMATO_SAIDA_ANALISE`
- `SCHEMA_ANALISE_JSON`

O Gemini recebe tudo (via `SYSTEM_PROMPT_BASE`), mas o OpenAI — que é o agente de refinamento estratégico — não tem acesso ao framework de autenticidade, regras de decisão nem ao scorecard.

### Problema 2: Schema JSON dos prompts desatualizado
Os dois prompts ainda pedem o schema antigo (`overallScore`, `hookAnalysis`, `bodyAnalysis`...), mas o `SCHEMA_ANALISE_JSON` define uma estrutura completamente diferente com `scores` (0-5 por dimensão), `evidence`, `risk_diagnosis`, `action_items`, `final_verdict`.

O frontend (`AnalisadorViral.tsx`) espera o schema antigo, então temos que escolher: atualizar o frontend para o novo schema, ou manter o schema antigo nos prompts e usar o novo apenas como referência interna.

## Plano

### 1. Atualizar import no `analyze-viral/index.ts`
Adicionar os 5 novos exports ao import.

### 2. Injetar novos frameworks no prompt do OpenAI
Adicionar `FRAMEWORK_ANALISE_AUTENTICIDADE`, `REGRAS_DE_DECISAO_ANALISE` e `SCORECARD_ANALISE_VIRAL` ao prompt do Agente 2, mantendo a mesma estrutura de separação por `---`.

### 3. Manter o schema JSON de output atual
O frontend já renderiza o schema antigo. Ao invés de quebrar tudo, vamos manter o output JSON atual mas instruir os agentes a usarem os novos frameworks como critérios de avaliação internos (autenticidade, cringe, risco de IA). Assim a qualidade da análise melhora sem quebrar a UI.

### 4. Aumentar `max_tokens` do OpenAI
Com mais contexto sendo processado, subir de 2000 para 3000 tokens para evitar respostas truncadas.

### Arquivos alterados
- `supabase/functions/analyze-viral/index.ts` — imports, prompt do OpenAI, max_tokens

