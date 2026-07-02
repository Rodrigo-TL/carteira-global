fetch(`https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL`)
        .then(function(resposta){
            return resposta.json();
        })
        .then(function(dados){
            document.getElementById("valor-usd").value = dados.USDBRL.bid
            document.getElementById("valor-eur").value = dados.EURBRL.bid
            document.getElementById("valor-btc").value = dados.BTCBRL.bid
           
        })
            
        
        .catch(function() {
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
        resultado.toFixed(2);
}