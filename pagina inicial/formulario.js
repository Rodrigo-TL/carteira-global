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
