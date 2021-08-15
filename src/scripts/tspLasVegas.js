

const _travelNextCity = ( graph, sortedNodes = [], totalWeight = 0, numberOfTries = 1000 ) => {
    let bestAnswer = { finalWeight: Number.MAX_VALUE, sortedNodes: [] };
    const init = graph.currentCity.index;
    for (let j = 0; j < numberOfTries; j++) {
        let currentAnswerCityIndexes = [ init ];
        graph.currentCity = init;
        let currentWeight = 0;
        for (let i = 0; i < graph.size - 1; i++) {
            let nextCityIndex = Math.floor(Math.random() * graph.size);
            while( currentAnswerCityIndexes.includes(nextCityIndex) ){
                nextCityIndex = Math.floor(Math.random() * graph.size);
            }
            const nextCity = graph.nodes[nextCityIndex];
            currentWeight+= graph.getCurrentWeightTo(nextCity);
            graph.currentCity.visited = true;
            graph.currentCity = nextCityIndex;
            currentAnswerCityIndexes.push(nextCityIndex);
        }
        currentWeight+=graph.currentWeightToOrigin;
        const currentAnswer = {
            finalWeight: currentWeight,
            sortedNodes: currentAnswerCityIndexes.map( ind => graph.nodeByIndex(ind) )
        };
        if( currentAnswer.finalWeight < bestAnswer.finalWeight ){
            bestAnswer = currentAnswer;
        }
    }
    console.log(bestAnswer);
    return [bestAnswer];
}
export default _travelNextCity;