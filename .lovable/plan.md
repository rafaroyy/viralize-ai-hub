# Perfil do Criador + Análise Personalizada

## Visão geral

Criar um sistema de "Perfil do Criador" onde o usuário cadastra informações sobre seu conteúdo (nicho, público-alvo, estilo, plataformas). Na hora de analisar um vídeo, ele escolhe se quer análise personalizada (baseada no perfil) ou análise padrão (como é hoje).

## Estrutura

### 1. Nova tabela `creator_profiles`

```sql
CREATE TABLE public.creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  niche text NOT NULL DEFAULT '',
  sub_niches text[] DEFAULT '{}',
  target_audience text NOT NULL DEFAULT '',
  content_style text NOT NULL DEFAULT '',
  main_platforms text[] DEFAULT '{tiktok}',
  profile_handle text DEFAULT '',
  average_views text DEFAULT '',
  goals text DEFAULT '',
  tone_of_voice text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can CRUD (user_id is external, not auth.uid)
CREATE POLICY "Public read own profile" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profile" ON public.creator_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profile" ON public.creator_profiles FOR UPDATE USING (true) WITH CHECK (true);
```

### 2. Nova tab "Meu Perfil de Criador" na página Perfil

Adicionar uma terceira tab na página `Perfil.tsx` com formulário para preencher:

- **Nicho principal** (select: humor, finanças, saúde, beleza, tech, educação, lifestyle, etc.)
- **Sub-nichos** (tags/chips)
- **Público-alvo** (textarea: "Mulheres 25-35, classe B, interessadas em skincare")
- **Estilo de conteúdo** (select: educativo, entretenimento, storytelling, tutorial, opinião)
- **Plataformas principais** (multi-select: TikTok, Instagram, YouTube Shorts, Kwai)
- **@ do perfil** (input)
- **Média de views** (select: <1K, 1K-10K, 10K-100K, 100K-1M, 1M+)
- **Objetivo** (textarea: "Crescer pra 100K seguidores e monetizar com afiliados")
- **Tom de voz** (select: informal, profissional, engraçado, motivacional, direto)

Dados salvos via Supabase na tabela `creator_profiles` com `upsert` pelo `user_id`.

### 3. Hook `useCreatorProfile`

Hook reutilizável que carrega/salva o perfil do criador:

- `profile` — dados atuais
- `saveProfile(data)` — upsert
- `hasProfile` — boolean (para saber se o usuário já preencheu)
- `loading`

### 4. Toggle no Analisador Viral

Na UI do `AnalisadorViral.tsx`, adicionar um switch/toggle acima do botão "Analisar":

- **"Análise personalizada para meu perfil"** (on/off)
- Se on e o usuário tem perfil → envia dados do perfil junto com a request
- Se on e NÃO tem perfil → mostra toast sugerindo ir nas configurações criar o perfil
- Se off → análise genérica (comportamento atual)

### 5. Backend: injetar contexto do perfil nos prompts

No `analyze-viral/index.ts`:

- Receber campo opcional `creatorProfile` no body
- Se presente, adicionar bloco de contexto nos prompts do Gemini e OpenAI:

```
## CONTEXTO DO CRIADOR (análise personalizada)
- Nicho: {niche}
- Público-alvo: {target_audience}
- Estilo: {content_style}
- Plataformas: {platforms}
- Média de views: {average_views}
- Objetivo: {goals}
- Tom de voz: {tone_of_voice}

Avalie o vídeo considerando SE ele é adequado para ESTE perfil específico.
Compare com benchmarks DO NICHO do criador. Recomendações devem ser
direcionadas ao público-alvo e estilo declarados.
```

## Arquivos alterados/criados


| Arquivo                                     | Ação                                   |
| ------------------------------------------- | -------------------------------------- |
| Migration SQL                               | Nova tabela `creator_profiles`         |
| `src/hooks/useCreatorProfile.ts`            | Novo hook                              |
| `src/pages/Perfil.tsx`                      | Nova tab "Criador" com formulário      |
| `src/pages/AnalisadorViral.tsx`             | Toggle de análise personalizada        |
| `supabase/functions/analyze-viral/index.ts` | Injetar contexto do perfil nos prompts |


## Fluxo do usuário

```text
Perfil → Tab "Criador" → Preenche nicho, público, estilo...
                ↓
Analisador Viral → Toggle "Análise personalizada" ON
                ↓
Edge Function recebe creatorProfile → injeta nos prompts
                ↓
Análise retornada é específica para o perfil do criador
```