

## Plano: Persistir ideias + corrigir scrollbar da sidebar

### Problema 1: Ideias somem ao recarregar

A causa raiz: o `useState` initializer roda **uma única vez** no primeiro render, quando `user` ainda é `null` (auth é assíncrono). Resultado: estado inicializa como `[]`. Em seguida, o `useEffect` (linha 110-112) escreve `[]` no localStorage, apagando os dados salvos.

**Solução**: Carregar ideias/scripts do localStorage em um `useEffect` que depende de `user`, em vez de no initializer do `useState`. Remover a lógica de cleanup v1 que já cumpriu seu papel.

### Problema 2: Scrollbar branca na sidebar

O `overflow-y-auto` no `DesktopSidebar` usa a scrollbar nativa do navegador, que em alguns dispositivos/OS aparece branca e fora do tema.

**Solução**: Adicionar classes CSS customizadas de scrollbar (webkit + Firefox) no `index.css` e aplicar na sidebar.

---

### Arquivos a editar

| Arquivo | Mudança |
|---|---|
| `src/pages/Conteudo.tsx` | Inicializar estados como `[]`/`{}`, carregar de localStorage via `useEffect` quando `user` estiver disponível. Evitar que o effect de persistência sobrescreva com `[]` antes do carregamento. |
| `src/index.css` | Adicionar classes utilitárias de scrollbar customizada (thin, cor do tema) |
| `src/components/ui/animated-sidebar.tsx` | Adicionar classe de scrollbar customizada no `DesktopSidebar` |

