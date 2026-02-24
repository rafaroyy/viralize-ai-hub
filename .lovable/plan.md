
# Guia de Fluxo "Buscar Inspiracao + SnapTik + Upload"

## Objetivo
Criar um fluxo educativo dentro do app que guie o usuario passo a passo para maximizar a taxa de viralizacao usando videos reais do TikTok como base.

## O que sera feito

### 1. Banner/Card educativo na secao "Fonte dos Videos" (modo Assistente IA)
Quando o usuario selecionar "Videos personalizados (Upload)", exibir um card com um mini-tutorial de 3 passos:

- **Passo 1** - Busque inspiracao no TikTok usando a palavra-chave acima
- **Passo 2** - Copie o link do video e use o SnapTik (snaptik.app) para baixar sem marca d'agua
- **Passo 3** - Faca upload dos videos aqui para criar seu video personalizado

O card tera visual destacado (borda primary, icones numerados) e um botao direto para abrir o SnapTik.

### 2. Mesmo banner no modo Script Manual
Na secao "Videos Personalizados" do modo manual, exibir o mesmo card educativo adaptado.

### 3. Tooltip/dica no botao "Buscar inspiracao"
Expandir a dica que ja aparece ao digitar a palavra-chave, adicionando menção ao SnapTik:
> "Encontre videos virais, baixe sem marca d'agua pelo SnapTik e use aqui!"

### 4. Botao direto para SnapTik
Adicionar um botao secundario "Remover marca d'agua (SnapTik)" ao lado ou abaixo do botao "Buscar inspiracao", que abre `https://snaptik.app` em nova aba.

---

## Detalhes tecnicos

### Arquivo modificado
- `src/pages/CriarVideo.tsx`

### Componente novo (inline)
Um componente `InspirationGuide` sera criado dentro do arquivo com os 3 passos, usando os mesmos padroes visuais existentes (`glass-card`, `gradient-primary`, icones Lucide). Inclui:
- Icones numerados (1, 2, 3) com estilo `gradient-primary`
- Texto curto e direto para cada passo
- Botao "Abrir SnapTik" que abre `https://snaptik.app` em nova aba
- Botao "Buscar no TikTok" (reusa a logica do keyword existente)
- Animacao com `framer-motion` (fade-in) consistente com o resto da pagina

### Onde sera inserido
1. **Modo Assistente**: Dentro da secao de upload que aparece quando `videoSource === "custom"` (linhas ~832-870), logo apos o paragrafo explicativo
2. **Modo Manual**: Dentro da secao "Videos Personalizados" (linhas ~564-617), logo apos o paragrafo explicativo
3. **Botao SnapTik**: Abaixo do botao "Buscar inspiracao" existente (linha ~713-727)

### Dica expandida na palavra-chave
A dica animada existente (linhas 702-710) sera atualizada para mencionar o fluxo completo.
