const _travelNextCity = (graph, sortedNodes = [], totalWeight = 0) => {
    /** Get nearest valid city to current */
    const nearest = graph.nearestCurrentUnvisitedNeighbor;
    if (!nearest) {
        /** Add travel to origin weight */
        const finalWeight = totalWeight + graph.currentWeightToOrigin;
        /** Set previous city visited and current city to origin */
        graph.currentCity.visited = true;
        graph.currentCity = graph.originIndex;
        /** Calc calcTwoOpt */
        const bestTwoOpt = { ...calcTwoOpt(graph, sortedNodes, finalWeight, graph.iterations), title: "2-opt" };
        /** Return subgraphs */
        return [{ sortedNodes, finalWeight, title: "Avaro" }].concat(bestTwoOpt);
    }
    /** Set previous city to visited */
    graph.currentCity.visited = true;
    graph.currentCity = nearest.index;
    /** Travel to next city */
    return _travelNextCity(graph, sortedNodes.concat(graph.currentCity), totalWeight + nearest.weight);
};

/**
 * Start 2-opt iterations
 * sortedNodes: [{ index, lat, lng }]
 * cost: Number,
 * maxIterations: Number
 * */
function calcTwoOpt(graph, nodes, startCost, maxIterations = 200) {
    let currentTour = { nodes, cost: startCost };
    let bestTour = currentTour;
    let currentIteration = 0;

    function rec_two_opt(){
        if(currentIteration >= maxIterations) { return; }
        currentIteration++;
        var newTour = two_opt(graph, bestTour);
        if (newTour.cost < bestTour.cost) bestTour = newTour;
        // else maxIterations = currentIteration;
        rec_two_opt();
    }
    rec_two_opt();

    return { sortedNodes: bestTour.nodes, finalWeight: bestTour.cost };
}

/**
 * Resolve 2-opt
 * currentTour: { nodes: [{ index, lat, lng }], cost: Number }
 * */
function two_opt(graph, currentTour){
    let n = currentTour.nodes.length;
    let bestTour = currentTour;
    for (let i = 1; i < n - 2; i++) {
        for (let j = i + 1; j < n + 1; j++) {
            if (j - i === 1) continue;
            let swap = currentTour.nodes.slice(0, i).concat(currentTour.nodes.slice(i, j).reverse(), currentTour.nodes.slice(j, n));
            let newTour = { nodes: swap, cost: cost(graph, swap) };
            if (newTour.cost < bestTour.cost) bestTour = newTour;
        }
    }
    return bestTour;
}

/** 
 * Suma de los pesos de todo el recorrido
 * nodes: { lat, lng, index }
 * */
function cost(graph, nodes){
    var total = 0;
    for (let i = 1; i < nodes.length; i++) {
        total += graph.distanceBetweenNodes(nodes[i - 1], nodes[i]);
    }
    total += graph.distanceBetweenNodes(nodes[nodes.length - 1], nodes[0]);
    return total;
}

export default _travelNextCity;
export { calcTwoOpt };