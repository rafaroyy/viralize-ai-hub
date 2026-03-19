

## Diagnóstico: Edge Function morre antes de concluir

O problema é arquitetural. A Edge Function `viral-clips` usa um padrão de "background processing" com `(async () => { ... })()` que **não funciona** em Deno Edge Functions. O runtime encerra o processo ~2 minutos após enviar a resposta HTTP, matando a task de transcrição/análise antes de completar. Por isso o status fica preso em "transcribing" para sempre.

### Solução: Processamento síncrono (aguardar na mesma request)

Remover o padrão de background processing. A Edge Function deve processar tudo sincronamente e retornar o resultado final na resposta. O frontend já faz polling, então a mudança é:

1. **Edge Function (`viral-clips/index.ts`)**: Executar todo o pipeline (upload, transcrição, análise) de forma síncrona dentro do handler, atualizando o status na tabela a cada etapa. Retornar o resultado final (clips) na resposta HTTP.

2. **Frontend (`CortesVirais.tsx`)**: Ao invés de esperar resposta imediata e fazer polling, fazer a chamada com timeout longo e tratar o resultado direto da resposta. Manter o polling como fallback mas atualizar com a resposta direta.

3. **Timeout**: O ElevenLabs Scribe pode levar 30-60s para vídeos longos, e a análise com Gemini mais 10-20s. A Edge Function tem limite de ~150s. Isso é suficiente para a maioria dos casos.

4. **Adicionar timeout no polling**: Se o polling ficar rodando por mais de 5 minutos sem mudança de status, parar e mostrar erro ao usuário.

### Arquivos a editar

| Arquivo | Mudança |
|---|---|
| `supabase/functions/viral-clips/index.ts` | Remover IIFE async, processar sincronamente, retornar resultado na resposta |
| `src/pages/CortesVirais.tsx` | Adaptar para receber resultado direto da resposta + timeout no polling |

