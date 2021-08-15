
const _travelNextCity = (graph, sortedNodes = [], totalWeight = 0) => {
    /** Base case */
    if (sortedNodes.length === graph.size) {
        return [{
            finalWeight: totalWeight + graph.currentWeightToOrigin,
            sortedNodes: sortedNodes.concat(graph.originNode)
        }];
    }

    const travelNextCity = (nextCity) => {
        // Set prev city visited
        const oldCurrentCity = graph.currentCity;
        // Set current  currect city as next city
        graph.currentCity = nextCity.index;
        // Resolve next city
        const result = _travelNextCity(
            graph,
            sortedNodes.concat(nextCity),
            totalWeight + graph.distanceBetweenNodes(oldCurrentCity, nextCity));
        // Set current as old and not visited
        graph.currentCity.visited = false;
        graph.currentCity = oldCurrentCity.index;
        // Return the result
        return result;
    };
    
    /** Recursive case */
    let finalReult = null;
    graph.currentUnvisitedNeighbors.forEach(nextCity => {
        graph.currentCity.visited = true;
        
        const result = travelNextCity(nextCity);

        if (!finalReult || result[0].finalWeight < finalReult[0].finalWeight)
            finalReult = result;
        else if (result.finalWeight === finalReult[0].finalWeight)
            finalReult = finalReult.concat(result);
    });
    return finalReult;
}

export default _travelNextCity;