
## Plano para parar o erro de limite do Gemini e manter o Analisador funcionando

### Diagnóstico confirmado
Pelos logs, o problema não é upload nem URL do vídeo: o arquivo sobe e fica `ACTIVE` na File API, mas a etapa de geração retorna `429 RESOURCE_EXHAUSTED` (quota/billing do Gemini).  
Ou seja: trocar chave não garante sucesso se a nova chave também estiver sem cota disponível.

### O que vou implementar
1. **Padronizar erro de quota na função `analyze-viral`**
   - Arquivo: `supabase/functions/analyze-viral/index.ts`
   - Quando der 429 no Gemini, retornar payload com código legível pelo frontend, por exemplo:
     - `success: false`
     - `code: "GEMINI_QUOTA_EXCEEDED"`
     - `error: "..."`

2. **Fallback automático no frontend (sem quebrar fluxo do usuário)**
   - Arquivo: `src/pages/AnalisadorViral.tsx`
   - Fluxo:
     - Tenta `analyze-viral` normalmente (fluxo atual).
     - Se vier `GEMINI_QUOTA_EXCEEDED`, ativa fallback automático usando `analyze-script`:
       - **Com vídeo**: envia `FormData` (arquivo + campos de transcrição) para análise por transcrição.
       - **Só texto**: envia o texto como roteiro.
   - Em seguida, converte o retorno desse fallback para o formato `ViralAnalysis` já usado na tela.

3. **Mapeamento de schema para não quebrar a UI**
   - Converter campos de `analyze-script` (`pergunta`, `conflito`, `resposta`, `insights`) para:
     - `hookAnalysis`, `bodyAnalysis`, `ctaAnalysis`
     - `strengths`, `weaknesses`
     - `overallScore`, `summary`
   - Mantém compatibilidade com o layout atual e com exportação/histórico.

4. **Transparência para o usuário na interface**
   - Mostrar aviso discreto (badge/toast) quando o resultado vier do modo fallback:
     - ex.: “Modo alternativo ativo (análise via transcrição)”.

5. **Resiliência final**
   - Se fallback também falhar, mostrar erro acionável (sem mensagem genérica).
   - Manter salvamento em histórico funcionando no sucesso (normal ou fallback).

---

## Detalhes técnicos (resumo)
- **Sem migration de banco**.
- **Sem mudar autenticação**.
- **Arquivos alterados**:
  - `supabase/functions/analyze-viral/index.ts`
  - `src/pages/AnalisadorViral.tsx`
- **Resultado esperado**:
  - Mesmo com quota do Gemini estourada, o usuário ainda recebe análise em vez de erro bloqueante.
  - Fluxo principal com Gemini continua sendo a primeira opção quando houver cota.
