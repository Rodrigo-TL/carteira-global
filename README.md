# carteira-global
Conversor de moedas e controle de gastos - Atividade Projeto prático JS - Grupo 4

## Parte visual
A interface foi pensada para ser limpa, moderna e responsiva, oferecendo uma boa experiência tanto em desktop quanto em dispositivos móveis.

### Destaques do design
- Layout centralizado com cards sobre um fundo visual elegante.
- Formulário de cadastro de gastos com campos organizados e visual intuitivo.
- Painel de cotações com destaque para os valores em dólar, euro e bitcoin.
- Botões de conversão com estilo consistente e fácil de identificar.
- Adaptabilidade para telas menores, com espaçamento, tamanho de elementos e disposição ajustados para uso em celulares.

### Experiência do usuário
A página prioriza legibilidade, acessibilidade visual e navegação simples, permitindo que o usuário adicione gastos e visualize rapidamente os valores convertidos sem perder clareza no conteúdo.

## Formulário de Gastos e LocalStorage 

criar o formulário de cadastro de despesas, fazer os dados ficarem salvos no navegador para não sumirem ao atualizar a página (LocalStorage) e criar os filtros da tabela.

### O que foi feito

- Formulário de Cadastro: Criado os campos onde o usuário digita a descrição do gasto, o valor, escolhe a categoria (Alimentação, Transporte, Lazer, Moradia, Outros) e seleciona a moeda original.
- Salvamento Automático (LocalStorage): Feita a lógica para pegar tudo o que foi digitado, transformar em JSON e salvar direto no navegador. Se fechar a página e abrir de novo, os gastos continuam lá.
- Listagem e Exclusão: Montada a tabela que mostra os gastos cadastrados com um botão "Excluir" do lado. Se clicar em excluir, o item some da lista e o total da carteira diminui na hora.
- Filtro por Categoria: Colocado um menu em cima da tabela para o usuário escolher ver só os gastos de uma categoria específica (ex: só o que gastou com Alimentação).
- Painel de Estatísticas: Criado quadradinhos que somam sozinhos o total acumulado que foi gasto em cada categoria separadamente.

### Como funciona no código:

1. Quando a página carrega, a função `renderizarGastos()` vai no `localStorage.getItem` buscar o que já estava salvo e desenha as linhas da tabela.
2. Quando o usuário clica em "Inserir Gasto", o código calcula a conversão para Real (usando as cotações que a API do grupo puxou) e dá um `listaGastos.push()` para salvar o objeto.
3. Depois de salvar, a tabela limpa e se redesenha com os valores e as estatísticas atualizadas.

