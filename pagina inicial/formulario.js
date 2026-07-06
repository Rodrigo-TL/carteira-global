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

// Vincula o evento de clique do botão "Atualizar" para refazer a requisição da API
botaoAtualizar.addEventListener("click", carregarCotacoes);
window.addEventListener("DOMContentLoaded", carregarCotacoes);

// --- LOCALSTORAGE, FILTRO E ESTATÍSTICAS POR CATEGORIA ---
let listaGastos = JSON.parse(localStorage.getItem("gastos_carteira")) || [];

function renderizarGastos() {
    const tabelaCorpo = document.getElementById("tabela-gastos-corpo");
    const filtroSelecionado = document.getElementById("filtro-categoria").value;
    tabelaCorpo.innerHTML = "";

    let totalGeralBRL = 0;
    let acumuladorCategorias = {
        "Alimentação": 0,
        "Transporte": 0,
        "Lazer": 0,
        "Moradia": 0,
        "Outros": 0
    };

    listaGastos.forEach(function(gasto, index) {
        const valorBRL = parseFloat(gasto.valorBRL);
        const cat = gasto.categoria || "Outros";

        if (acumuladorCategorias.hasOwnProperty(cat)) {
            acumuladorCategorias[cat] += valorBRL;
        } else {
            acumuladorCategorias["Outros"] += valorBRL;
        }
       
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

    document.getElementById("estat-alimentacao").textContent = acumuladorCategorias["Alimentação"].toFixed(2);
    document.getElementById("estat-transporte").textContent = acumuladorCategorias["Transporte"].toFixed(2);
    document.getElementById("estat-lazer").textContent = acumuladorCategorias["Lazer"].toFixed(2);
    document.getElementById("estat-moradia").textContent = acumuladorCategorias["Moradia"].toFixed(2);
    document.getElementById("estat-outros").textContent = acumuladorCategorias["Outros"].toFixed(2);
}

document.getElementById("filtro-categoria").addEventListener("change", renderizarGastos);
window.addEventListener("DOMContentLoaded", renderizarGastos);
