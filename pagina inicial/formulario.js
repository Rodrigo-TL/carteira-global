// --- SELEÇÃO DE ELEMENTOS DA TELA (MAPEADO DO SEU HTML REAL) ---
const campoUsd = document.getElementById("valor-usd");
const campoEur = document.getElementById("valor-eur");
const campoBtc = document.getElementById("valor-btc");
const statusCotacao = document.getElementById("status-cotacao");
const botaoAtualizar = document.getElementById("btn-atualizar-cotacoes");
const filtroCategoria = document.getElementById("filtro-categoria");

// Objeto global para armazenar as cotações monetárias da API
let cotacoes = {
    USD: null,
    EUR: null,
    BTC: null
};

// Banco de dados local armazenado no navegador
let listaGastos = JSON.parse(localStorage.getItem("gastos_carteira")) || [];

// --- CONTROLE VISUAL DO CARREGAMENTO ---
function setLoadingState(isLoading) {
    if (botaoAtualizar) botaoAtualizar.disabled = isLoading;
    if (statusCotacao) {
        statusCotacao.innerHTML = isLoading ? '<span>Buscando cotações...</span>' : '<span>Cotações atualizadas</span>';
    }
}

// --- BUSCA DE COTAÇÕES ---
function carregarCotacoes() {
    setLoadingState(true);
    fetch("https://awesomeapi.com.br")
        .then(function(resposta) {
            if (!resposta.ok) throw new Error("Erro na API.");
            return resposta.json();
        })
        .then(function(dados) {
            cotacoes.USD = Number(dados.USDBRL.bid);
            cotacoes.EUR = Number(dados.EURBRL.bid);
            cotacoes.BTC = Number(dados.BTCBRL.bid);

            if (campoUsd) campoUsd.value = cotacoes.USD.toFixed(2);
            if (campoEur) campoEur.value = cotacoes.EUR.toFixed(2);
            if (campoBtc) campoBtc.value = cotacoes.BTC.toFixed(2);
            setLoadingState(false);
        })
        .catch(function(erro) {
            setLoadingState(false);
            console.error(erro);
        });
}

// --- FORÇANDO A FUNÇÃO A SER GLOBAL PARA O ONCLICK DO HTML FUNCIONAR ---
window.adicionarGasto = function(event) {
    // Evita o recarregamento instantâneo da página
    if (event) event.preventDefault(); 

    // Captura cirúrgica pelos IDs exatos da sua imagem
    const descInput = document.getElementById("descricao");
    const catSelect = document.getElementById("categoria-gasto");
    const valorInput = document.getElementById("valor-original");
    const moedaSelect = document.getElementById("moeda-gasto");

    // Validação de preenchimento
    if (!descInput || !valorInput || descInput.value.trim() === "" || valorInput.value === "") {
        alert("Por favor, preencha a descrição e o valor do gasto!");
        return;
    }

    const descricao = descInput.value.trim();
    const categoria = catSelect ? catSelect.value : "Outros";
    const valorOriginal = parseFloat(valorInput.value);
    const moeda = moedaSelect ? moedaSelect.value : "BRL";

    let valorBRL = valorOriginal;

    // Lógica de conversão monetária
    if (moeda === "USD") {
        if (!cotacoes.USD) { alert("Aguarde as cotações carregarem."); return; }
        valorBRL = valorOriginal * cotacoes.USD;
    } else if (moeda === "EUR") {
        if (!cotacoes.EUR) { alert("Aguarde as cotações carregarem."); return; }
        valorBRL = valorOriginal * cotacoes.EUR;
    } else if (moeda === "BTC") {
        if (!cotacoes.BTC) { alert("Aguarde as cotações carregarem."); return; }
        valorBRL = valorOriginal * cotacoes.BTC;
    }

    const novoGasto = {
        descricao: descricao,
        categoria: categoria,
        valorOriginal: valorOriginal,
        moeda: moeda,
        valorBRL: valorBRL
    };

    // Salva na lista e sincroniza no LocalStorage
    listaGastos.push(novoGasto);
    localStorage.setItem("gastos_carteira", JSON.stringify(listaGastos));
    
    // Atualiza a tabela na tela
    renderizarGastos();

    // Reseta o formulário
    descInput.value = "";
    valorInput.value = "";
};

// --- FUNÇÃO PARA EXCLUIR UM GASTO JÁ LANÇADO ---
window.excluirGasto = function(index) {
    listaGastos.splice(index, 1);
    localStorage.setItem("gastos_carteira", JSON.stringify(listaGastos));
    renderizarGastos();
};

// --- ATUALIZAR TABELA HISTÓRICA E BLOCOS DE ESTATÍSTICA ---
function renderizarGastos() {
    const tabelaCorpo = document.getElementById("tabela-gastos-corpo");
    const filtroSelecionado = filtroCategoria ? filtroCategoria.value : "Todos";
    
    if (!tabelaCorpo) return;
    tabelaCorpo.innerHTML = "";

    let acumuladorCategorias = {
        "Alimentação": 0,
        "Transporte": 0,
        "Lazer": 0,
        "Moradia": 0,
        "Outros": 0
    };

    listaGastos.forEach(function(gasto, index) {
        const valorBRL = parseFloat(gasto.valorBRL) || 0;
        const cat = gasto.categoria || "Outros";

        if (acumuladorCategorias.hasOwnProperty(cat)) {
            acumuladorCategorias[cat] += valorBRL;
        } else {
            acumuladorCategorias["Outros"] += valorBRL;
        }
       
        if (filtroSelecionado !== "Todos" && cat !== filtroSelecionado) {
            return;
        }

        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td style="padding: 10px 8px; color: #2d3748;">${gasto.descricao}</td>
            <td style="padding: 10px 8px; color: #2d3748;">${cat}</td>
            <td style="padding: 10px 8px; color: #2d3748;">${parseFloat(gasto.valorOriginal).toFixed(2)}</td>
            <td style="padding: 10px 8px; color: #2d3748;">${gasto.moeda}</td>
            <td style="padding: 10px 8px; color: #2d3748;">R$ ${valorBRL.toFixed(2)}</td>
            <td style="padding: 10px 8px;">
                <button type="button" onclick="excluirGasto(${index})" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Excluir</button>
            </td>
        `;
        tabelaCorpo.appendChild(linha);
    });

    // Sincroniza com as caixas de estatísticas do seu layout
    const eAlim = document.getElementById("estat-alimentacao");
    const eTran = document.getElementById("estat-transporte");
    const eLaze = document.getElementById("estat-lazer");
    const eMora = document.getElementById("estat-moradia");
    const eOutr = document.getElementById("estat-outros");

    if (eAlim) eAlim.textContent = acumuladorCategorias["Alimentação"].toFixed(2);
    if (eTran) eTran.textContent = acumuladorCategorias["Transporte"].toFixed(2);
    if (eLaze) eLaze.textContent = acumuladorCategorias["Lazer"].toFixed(2);
    if (eMora) eMora.textContent = acumuladorCategorias["Moradia"].toFixed(2);
    if (eOutr) eOutr.textContent = acumuladorCategorias["Outros"].toFixed(2);
}

// --- ATIVADORES E ESCUTADORES DE EVENTO ---
if (botaoAtualizar) botaoAtualizar.addEventListener("click", carregarCotacoes);
if (filtroCategoria) filtroCategoria.addEventListener("change", renderizarGastos);

window.addEventListener("DOMContentLoaded", function() {
    carregarCotacoes();
    renderizarGastos();
});
