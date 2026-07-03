const campoUsd = document.getElementById("valor-usd");
const campoEur = document.getElementById("valor-eur");
const campoBtc = document.getElementById("valor-btc");
const statusCotacao = document.getElementById("status-cotacao");
const botaoAtualizar = document.getElementById("btn-atualizar-cotacoes");

let cotacaoDolar = null;

function setLoadingState(isLoading) {
    const camposCotacao = document.querySelectorAll(".valor-cotacao");
    const botoesCotacao = document.querySelectorAll("#cotacao button");
    const secaoCotacao = document.getElementById("cotacao");

    if (isLoading) {
        botaoAtualizar.textContent = "Atualizando...";
    } else {
        botaoAtualizar.textContent = "Atualizar";
    }

    camposCotacao.forEach(function(campo) {
        campo.classList.toggle("loading", isLoading);
        if (isLoading) {
            campo.value = "";
        }
        campo.readOnly = isLoading;
    });

    botoesCotacao.forEach(function(botao) {
        botao.disabled = isLoading;
    });

    secaoCotacao.classList.remove("loaded");

    if (isLoading) {
        statusCotacao.classList.remove("success");
        statusCotacao.innerHTML = '<span class="spinner"></span><span>Buscando cotações...</span>';
    } else {
        exibirEstadoSucesso();
    }
}

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

function carregarCotacoes() {
    setLoadingState(true);

    fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL")
        .then(function(resposta) {
            return resposta.json();
        })
        .then(function(dados){
            document.getElementById("valor-usd").value = dados.USDBRL.bid
            document.getElementById("valor-eur").value = dados.EURBRL.bid
            document.getElementById("valor-btc").value = dados.BTCBRL.bid
           
        })
            
        
        .catch(function() {
            setLoadingState(false);
            alert("Erro ao buscar cotação.");
        })

//Buscando a cotação
let cotacaoDolar;
    fetch(`https://economia.awesomeapi.com.br/json/last/USD-BRL`)
        .then(function(resposta){
            return resposta.json();
        })
        .then(function(dados){
            cotacaoDolar = Number(dados.USDBRL.bid);
            document.getElementById("valor-usd").innerText = cotacaoDolar;
        })

        .catch(function(){
            alert("Erro ao buscar cotação");
        });
//Criando a funcionalidade do botão de converter o valor em dolar
function dolar(){
    let total =
        document.getElementById("total").value;

    let resultado =
        Number(total) / cotacaoDolar;

    document.getElementById("resultado").innerText =
        resultado.toLocaleString("en-US", {
            style: "currency", 
            currency: "USD"
        });
}

function euro(){
    let total =
        document.getElementById("total").value;

    let resultado =
        Number(total) / cotacaoEuro;

    document.getElementById("resultado").innerText =
        resultado.toLocaleString("de-DE", {
            style: "currency", 
            currency: "EUR"
        });
}

function bitcoin(){
    let total =
        document.getElementById("total").value;

    let resultado =
        Number(total) / cotacaoBitcoin;

    document.getElementById("resultado").innerText =
        resultado.toFixed(2);
}


// Captura o envio do formulário de novos gastos
document.getElementById("form-gasto").addEventListener("submit", function(event) {
    event.preventDefault();

    // Obtém os dados inseridos pelo usuário
    const descricao = document.getElementById("descricao").value;
    const valorOriginal = parseFloat(document.getElementById("valor-original").value);
    const moedaSelecionada = document.getElementById("moeda-gasto").value;
    
    let valorConvertidoBRL = valorOriginal;

    // Converte o valor para Real usando as cotações carregadas na tela pela API
    if (moedaSelecionada === "USD") {
        const cotacaoUSD = parseFloat(document.getElementById("valor-usd").value);
        valorConvertidoBRL = valorOriginal * cotacaoUSD;
    } else if (moedaSelecionada === "EUR") {
        const cotacaoEUR = parseFloat(document.getElementById("valor-eur").value);
        valorConvertidoBRL = valorOriginal * cotacaoEUR;
    } else if (moedaSelecionada === "BTC") {
        const cotacaoBTC = parseFloat(document.getElementById("valor-btc").value);
        valorConvertidoBRL = valorOriginal * cotacaoBTC;
    }

    // Soma o novo valor convertido ao total acumulado no campo de gastos
    let campoTotal = document.getElementById("total");
    let totalAtual = parseFloat(campoTotal.value) || 0;
    let novoTotal = totalAtual + valorConvertidoBRL;

    // Atualiza o valor exibido na tela e limpa o formulário
    campoTotal.value = novoTotal.toFixed(2);
    document.getElementById("form-gasto").reset();
    
    alert(`Gasto de R$ ${valorConvertidoBRL.toFixed(2)} adicionado ao total!`);
});
