

# Plano: Expandir a Base de Conhecimento do Agente de Análise Viral

## Resumo

Expandir o arquivo `knowledge_base.ts` com novas seções de frameworks/metodologias e exemplos de vídeos virais, e atualizar os prompts do `analyze-viral` para consumir esse contexto adicional.

## Arquitetura Atual

O agente usa um pipeline de 2 etapas:
1. **Gemini** (extração visual + análise bruta) — recebe `SYSTEM_PROMPT_BASE` que já inclui `FRAMEWORK_ROTEIROS` + `DIRETRIZES_CRIATIVAS`
2. **OpenAI** (refinamento estratégico) — recebe `FRAMEWORK_ROTEIROS` + `DIRETRIZES_CRIATIVAS` diretamente

A base de conhecimento está em `supabase/functions/_shared/knowledge_base.ts` com ~130 linhas.

## Mudanças Planejadas

### 1. Expandir `knowledge_base.ts` com novas seções

Adicionar 4 novos exports com estrutura pronta para preenchimento:

- **`FRAMEWORK_RETENCAO`** — Técnicas avançadas de retenção (pattern interrupt, open loops, visual pacing, micro-hooks a cada 3-5s, regra dos 3 segundos)
- **`FRAMEWORK_PLATAFORMAS`** — Particularidades por plataforma (TikTok, Reels, Shorts) como duração ideal, aspect ratio, algoritmo
- **`EXEMPLOS_VIRAIS`** — 3-5 case studies estruturados no formato: contexto, hook usado, estrutura P-C-R aplicada, por que viralizou, métricas estimadas
- **`BENCHMARKS_NICHO`** — Referências de performance por nicho (marketing digital, finanças, lifestyle etc.)

Cada seção terá conteúdo inicial útil (não vazio) que você poderá editar/expandir depois.

### 2. Atualizar `SYSTEM_PROMPT_BASE`

Incorporar as novas seções no system prompt base para que ambos os agentes (Gemini e OpenAI) tenham acesso ao contexto expandido.

### 3. Atualizar prompts do `analyze-viral/index.ts`

- Instruir o Gemini a comparar o vídeo analisado com os exemplos virais de referência
- Instruir o OpenAI a usar os benchmarks e frameworks de retenção na avaliação estratégica

### Detalhes Técnicos

- Limite de tokens: os system prompts ficarão maiores, mas o Gemini 2.5 Flash suporta 1M tokens e o GPT-5.4 suporta contextos grandes — sem risco
- Todas as mudanças são em 2 arquivos: `knowledge_base.ts` e `analyze-viral/index.ts`
- O cache existente continuará funcionando normalmente (análises antigas não serão afetadas)

