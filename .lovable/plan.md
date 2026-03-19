

## Diagnóstico: Cobalt API bloqueada pelo YouTube

A API pública do Cobalt (`api.cobalt.tools`) está permanentemente bloqueada pelo YouTube desde agosto 2025 (issue #1356 no GitHub). Por isso toda tentativa de baixar áudio via YouTube URL falha.

### Solução: Duas frentes

**Frente 1 — YouTube: Buscar transcrição diretamente (sem baixar vídeo)**

Em vez de baixar o áudio do YouTube para transcrever via ElevenLabs, buscar as legendas/captions do YouTube diretamente usando a técnica do `youtube-transcript-api-js` (scraping da página de captions do YouTube, sem API key). Isso elimina completamente a necessidade de baixar o vídeo.

Pipeline YouTube atualizado:
```text
URL YouTube → Extrair video ID → Buscar captions/transcript do YouTube
→ Enviar texto + timestamps para Gemini (análise viral)
→ Retornar clips
```

Vantagens: Sem download de vídeo, muito mais rápido, sem limites de tamanho, sem dependência do Cobalt.

**Frente 2 — Upload de arquivo: Manter pipeline atual**

Para uploads diretos, o fluxo ElevenLabs Scribe continua funcionando normalmente.

### Implementação

**`supabase/functions/viral-clips/index.ts`**:
1. Remover toda a lógica do Cobalt
2. Adicionar função `fetchYoutubeTranscript(videoId)` que faz scraping das captions do YouTube (buscar página do vídeo → extrair `captionTracks` do `ytInitialPlayerResponse` → fazer fetch do XML de legendas → parsear timestamps)
3. Para YouTube: pular ElevenLabs, usar transcript do YouTube direto
4. Para upload: manter ElevenLabs Scribe como está

**`src/pages/CortesVirais.tsx`**:
- Sem mudanças necessárias (o frontend já trata o fluxo corretamente)

### Arquivo

| Arquivo | Mudança |
|---|---|
| `supabase/functions/viral-clips/index.ts` | Substituir Cobalt por YouTube transcript scraping |

