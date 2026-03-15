

# Plano: Limpar navegação

## Mudanças

### 1. Sidebar (`src/components/AppSidebar.tsx`)
- **Remover** "Análise de Roteiro" (linhas 19-23)
- **Remover** "Histórico" (linhas 49-53)
- **Mover** "Modelos" para o final da lista (depois de Affiliate Hub)

Ordem final: Criar Vídeo → Analisador Viral → Modelar Post → Chat IA → Meus Vídeos → Affiliate Hub → Modelos

### 2. Rotas (`src/App.tsx`)
- Remover import e rota de `AnaliseRoteiro` (`/analise`)
- Remover import e rota de `Historico` (`/historico`)
- Manter os arquivos `AnaliseRoteiro.tsx` e `Historico.tsx` (não deletar, apenas desconectar)

### 3. Imports
- Remover `FileSearch` e `Clock` dos imports do sidebar (não mais usados)

