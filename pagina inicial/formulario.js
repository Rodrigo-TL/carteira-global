// Seleção dos elementos para exibição dos valores das cotações
const campoUsd = document.getElementById("valor-usd");
const campoEur = document.getElementById("valor-eur");
const campoBtc = document.getElementById("valor-btc");
const statusCotacao = document.getElementById("status-cotacao");
const botaoAtualizar = document.getElementById("btn-atualizar-cotacoes");

// Objeto global que armazena os valores numéricos das cotações obtidas pela API
let cotacoes = {
    USD: null,
    EUR: null,
    BTC: null
};

// Controla visualmente o estado de carregamento da tela durante a busca das cotações
function setLoadingState(isLoading) {
    const camposCotacao = document.querySelectorAll(".valor-cotacao");
    const botoesCotacao = document.querySelectorAll("#cotacao button");
    const secaoCotacao = document.getElementById("cotacao");

    // Altera o texto do botão de atualização conforme o status
    if (isLoading) {
        botaoAtualizar.textContent = "Atualizando...";
    } else {
        botaoAtualizar.textContent = "Atualizar";
    }

    // Ativa ou desativa o estilo visual de carregamento nos inputs de cotação
    camposCotacao.forEach(function(campo) {
        campo.classList.toggle("loading", isLoading);
        if (isLoading) {
            campo.value = ""; // Limpa os valores enquanto busca
        }
        campo.readOnly = isLoading; // Bloqueia a edição durante a busca
    });

    // Desabilita temporariamente os botões de conversão enquanto carrega as taxas
    botoesCotacao.forEach(function(botao) {
        botao.disabled = isLoading;
    });

    secaoCotacao.classList.remove("loaded");

    // Atualiza a barra de status com o ícone de spinner animado ou com a mensagem de sucesso
    if (isLoading) {
        statusCotacao.classList.remove("success");
        statusCotacao.innerHTML = '<span class="spinner"></span><span>Buscando cotações...</span>';
    } else {
        exibirEstadoSucesso();
    }
}

// Aplica as classes e estilos visuais de sucesso assim que a API responde corretamente
function exibirEstadoSucesso() {
    botaoAtualizar.textContent = "Atualizar";
    statusCotacao.classList.add("success");
    statusCotacao.innerHTML = '<span class="spinner" style="display: none;"></span><span>Cotações atualizadas</span>';

    document.getElementById("cotacao").classList.add("loaded");

    document.querySelectorAll(".valor-cotacao").forEach(function(campo) {
        campo.classList.remove("loading");
        campo.readOnly = false;
    });
}

// Realiza a requisição assíncrona (Fetch API) para buscar as cotações monetárias atualizadas
function carregarCotacoes() {
    setLoadingState(true); // Ativa o feedback visual de carregamento

    fetch("https://awesomeapi.com.br")
        .then(function(resposta) {
            if (!resposta.ok) {
                throw new Error("Erro ao buscar cotação");
            }
            return resposta.json();
        })
        .then(function(dados) {
            // Guarda os valores estritamente em formato numérico no objeto global
            cotacoes.USD = Number(dados.USDBRL.bid);
            cotacoes.EUR = Number(dados.EURBRL.bid);
            cotacoes.BTC = Number(dados.BTCBRL.bid);

            // Alimenta os inputs da tela formatando as casas decimais das moedas
            campoUsd.value = cotacoes.USD.toFixed(2);
            campoEur.value = cotacoes.EUR.toFixed(2);
            campoBtc.value = cotacoes.BTC.toFixed(2);
            setLoadingState(false); // Remove o estado de carregamento
        })
        .catch(function() {
            setLoadingState(false);
            alert("Erro ao buscar cotação.");
        });
}

// Função genérica de conversão: divide o total em R$ pela taxa da moeda selecionada
function converterParaMoeda(chaveCotacao, locale, currency) {
    const total = Number(document.getElementById("total").value);
    const resultadoElemento = document.getElementById("resultado");

    // Valida se o valor total acumulado inserido no input é numérico e maior que zero
    if (!Number.isFinite(total) || total <= 0) {
        resultadoElemento.textContent = "Informe um valor válido";
        return;
    }

    const cotacao = cotacoes[chaveCotacao];

    // Verifica se os valores da API já foram carregados com sucesso
    if (!cotacao) {
        resultadoElemento.textContent = "Cotação indisponível";
        return;
    }

    const resultado = total / cotacao;

    // Formata a exibição do texto final com a sigla ou com o símbolo monetário padrão
    if (chaveCotacao === "BTC") {
        resultadoElemento.textContent = `${resultado.toFixed(2)} BTC`;
    } else {
        resultadoElemento.textContent = resultado.toLocaleString(locale, {
            style: "currency",
            currency: currency
        });
    }
}

// Gatilhos de clique que direcionam a moeda e as regras de formatação locais para a conversão
function dolar() {
    converterParaMoeda("USD", "en-US", "USD");
}

function euro() {
    converterParaMoeda("EUR", "de-DE", "EUR");
}

function bitcoin() {
    converterParaMoeda("BTC", "en-US", "BTC");
}

// Vincula o evento de clique do botão "Atualizar" para refazer a requisição da API
botaoAtualizar.addEventListener("click", carregarCotacoes);


// --- LOCALSTORAGE, FILTRO E ESTATÍSTICAS POR CATEGORIA ---

// FUNÇÃO DE CARREGAR: Resgata a string do localStorage, converte de volta para array ou inicia vazia
let listaGastos = JSON.parse(localStorage.getItem("gastos_carteira")) || [];

// FUNÇÃO DE RENDERIZAR: Filtra e percorre os elementos, calcula estatísticas e monta a tabela histórica
function renderizarGastos() {
    const tabelaCorpo = document.getElementById("tabela-gastos-corpo");
    const filtroSelecionado = document.getElementById("filtro-categoria").value;
    tabelaCorpo.innerHTML = ""; // Limpa a tabela antes de redesenhar para evitar duplicações

    let totalGeralBRL = 0; // Acumulador do total filtrado em exibição

    // Objeto temporário para calcular o total absoluto de gastos acumulados por categoria
    let acumuladorCategorias = {
        "Alimentação": 0,
        "Transporte": 0,
        "Lazer": 0,
        "Moradia": 0,
        "Outros": 0
    };

    // Mapeia a lista original para alimentar as estatísticas globais e estruturar as linhas da tabela
    listaGastos.forEach(function(gasto, index) {
        const valorBRL = parseFloat(gasto.valorBRL);
        const cat = gasto.categoria || "Outros";

        // Soma ao total da categoria correspondente (Estatística estrutural)
        if (acumuladorCategorias.hasOwnProperty(cat)) {
            acumuladorCategorias[cat] += valorBRL;
        } else {
            acumuladorCategorias["Outros"] += valorBRL;
        }
        
        // Se houver um filtro ativo diferente de "Todos", oculta as linhas que não batem com a seleção
        if (filtroSelecionado !== "Todos" && cat !== filtroSelecionado) {
            return;
        }

        totalGeralBRL += valorBRL;

        const linha = document.createElement("tr");
        linha.style.borderBottom = "1px solid #eee";
        linha.innerHTML = `
            <td style="padding: 8px;">${gasto.descricao}</td>
            <td style="padding: 8px;"><span style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px; font-size: 0.85em;">${cat}</span></td>
            <td style="padding: 8px;">${parseFloat(gasto.valorOriginal).toFixed(2)}</td>
            <td style="padding: 8px;">${gasto.moeda}</td>
            <td style="padding: 8px;">R$ ${valorBRL.toFixed(2)}</td>
            <td style="padding: 8px;">
                <button type="button" onclick="excluirGasto(${index})" style="background:#dc3545; color:white; border:none; padding:4px 8px; cursor:pointer; border-radius:3px;">Excluir</button>
            </td>
        `;
        tabelaCorpo.appendChild(linha);
    });

    // Injeta os valores calculados diretamente nos blocos visuais de estatísticas na tela
    document.getElementById("estat-alimentacao").textContent = acumuladorCategorias["Alimentação"].toFixed(2);
    document.getElementById("estat-transporte").textContent = acumuladorCategorias["Transporte"].toFixed(2);
    document.getElementById("estat-lazer").textContent = acumuladorCategorias["Lazer"].toFixed(2);
    document.getElementById("estat-moradia").textContent = acumuladorCategorias["Moradia"].toFixed(2);
    document.getElementById("estat-outros").textContent = acumuladorCategorias["Outros"].toFixed(2);

    // Sincroniza dinamicamente o valor total acumulado no campo de texto principal em Reais
    document.getElementById("total").value = totalGeralBRL.toFixed(2);
}

// FUNÇÃO DE EXCLUIR: Deleta o item selecionado da lista, atualiza o localStorage e limpa a interface gráfica
function excluirGasto(index) {
    if (confirm("Tem certeza que deseja remover este gasto?")) {
        listaGastos.splice(index, 1); // Remove tecnicamente o objeto da posição informada
        
        // SALVA: Guarda a lista com o item reduzido de volta no armazenamento local do navegador
        localStorage.setItem("gastos_carteira", JSON.stringify(listaGastos));
        
        renderizarGastos(); // Redesenha a interface atualizando a tabela, estatísticas e totais
    }
}

// Ouvinte de evento para escutar as mudanças do select de filtro e redesenhar a tabela dinamicamente
document.getElementById("filtro-categoria").addEventListener("change", renderizarGastos);

// Captura e valida o envio de novos dados no formulário, realizando a conversão e o armazenamento
document.getElementById("form-gasto").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário que recarregaria a página

    const descricao = document.getElementById("descricao").value;
    const categoria = document.getElementById("categoria-gasto").value;
    const valorOriginal = parseFloat(document.getElementById("valor-original").value);
