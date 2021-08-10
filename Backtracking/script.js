const nInput = document.getElementById('nInput');
const maxRadomInput = document.getElementById('maxRandom');
const matrizDiv = document.getElementById('matrizDiv');
const l = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789'
const dibujarMatriz = ( matriz, domElement ) => {
    let output = `<table>\n<tr>\n`;
    output = `${output} <th></th>\n`;
    matriz.forEach( (_, i) => {
        output = `${output} <th>${l[i]}</th>`;
    });
    for (let i = 0; i < matriz.length; i++) {
        output = `${output}<tr>\n`;
        output = `${output}<th>${l[i]}</th>\n`
        for (let j = 0; j < matriz[i].length; j++) {   
            output = `${output}<td>${matriz[i][j]}</td>\n`
        }
        output = `${output}</tr>\n`
    }
    domElement.innerHTML = output;
}

let n = Number(nInput.value) ?? 4;
const nodosVisitados = Array(n).fill(false);
let grafoInicial = [
    [ 0, 10, 15, 20 ],
    [ 10, 0, 35, 25 ],
    [ 15, 35, 0, 30 ],
    [ 20, 25, 30, 0 ]
];
nodosVisitados[0] = true;
let respuesta = Number.MAX_VALUE;
let estadosExpandidos = 1;

const tsp = ( grafo, posicionActual, contadorNodos, costo ) => {
    console.log('Visitando nodo ', posicionActual);
    if( contadorNodos === n && grafo[posicionActual][0] ){
        respuesta = Math.min( respuesta, costo + grafo[posicionActual][0] );
        return;
    }
    
    grafo[posicionActual].forEach( (nodo, i) => {
        if( !nodosVisitados[i] && nodo ){
            nodosVisitados[i] = true;
            console.log('Siguiente nodo ', i);
            estadosExpandidos++;
            tsp( grafo, i, contadorNodos + 1, costo + nodo );
            console.log('Volviendo al nodo ', posicionActual);
            nodosVisitados[i] = false;
        }
    });
}

const calcularNuevaMatriz = () => {
    n = Number(nInput.value) ?? 4;
    let maxRadom = Number(maxRadomInput.value) ?? 100;
    const nuevoGrafo = Array.from( {length: n}, (_,i)=>(
        Array.from( {length: n}, (_,j)=> i=== j ? 0 : Math.floor(Math.random() * maxRadom) )
    ));
    grafoInicial = nuevoGrafo;
    dibujarMatriz(grafoInicial, matrizDiv);
    tsp(grafoInicial, 0, 1, 0);
    console.log('Respuesta final: ', respuesta);
    console.log('Nodos visitados' ,estadosExpandidos)
}

(() => {
    dibujarMatriz(grafoInicial, matrizDiv);
    tsp(grafoInicial, 0, 1, 0);
    console.log('Respuesta final: ', respuesta);
    console.log('Nodos visitados' ,estadosExpandidos)
})();
