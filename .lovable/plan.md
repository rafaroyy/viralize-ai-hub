
# Refazer o Test Drive com o fluxo real da Viralize

## Problema atual
O Test Drive mostra um fluxo ficticio ("Framework HDC", "Frames", "Variacoes de hook") que nao existe na Viralize. O app real funciona de forma diferente.

## Fluxo real da Viralize (que sera mockado)

A Viralize tem 3 ferramentas principais:
1. **Criar Video** - Escolhe modo (Assistente IA ou Script Manual), configura tema/nicho/objetivo/duracao, e a IA gera o video completo
2. **Analise de Roteiro** - Cola um roteiro, a IA avalia com metodologia P-C-R (Pergunta, Conflito, Resposta) e da scores
3. **Chat IA** - Chat com especialista em videos virais

## Novo Test Drive - 4 Steps

Mantendo a estrutura visual atual (browser mockup, tabs numeradas, animacoes), os steps serao:

### Step 1 - "Escolher Modo"
Mock da tela de escolha entre "Assistente IA" e "Script Manual" (dois cards identicos ao app real). O usuario clica em "Assistente IA" para avancar.

### Step 2 - "Configurar"
Mock do formulario do Assistente IA com os campos reais preenchidos:
- Nicho: "Casal / Relacionamento"
- Objetivo: "Venda com link no perfil"
- Tema: "Date criativo com jogo de casal"
- Duracao: Slider mockado mostrando "24s · 3 cenas"
- Fonte de video: "Sora (IA)" selecionado
- Estilo de legenda: "Karaoke"
- Botao "Gerar Video"

### Step 3 - "Processando"
Mock do modal de processamento com:
- Icone animado (spinning)
- Barra de progresso animada que vai ate 100%
- Mensagem "Gerando roteiro... Renderizando cenas..."
- Transicao automatica ou por clique para o proximo step

### Step 4 - "Video Pronto"
Mock da tela de sucesso:
- Icone de check verde
- "Video Pronto!" com botao "Baixar Video" (nao funcional)
- Botoes "Recomecar" e CTA "Quero criar o meu" (leva ao /login)

## Detalhes tecnicos

### Arquivo modificado
- `src/pages/LandingPage.tsx` - apenas a funcao `TourSection`

### Mudancas
- Atualizar os labels dos tabs: "Escolher Modo", "Configurar", "Processando", "Pronto!"
- Reescrever o conteudo de cada step com dados mockados que refletem o app real
- Adicionar animacao na barra de progresso do step 3 (usando `useEffect` + `setInterval` para incrementar o valor)
- Manter todas as animacoes existentes (framer-motion, AnimatePresence)
- Manter a estrutura do browser mockup (title bar com bolinhas, url bar)
- Usar os mesmos icones que o app real usa (Wand2, PenLine, Video, Loader2, CheckCircle, Download)
- O step de processamento tera uma barra de progresso que anima automaticamente de 0 a 100% em ~3 segundos
