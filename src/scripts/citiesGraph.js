import cities, { shuffledCities } from './cities.js';
import _travelNextCityBackTracking from './tspBacktracking';
import _travelNextCityHeuristic from './tspHeuristic';
import _travelNextCityLasVegas from './tspLasVegas';
export const MAX_CITIES = cities.length;
export const SORT_HEURISTIC = "Heuristico";
export const SORT_BACKTRACKING = "Back Tracking";
export const SORT_THEVEGAS = "Las Vegas";
export const SORT_ALL = "Todos";

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
    constructor({ size, table, nodes, useRealData, symmetricalConnections, maxWeight, originIndex, citiesName, sortType, iterations, numberOfTries } = {}) {
        this.sortType = sortType;
        this.useRealData = !!useRealData;
        this.citiesName = citiesName || shuffledCities();
        this.size = size || this._getRandomBetween(3, this.useRealData ? MAX_CITIES : 5000);
        this.originIndex = originIndex === undefined ? this._getRandomBetween(0, this.size) : originIndex;
        this.maxWeight = maxWeight || this._getRandomBetween(1, 200);
        this.symmetricalConnections = symmetricalConnections === undefined ? true : symmetricalConnections;
        [this.table, this.nodes] = table && nodes ? [table, nodes] : this.getRandomGraph();
        this.currentNodeIndex = this.originIndex;
        this.sortedNodes = [];
        this.finalWeight = -1;
        this.totalTimeMs = -1;
        this.sortDate = null;
        this.sortResult = [];
        this.iterations = iterations || 200;
        this.numberOfTries = numberOfTries || 1000;
        this.visitedNodes = 0;
        
        if (symmetricalConnections) this.makeSymmetric();
    }
    distanceBetweenNodes(node1, node2) {
        return distanceBetweenCoords(node1.lat, node1.lng, node2.lat, node2.lng);
    }
    clone(sortType) {
        return {
            size: this.size,
            table: this.talbe,
            nodes: this.nodes,
            useRealData: this.useRealData,
            symmetricalConnections: this.symmetricalConnections,
            maxWeight: this.maxWeight,
            originIndex: this.originIndex,
            citiesName: this.citiesName,
            numberOfTries: this.numberOfTries,
            sortType: sortType || this.sortType
        }
    }
    sortNodes() {
        return new Promise(resolve => {
            resolve(this._sortNodes());
        });
    }
    _sortNodes() {
        // Start timer
        var t0 = performance.now()
        // Start traveling
        const sortResult = this.sortType === SORT_BACKTRACKING ?
            _travelNextCityBackTracking(this, [this.originNode]) : this.sortType === SORT_HEURISTIC ?
                _travelNextCityHeuristic(this, [this.originNode]) :
                _travelNextCityLasVegas(this, [this.originNode]);
        // End timer
        var t1 = performance.now()
        // Set total time
        this.totalTimeMs = t1 - t0;
        // Set final weight
        this.finalWeight = sortResult[0].finalWeight;
        // Set current date
        this.sortDate = new Date();
        
        /** Get a list of middle points between a list of nodes */
        const getMidPoints = (nodes) => {
            const midPoints = [];
            /** Find middle point of edges to show it weight */
            for (let i = 1; i < nodes.length; i++) 
                midPoints.push(getMidPointBetween(nodes[i - 1], nodes[i]));
            /** Find middle point of initial and final points */
            midPoints.push(getMidPointBetween(nodes[0], nodes[nodes.length - 1]));
            return midPoints;
        };
        /** Get the middle point and weight between two nodes */
        const getMidPointBetween = (init, end) => {            
            let weight = this.table[init.index][end.index].weight;
            let lat = (end.lat + init.lat) / 2.0;
            let lng = (end.lng + init.lng) / 2.0;
            return { lat, lng, weight };
        };
        /** Create data information for sub graphs */
        this.sortResult = sortResult
            .reduce((total, r) => {
                total.subGraphs.push({
                    title: r.title,
                    sortedNodes: r.sortedNodes,
                    finalWeight: this.nodesCost(r.sortedNodes),
                    middlePoints: getMidPoints(r.sortedNodes)
                });
                return total;
            }, {
                ...this,
                subGraphs: []
            });

        return this;
    }
    /** 
     * Suma de los pesos de todo el recorrido
     * nodes: [{ lat, lng, index }]
     * */
    nodesCost(nodes){
        var total = 0;
        for (let i = 1; i < nodes.length; i++)
            total += this.distanceBetweenNodes(nodes[i - 1], nodes[i]);
        total += this.distanceBetweenNodes(nodes[nodes.length - 1], nodes[0]);
        return total;
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
        return this.distanceBetweenNodes(this.currentCity, this.originNode);
    }
    get nearestCurrentUnvisitedNeighbor() {
        const unvisited = this.table[this.currentNodeIndex].filter(r => !this.nodes[r.to].visited && r.weight > 0);
        if (unvisited.length === 0) return null;
        
        let minNode = unvisited[0];
        
        for (let i = 1; i < unvisited.length; i++)
            if (unvisited[i].weight < minNode.weight)
                minNode = unvisited[i];
        
        return { index: minNode.to, weight: minNode.weight };
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
        return this.nodes.filter(n => { return n.index !== this.currentCity.index && !n.visited; });
    }
    getCurrentWeightTo(city) {
        return this.distanceBetweenNodes(this.currentCity, city); //this.table[this.currentCity.index][city.index].weight;
    }
    get bestResultWeight() {
        return this.sortResult.subGraphs.reduce((min, g) => {
            return !min || g.finalWeight < min ? g.finalWeight : min;
        }, null);
    }
}