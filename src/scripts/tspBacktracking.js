
const _travelNextCity = ( graph, sortedNodes = [], totalWeight = 0 ) => {
    
    if( sortedNodes.length === graph.size ){
        totalWeight+= graph.currentWeightToOrigin;
        return [{finalWeight: totalWeight, sortedNodes: sortedNodes.concat(graph.originNode)}];
    }
    let ansArr = [{sortedNodes, finalWeight: Number.MAX_VALUE}];
    graph.currentUnvisitedNeighbors.forEach( nextCity =>{
        totalWeight+= graph.getCurrentWeightTo(nextCity);
        const oldCurrentCity = graph.currentCity;
        graph.currentCity.visited = true;
        graph.currentCity = nextCity.index;
        const result = _travelNextCity(graph, sortedNodes.concat(nextCity), totalWeight );
        graph.currentCity = oldCurrentCity.index;
        graph.currentCity.visited = false;
        if(result[0].finalWeight < ansArr[0].finalWeight){
            ansArr = result;
        }else if( result.finalWeight === ansArr[0].finalWeight ){
            ansArr = ansArr.concat(result);
        }
    });
    return ansArr;
}
export default _travelNextCity;