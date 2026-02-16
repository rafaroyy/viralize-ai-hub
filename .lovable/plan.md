

# Plano: Melhorar Responsividade Mobile

## Problemas Identificados

1. **Painel de Preview fixo (380px)** nas telas de Criar Video (modo Assistente e Manual) - nao aparece nem funciona no mobile pois usa `w-[380px]` fixo sem breakpoint responsivo
2. **Padding excessivo (`p-8`)** em todas as paginas internas (CriarVideo, AnaliseRoteiro, Modelos, etc) - muito espaco desperdicado no mobile
3. **Titulos grandes demais** (`text-3xl`) no mobile sem reducao responsiva
4. **UserBadge no header** quebra o layout em telas pequenas
5. **Preview panel do modo Assistente e Manual** precisa virar um componente colapsavel ou drawer no mobile em vez de coluna lateral fixa

## Solucao

### 1. Preview Panel - Desktop vs Mobile
- No desktop (md+): manter o painel lateral de 380px como esta
- No mobile: esconder o painel lateral e adicionar um botao flutuante "Preview" que abre um Drawer (bottom sheet) com o conteudo do preview
- Usar a classe `hidden md:flex` no painel lateral e renderizar o Drawer apenas em telas pequenas

### 2. Padding Responsivo em Todas as Paginas
- Trocar `p-8` por `p-4 md:p-8` em:
  - CriarVideo.tsx (todos os 3 modos: choose, manual, assisted)
  - AnaliseRoteiro.tsx
  - Modelos.tsx
  - ChatIA.tsx

### 3. Tipografia Responsiva
- Titulos: `text-2xl md:text-3xl` em vez de `text-3xl`
- Subtitulos ajustados proporcionalmente

### 4. UserBadge Responsivo
- Esconder o nome/detalhes no mobile, mostrar so o avatar
- Ou mover para baixo do titulo em vez de `justify-between`

### 5. Cards e Grids
- `glass-card p-4 md:p-6` em vez de `p-6`
- Grids de upload: garantir `grid-cols-2` no mobile

### 6. Header do Chat IA
- Ja funciona bem, apenas ajustar padding

---

## Detalhes Tecnicos

### Arquivos a Modificar

**src/pages/CriarVideo.tsx** (maior impacto):
- Modo "choose": `p-4 md:p-8`, titulo responsivo, UserBadge stack no mobile
- Modo "manual": `p-4 md:p-8`, esconder painel lateral no mobile, adicionar botao preview + Drawer
- Modo "assisted": `p-4 md:p-8`, esconder painel lateral no mobile, adicionar botao preview + Drawer
- `ManualPreview` e o painel do assisted: `hidden md:flex` + Drawer mobile

**src/pages/AnaliseRoteiro.tsx**:
- `p-4 md:p-8`
- Titulo `text-2xl md:text-3xl`
- Dialog de resultado: `max-h-[90vh]` no mobile

**src/pages/Modelos.tsx**:
- `p-4 md:p-8`
- Titulo responsivo

**src/pages/ChatIA.tsx**:
- Padding do input area e header ja estao ok
- Ajustar `max-w-[75%]` para `max-w-[85%] md:max-w-[75%]` nas mensagens

**src/pages/LandingPage.tsx**:
- Ajustes menores de overflow e espacamento

### Componente de Preview Mobile (Drawer)
- Usar o componente Drawer (vaul) ja instalado no projeto
- Botao flutuante fixo no canto inferior direito com icone de Play/Eye
- Ao clicar, abre o Drawer com o conteudo do preview (mesmo componente, apenas reposicionado)

