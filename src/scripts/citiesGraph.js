import cities, { shuffledCities } from './cities.js';
import _travelNextCityBackTracking from './tspBacktracking';
export const MAX_CITIES = cities.length;

const sortGraph = (graph) => {
    // Start timer
    var t0 = performance.now()
    // Start traveling
    const resultArr = _travelNextCityBackTracking(graph, [graph.originNode]);
    const { sortedNodes, finalWeight } = resultArr[0];
    
    // End timer
    var t1 = performance.now()
    // Return data
    return { totalTimeMs: t1 - t0, result: resultArr };
};
const _travelNextCity = (graph, sortedNodes = [], totalWeight = 0) => {
    /** Get nearest valid city to current */
    const nearest = graph.nearestCurrentUnvisitedNeighbor;
    if (!nearest) {
        /** Set previous city visited and current city to origin */
        graph.currentCity.visited = true;
        graph.currentCity = graph.originIndex;
        /** Travel to origin */
        const finalWeight = totalWeight + graph.currentWeightToOrigin;
        return { sortedNodes, finalWeight }; // Concat origin to close circle
    }
    /** Set previous city to visited */
    graph.currentCity.visited = true;
    graph.currentCity = nearest.to;
    /** Travel to next city */
    return _travelNextCity(graph, sortedNodes.concat(graph.currentCity), totalWeight + nearest.weight);
};

const distanceBetweenCoords = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => value * Math.PI / 180;
    
    const R = 6371; // km
    const dLat = toRad(lat2-lat1);
    const dLng = toRad(lng2-lng1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1Rad) * Math.cos(lat2Rad); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
};

export default class CitiesGraph {
    constructor({ size, table, nodes, useRealData, symmetricalConnections, maxWeight, originIndex, citiesName } = {}) {
        this.useRealData = !!useRealData;
        this.citiesName = citiesName || shuffledCities();
        this.size = size || this._getRandomBetween(3, this.useRealData ? MAX_CITIES : 5000);
        this.originIndex = originIndex || this._getRandomBetween(0, this.size);
        this.maxWeight = maxWeight || this._getRandomBetween(1, 200);
        this.symmetricalConnections = symmetricalConnections === undefined ? true : symmetricalConnections;
        [this.table, this.nodes] = table && nodes ? [table, nodes] : this.getRandomGraph();
        this.currentNodeIndex = this.originIndex;
        this.sortedNodes = [];
        this.finalWeight = -1;
        this.totalTimeMs = -1;
        this.sortDate = null;
        this.middlePoints = null;
        
        if (symmetricalConnections) this.makeSymmetric();
    }
    sortNodes() {
        const { totalTimeMs, result } = sortGraph(this);
        this.sortedNodes = result[0].sortedNodes;
        this.finalWeight = result[0].finalWeight;
        this.totalTimeMs = totalTimeMs;
        this.middlePoints = [];
        this.sortDate = new Date();

        const setMidPointBetween = (i1, i2) => {
            let init = this.sortedNodes[i1];
            let end = this.sortedNodes[i2];
            
            let edge = this.table[init.index][end.index];
            let mid = [(end.lat + init.lat) / 2.0, (end.lng + init.lng) / 2.0];

            if (edge) this.middlePoints.push({ lat: mid[0], lng: mid[1], weight: edge.weight });
        };

        /** Find middle point of edges to show it weight */
        for (let i = 1; i < this.sortedNodes.length; i++) 
            setMidPointBetween(i - 1, i);
        /** Find middle point of initial and final points */
        setMidPointBetween(0, this.sortedNodes.length - 1);

        return this;
    }
    get formatedSortDate() {
        if (!this.sortDate) return "";
        return this.sortDate.getDate() + "/" + (this.sortDate.getMonth() + 1) + "/" + this.sortDate.getFullYear() + " " + this.sortDate.getHours() + ":" + this.sortDate.getMinutes() + ":" + this.sortDate.getSeconds();
    }
    get originNode() {
        return this.nodeByIndex(this.originIndex);
    }
    get citiesToVisit() {
        return this.citiesName.slice(0, this.size);
    }
    get currentCity() {
        return this.nodeByIndex(this.currentNodeIndex);
    }
    set currentCity(index) {
        this.currentNodeIndex = index
    }
    getCityNeigbors(index) {
        return this.table[index].map(n => n.index);
    }
    nodeByIndex(index) {
        return this.nodes[index];
    }
    get currentWeightToOrigin() {
        return this.table[this.currentNodeIndex][this.originIndex].weight;
    }
    get nearestCurrentUnvisitedNeighbor() {
        const unvisited = this.table[this.currentNodeIndex].filter(r => !this.nodes[r.to].visited && r.weight > 0);
        if (unvisited.length === 0) return null;
        
        let minNode = unvisited[0];
        
        for (let i = 1; i < unvisited.length; i++)
            if (unvisited[i].weight < minNode.weight)
                minNode = unvisited[i];
        
        return { to: minNode.to, weight: minNode.weight };
    }
    getRandomGraph() {
        const nodes = new Array(this.size).fill(undefined)
            .map((_, index) => {
                return {
                    index,
                    visited: false,
                    name: this.useRealData ? this.citiesName[index].name : '',
                    lat: this.useRealData ? parseFloat(this.citiesName[index].lat) : this.getRandomLat(),
                    lng: this.useRealData ? parseFloat(this.citiesName[index].lng) : this.getRandomLng()
                }
            });
        const table = new Array(this.size).fill(undefined)
            .map((_, i) => new Array(this.size).fill(undefined)
                .map((_, j) => this.newEdge({ nodes, pos: [i, j] })));
        return [table, nodes];
    }
    getRandomLat({ max, min } = { max: -13 , min: -11.0 }) {
        return (Math.random() * max) + min;
    }
    getRandomLng({ max, min } = { max: -15.0 , min: -52.0 }) {
        return (Math.random() * max) + min;
    }
    getRandomWeight() {
        return this._getRandomBetween(1, this.maxWeight);
    }
    newEdge({ nodes, pos }) {
        const node0 = nodes[pos[0]];
        const node1 = nodes[pos[1]];
        return {
            to: pos[1],
            from: pos[0],
            weight: pos[0] === pos[1] ? 0 :
                this.useRealData ?
                    distanceBetweenCoords(node0.lat, node0.lng, node1.lat, node1.lng) :
                    this.getRandomWeight(),
        };
    }
    makeSymmetric() {
        for (let i = 0; i < this.table.length; i++)
            for (let j = 0; j < this.table.length; j++)
                this.table[j][i] = { ...this.table[j][i], weight: this.table[i][j].weight };
    }
    mapProp(propName) {
        return this.table.map(r => r.map(i => i[propName]));
    }
    _getRandomBetween(min, max) {
        return Math.floor(Math.random() * max) + min;
    }
    get currentUnvisitedNeighbors(){
        return this.nodes.filter( n => n.index !== this.currentCity.index && !n.visited );
    }
    getCurrentWeightTo(city){
        return this.table[this.currentCity.index][city.index].weight;
    }
}