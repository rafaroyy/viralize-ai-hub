

## Plano: Feature Beta "Cortes Virais" — Versão Completa

Ferramenta exclusiva para `rafa07roy@gmail.com` que recebe vídeos longos (upload ou URL do YouTube), transcreve, identifica momentos virais e gera cortes prontos para edição com legendas.

---

### 1. Acesso beta condicional

- **`src/components/AppSidebar.tsx`**: Adicionar constante `BETA_EMAILS = ["rafa07roy@gmail.com"]`. Renderizar link "Cortes Virais" com badge `Beta` e ícone `Scissors` apenas se `user?.email` estiver na lista.
- **`src/App.tsx`**: Adicionar rota protegida `/cortes-virais` com componente lazy-loaded. A rota só aparece para beta users (verificação no sidebar; a rota em si fica acessível mas sem link visível para outros).

### 2. Página `src/pages/CortesVirais.tsx`

Interface com 3 estados principais:

**Estado 1 — Input**
- Campo para colar URL do YouTube (prioridade) ou upload de arquivo de vídeo (até 500MB)
- Para YouTube: Edge Function baixa o vídeo via `yt-dlp` ou ytdl API
- Botão "Analisar Vídeo"

**Estado 2 — Processamento (multi-etapa com progress)**
- Stepper visual: `Baixando → Transcrevendo → Analisando → Pronto`
- Polling do status via tabela `viral_clips`

**Estado 3 — Resultado: Lista de Clips**
- Cards para cada clip detectado com:
  - Título sugerido + hook
  - Timestamps (início/fim) com duração
  - Score viral (0-100) com barra colorida
  - Motivo da seleção
  - **Player de preview** que carrega o vídeo original e pula direto para o timestamp do clip (usando `currentTime` no `<video>` element ou YouTube embed com `start`/`end` params)
  - Botão "Criar Corte" → envia para o pipeline `/videos/render` com parâmetros de trim (`start_ms`, `end_ms`) + legendas automáticas da transcrição

### 3. Edge Function `supabase/functions/viral-clips/index.ts`

Pipeline em 3 etapas:

1. **Download/recebimento do vídeo**
   - Se URL do YouTube: usar API externa para obter stream do vídeo
   - Se upload: receber via FormData

2. **Transcrição via ElevenLabs Scribe v2**
   - Streaming direto do áudio para ElevenLabs (evitar limite de memória)
   - Obter word-level timestamps + diarização
   - Secret já disponível: `ELEVENLABS_KEY`

3. **Análise com Lovable AI (Gemini 3 Flash Preview)**
   - Enviar transcrição completa + contexto do `creator_profile` (nicho, público, estilo) + `knowledge_base` (frameworks de retenção P-C-R, HDC, PPMO)
   - Prompt pede: identificar 3-8 trechos de 30-90s com maior potencial viral
   - Usar tool calling para output estruturado:
     ```json
     { "clips": [{ "start_ms", "end_ms", "title", "hook", "viral_score", "reason", "suggested_caption" }] }
     ```
   - Salvar resultado na tabela `viral_clips`

### 4. Tabela `viral_clips` (migration)

```sql
create table public.viral_clips (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  source_url text,
  source_type text default 'upload',
  video_storage_path text,
  transcription text,
  clips jsonb default '[]',
  status text default 'pending',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

RLS: acesso público (mesmo padrão do projeto com auth externa).

### 5. Integração com YouTube (URL direta)

- Campo de input aceita URLs no formato `youtube.com/watch?v=` ou `youtu.be/`
- Edge Function extrai o video ID e baixa o áudio via API externa (ou proxy)
- Player de preview usa iframe do YouTube com parâmetros `?start=X&end=Y` para preview dos clips
- Fallback: se não conseguir baixar, orientar o usuário a fazer upload manual

### 6. Preview com player e timestamps

- Para vídeos do YouTube: embed com `?start={seconds}` para cada clip
- Para uploads: `<video>` element com `ref.currentTime = startSeconds` ao clicar no clip
- Barra de timeline visual mostrando onde cada clip está no vídeo original
- Botões de play/pause por clip individual

### 7. Edição automática com legendas (integração render pipeline)

- Ao clicar "Criar Corte", o sistema:
  1. Extrai o trecho de transcrição correspondente ao clip (word-level timestamps)
  2. Monta o payload para `/videos/render` com:
     - Vídeo fonte (URL de storage ou YouTube)
     - Parâmetros de trim: `start_ms`, `end_ms`
     - Texto da legenda já sincronizado
     - Estilo de caption selecionado (usando a API existente `/captions/styles`)
  3. Envia para o pipeline de renderização existente
  4. O corte editado aparece em "Meus Vídeos" quando pronto

### 8. Config

- **`supabase/config.toml`**: Adicionar `[functions.viral-clips]` com `verify_jwt = false`

---

### Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/CortesVirais.tsx` | Criar — página completa com input, progress e resultado |
| `src/components/AppSidebar.tsx` | Editar — link beta condicional |
| `src/App.tsx` | Editar — adicionar rota |
| `supabase/functions/viral-clips/index.ts` | Criar — pipeline transcrição + análise |
| `supabase/config.toml` | Editar — adicionar função |
| Migration | Criar tabela `viral_clips` |

