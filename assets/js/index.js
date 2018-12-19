//OBSERVE QUE ALGUMAS LISTAS DE PESQUISAS DE FILMES PODEM DAR PROBLEMA POIS A IMAGEM RETORNADA PELA API E CONFIGURADA PARA
//NAO SER ACESSADAS POR OUTROS SITES (CROSS-ORIGIN)

class search{
    constructor(toSearch){
        this.key = "7785026b";
        this.searchKeyword = toSearch;
        let this2 = this; // O ajax e considerado uma funcao, ou seja, ele tem seu proprio this, precisei separar o this do ajax e da classe
        startLoading(); // Inicia a tela de loading
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://www.omdbapi.com/",
            data: {"s": this.searchKeyword, "apikey": this.key},
            success: function(data){
                if(data.Response){ // Se tiver resposta do servidor API
                    let results = data["Search"];
                    let searchResults = [];
                    if(results){ // Se a pesquisa deu algum resultado
                        document.getElementById("searchResults").classList.remove("no-result");
                        for (let i = 0; i < results.length; i++) {
                            searchResults.push(results[i]["imdbID"]); //Coloca resultados em um array
                        }
                        this2.searchIDList = searchResults; // Define a lista de IDs da API
                        this2.loadData(); // Carrega os dados
                    }else{
                        endLoading(); //Se nao tiver resultados para de carregar
                        document.getElementById("searchResults").innerHTML = "No results";
                        document.getElementById("searchResults").classList.add("no-result");
                    }
                }
            }
        });
    }

    loadData(){ //  Carregando dados do servidor baseado no vetor de IDs
        let this2 = this;
        let allData = [];
        let listREQ = ["Title", "Year", "Runtime", "Genre", "Plot", "Poster", "Website"]; //Vetor de requisitos
        for(let i = 0; i < this2.searchIDList.length ; i++){
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "http://www.omdbapi.com/",
                data: {"i": this2.searchIDList[i], "apikey": this.key},
                success: function (data){
                    let listData = [];
                    if(data.Response) for(let j = 0 ; j < listREQ.length ; j++) listData.push(data[listREQ[j]]);
                    allData.push(listData);
                    if(i === (this2.searchIDList.length-1)) this2.showSearch(allData);
                }
            });
        }
    }

    showSearch(list){ //Mostra os resultados da funcao na tela
        let resultsDiv = document.getElementById("searchResults");
        let html = "";
        for(let i = 0; i < list.length ; i++){
            let poster = "";
            if(list[i][5] != "N/A") poster = '                        <img src="' + list[i][5] + '" alt="Avatar">\n';
            else poster = '                        <img src="./assets/images/no-image.jpg" alt="Avatar">\n';

           html += '            <div class="flip-card movie">\n' +
                '                <div class="flip-card-inner">\n' +
                '                    <div class="flip-card-front">\n' +
                poster +
                '                    </div>\n' +
                '                    <div id="movieInfo" class="flip-card-back">\n' +
                '                        <h1 id="movieTitle">'+ list[i][0] +'</h1>\n' +
                '                        <h1 id="movieYear">'+ list[i][1] +'</h1>\n' +
                '                        <h1 id="movieRuntime">'+ list[i][2] +'</h1>\n' +
                '                        <h1 id="movieGenre">'+ list[i][3] +'</h1>\n' +
                '                        <h1 id="moviePlot">'+ list[i][4] +'</h1>\n' +
                '                        <h1 id="movieWebsite"><a href="'+ list[i][6] +'">'+ list[i][6] +'</a></h1>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '            </div>';
        }
        resultsDiv.innerHTML = html;
        bloblize();
        changeBackColors();
    }
}

//Registando eventos
window.addEventListener("load", bloblize);

//Eventos de elementos
window.onload = function(){
    document.getElementById("searchButton").addEventListener("click", searchKeyword);

    document.getElementById("searchMovie").onkeypress = function(e){
        if(e.key.toUpperCase() === "ENTER"){
            searchKeyword();
        }
    };
};

function changeBackColors(){
    let flipFrontCard = document.getElementsByClassName("flip-card-front");
    let flipBackCard = document.getElementsByClassName("flip-card-back");

    let checkInterval = setInterval(function(){
            if (flipFrontCard[flipFrontCard.length - 1].querySelector("img").src.substr(0, 4) == "blob") {
                for (let i = 0; i < flipFrontCard.length; i++){
                        let img = flipFrontCard[i].querySelector("img");
                        if(img.naturalHeight !== 0) {
                            let color = getDominant(img);
                            flipBackCard[i].style.backgroundColor = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                        }
                }
                clearInterval(checkInterval);
                endLoading();
            }
    }, 100);
}

//Quando enviar formulario search
function searchKeyword(){
    let inputText = document.getElementById("searchMovie").value;
    //startLoading();

    let searchResult = new search(inputText);
}

//Variavel que indentifica se esta em processo de carregamento
let isLoading = false;

//Inicia tela de carregamento
function startLoading(){
    if(isLoading) return;
    let searchResults = document.getElementById("searchResults");
    let div = document.createElement("DIV");
    let img = document.createElement("IMG");
    div.id = "loadContent";
    img.className = "load-image";
    img.src = "./assets/images/loading.gif";
    div.appendChild(img);
    document.body.appendChild(div);
    searchResults.style.display = "none";
    isLoading = !isLoading;
}

//Remove tela de carregamento
function endLoading(){
    let searchResults = document.getElementById("searchResults");
    let div = document.getElementById("loadContent");
    div.classList.add("load-content-leaving");
    setTimeout(function(){
        document.body.removeChild(div);
        searchResults.style.display = "";
        isLoading = !isLoading;
    }, 300);
}

//Pegar a cor predominante de uma imagem
let colorThief = new ColorThief();
function getDominant(image){
    if(image.complete && image.naturalHeight) return colorThief.getColor(image);
    else if(colorThief.getColor(image) === [0,0]) return [168,168,168];
}

//Transforma todas as imagens em arquivos locais (para pegar a cor predominante)
function bloblize(){
    let imgs = document.querySelectorAll("img") || document.querySelectorAll("image");
    for(let i = 0; i < imgs.length ; i++){
        fetch(imgs[i].src).then(function (response) {
            return response.blob();
        }).then(function (blob) {
            let objectURL = URL.createObjectURL(blob);
            imgs[i].src = objectURL;
        });
    }
}