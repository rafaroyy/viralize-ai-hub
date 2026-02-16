

# Plano: Corrigir Tela Preta no Mobile

## Problema Raiz

O `AppLayout` usa `display: flex` com direcao padrao **row** (horizontal). No mobile, o `MobileSidebar` renderiza uma barra topo com `w-full` (largura 100%). Como estao lado a lado horizontalmente, a sidebar ocupa toda a largura e empurra o conteudo principal (`main`) para fora da tela -- resultando na tela preta.

```text
Desktop (funciona):
[Sidebar 60-260px] [Main Content flex-1]

Mobile (quebrado - flex row):
[MobileSidebar w-full] [Main ... fora da tela]
```

## Solucao

Alterar o `AppLayout` para usar `flex-col md:flex-row`, fazendo com que no mobile a barra da sidebar fique **acima** do conteudo, e no desktop continue lado a lado.

```text
Mobile (corrigido - flex col):
[MobileSidebar w-full - barra topo]
[Main Content - abaixo]
```

## Detalhes Tecnicos

### Arquivo: `src/components/AppLayout.tsx`

Unica alteracao necessaria:
- Trocar `flex` por `flex flex-col md:flex-row` no container principal
- Isso faz a sidebar e o main empilharem verticalmente no mobile

### Resultado Esperado
- No mobile: barra do menu hamburger no topo, conteudo da pagina abaixo, tudo visivel e scrollavel
- No desktop: sem nenhuma mudanca, sidebar lateral como antes

