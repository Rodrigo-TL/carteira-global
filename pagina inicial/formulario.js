const campoUsd = document.getElementById("valor-usd");
const campoEur = document.getElementById("valor-eur");
const campoBtc = document.getElementById("valor-btc");
const statusCotacao = document.getElementById("status-cotacao");
const botaoAtualizar = document.getElementById("btn-atualizar-cotacoes");

let cotacoes = {
    USD: null,
    EUR: null,
    BTC: null
};

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
            if (!resposta.ok) {
                throw new Error("Erro ao buscar cotação");
            }
            return resposta.json();
        })
        .then(function(dados) {
            cotacoes.USD = Number(dados.USDBRL.bid);
            cotacoes.EUR = Number(dados.EURBRL.bid);
            cotacoes.BTC = Number(dados.BTCBRL.bid);

            campoUsd.value = cotacoes.USD.toFixed(2);
            campoEur.value = cotacoes.EUR.toFixed(2);
            campoBtc.value = cotacoes.BTC.toFixed(2);
            setLoadingState(false);
        })
        .catch(function() {
            setLoadingState(false);
            alert("Erro ao buscar cotação.");
        });
}

function converterParaMoeda(chaveCotacao, locale, currency) {
    const total = Number(document.getElementById("total").value);
    const resultadoElemento = document.getElementById("resultado");

    if (!Number.isFinite(total) || total <= 0) {
        resultadoElemento.textContent = "Informe um valor válido";
        return;
    }

    const cotacao = cotacoes[chaveCotacao];

    if (!cotacao) {
        resultadoElemento.textContent = "Cotação indisponível";
        return;
    }

    const resultado = total / cotacao;

    if (chaveCotacao === "BTC") {
        resultadoElemento.textContent = `${resultado.toFixed(2)} BTC`;
    } else {
        resultadoElemento.textContent = resultado.toLocaleString(locale, {
            style: "currency",
            currency: currency
        });
    }
}

function dolar() {
    converterParaMoeda("USD", "en-US", "USD");
}

function euro() {
    converterParaMoeda("EUR", "de-DE", "EUR");
}

function bitcoin() {
    converterParaMoeda("BTC", "en-US", "BTC");
}

botaoAtualizar.addEventListener("click", carregarCotacoes);

// Captura o envio do formulário de novos gastos
document.getElementById("form-gasto").addEventListener("submit", function(event) {
    event.preventDefault();

    const valorOriginal = parseFloat(document.getElementById("valor-original").value);
    const moedaSelecionada = document.getElementById("moeda-gasto").value;

    if (!Number.isFinite(valorOriginal) || valorOriginal <= 0) {
        alert("Informe um valor válido para o gasto.");
        return;
    }

    let valorConvertidoBRL = valorOriginal;

    if (moedaSelecionada === "USD") {
        valorConvertidoBRL = valorOriginal * cotacoes.USD;
    } else if (moedaSelecionada === "EUR") {
        valorConvertidoBRL = valorOriginal * cotacoes.EUR;
    } else if (moedaSelecionada === "BTC") {
        valorConvertidoBRL = valorOriginal * cotacoes.BTC;
    }

    const campoTotal = document.getElementById("total");
    const totalAtual = parseFloat(campoTotal.value) || 0;
    const novoTotal = totalAtual + valorConvertidoBRL;

    campoTotal.value = novoTotal.toFixed(2);
    document.getElementById("form-gasto").reset();

    alert(`Gasto de R$ ${valorConvertidoBRL.toFixed(2)} adicionado ao total!`);
});

carregarCotacoes();
