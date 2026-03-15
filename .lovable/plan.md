

# Plano: Histórico + UX/UI do Analisador Viral

## Contexto

O Analisador Viral já salva na tabela `user_history` (tipo `analise`), mas não exibe o histórico na página. Os cards de Hook/Corpo/CTA estão visualmente densos e usam termos técnicos que confundem o público leigo.

---

## Parte 1: Histórico de Análises

**O que muda:** Adicionar uma seção de histórico abaixo do formulário de upload, com um botão "Ver Histórico" que expande/colapsa a lista. Ao clicar em um item, carrega a análise salva no mesmo layout de resultados (sem pop-up, como o usuário pediu).

- Carregar do `user_history` onde `tipo = 'analise'` e `user_id` do usuário logado
- Exibir lista com título, data e nota geral
- Ao clicar, popular o estado `analysis` com o payload salvo (reusa toda a UI de resultados existente)
- Botão discreto com ícone de histórico (Clock) ao lado do botão "Analisar"

## Parte 2: UX/UI dos Cards Hook / Corpo / CTA

**Problemas identificados na screenshot:**
- Texto muito denso, sem espaçamento
- Bold renderizado inline quebrando o fluxo visual
- Dicas (tips) ficam grudadas no feedback
- Termos como "Blueprint de Execução" são técnicos demais

**Mudanças:**

1. **Renomear seções** para linguagem simples:
   - "Blueprint de Execução" → "Roteiro Otimizado"
   - "Hook Exato (Primeiros 3s)" → "Abertura Ideal"
   - "Estrutura de Cortes (Pacing)" → "Ritmo do Vídeo"
   - "CTA Exato (Final)" → "Encerramento Ideal"
   - "Legendas Otimizadas" → "Sugestões de Legenda"
   - Manter "Hook (Início)", "Corpo (Desenvolvimento)", "CTA (Final)" nos cards mas com subtítulos mais amigáveis

2. **Layout dos cards Hook/Corpo/CTA:**
   - Separar feedback e dicas com um divisor visual (`<hr>` ou `border-t`)
   - Aumentar padding interno (`p-5` → `p-6`)
   - Feedback como parágrafos com `space-y-3` em vez de lista colada
   - Dicas em cards individuais com fundo `bg-secondary/30` e padding, em vez de texto inline
   - Limitar feedback visível com "Ver mais" se ultrapassar ~3 bullets

3. **Cards de Retenção e Pontos Fortes/Fracos:**
   - Manter layout atual (já está ok), apenas ajustar spacing

## Arquivos alterados

- `src/pages/AnalisadorViral.tsx` — histórico + redesign dos cards de resultado

