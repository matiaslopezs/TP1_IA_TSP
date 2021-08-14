<template>
  <q-page class="column">

    <!-- GENERAL OPTIONS -->

    <div class="row justify-between">

      <!-- SET SORT TYPE -->

      <div class="column q-ma-md">
        <div class="row items-center">
          <div v-for="type of [SORT_HEURISTIC, SORT_BACKTRACKING, SORT_THEVEGAS, SORT_ALL]" :key="type">
            <q-btn outline style="margin-right:5px" :class="{'text-white bg-primary': sortType===type}" @click="sortType=type">
              <q-icon v-if="sortType===type" name="check" />
              <span>{{type}}</span>
            </q-btn>
          </div>
        </div>
        <q-checkbox v-model="showPinTooltips" class="text-grey-7" label="Mostrar información" />
      </div>

      <!-- SET SORT PROPS -->

      <div>
        <div class="row q-pa-md">
          <q-checkbox left-label v-model="useRealData" class="text-grey-7" label="Usar datos reales" />
          <q-input outlined v-model="iterations" style="width:160px;margin-right:10px" 
            label="Iteraciones (2-OPT)" />
          <q-input outlined v-model="cityAmount" style="width:220px" 
            :label="`Cantidad de ciudades ${useRealData ? 'Max:' + MAX_CITIES : ''}`" />
          <q-btn outline color="primary" class="q-ml-md" @click="startNewSimulation">Simular</q-btn>
          <q-btn v-if="graphs.length > 0" outline color="red" class="q-ml-md" @click="clearSimulations">Limpiar</q-btn>
          <!-- TODO: DELETE BUTTON -->
          <q-btn style="margin-left:10px" color="primary" @click="resolveTestingBt">Backtracking testing</q-btn>
        </div>
      </div>
    </div>

    <!-- SIMULATIONS -->

    <div v-if="loading">
      <div class="flex flex-center column text-white" style="position:absolute;top:-50px;left:0;min-width:100vw;height:100vh;background-color:#0008;z-index:10000">
        <q-spinner color="white" size="6em"/>
        <div style="font-size:50px;margin-top:10px">Espere un momento</div>
        <div style="font-size:22px;margin-top:10px">Esto podría tomar segundos, minutos, días, meses, años o milenios...</div>
      </div>
    </div>
    <div v-else>
      <div v-for="(graph, index) of graphs" :key="index" class="map-container">
        <!-- MAP INFO -->
        <div class="row wrap">
          <div v-for="(info, index) of graphInfo(graph)" v-show="!info.hide"
              :key="index" class="column map-info-container justify-end">
            <div class="column map-info-content">
              <div class="text-grey-8">{{info.title}}</div>
              <div><strong>{{info.value}}</strong></div>
            </div>
          </div>
        </div>
        <!-- MAP RESULTS -->
        <div v-for="(subGraph, index) of graph.sortResult.subGraphs" :key="'sub-'+index" class="column"
            style="border-bottom:1px solid #888;position:relative">
            <div class="total-weight-menu">
              <div>Peso total {{subGraph.title ? `(${subGraph.title})` : ''}}</div>
              <div><strong>{{subGraph.finalWeight}}</strong></div>
            </div>
          <MapContainer :markers="subGraph.sortedNodes" :middles="subGraph.middlePoints" 
            :autoFocus="true" :showPinTooltips="showPinTooltips" />
        </div>
      </div>
    </div>

  </q-page>
</template>

<script>
import CitiesGraph, { MAX_CITIES, SORT_HEURISTIC, SORT_BACKTRACKING, SORT_THEVEGAS, SORT_ALL } from 'src/scripts/citiesGraph';
import MapContainer from 'src/components/MapContainer';

export default {
  name: "Index",
  components: {MapContainer},
  data() {
    return {
      MAX_CITIES,
      SORT_HEURISTIC,
      SORT_BACKTRACKING,
      SORT_THEVEGAS,
      SORT_ALL,
      cityAmount: "",
      useRealData: true,
      graphs: [],
      error: "",
      sortType: SORT_HEURISTIC,
      showPinTooltips: true,
      iterations: 200,
      loading: false,
      btTestingGraph: null
    }
  },
  methods: {
    async startNewSimulation() {
      this.loading = true;
      setTimeout(async () => {
        try {
          const _intCityAmount = parseInt(this.cityAmount);
          if (_intCityAmount < 3) { throw "3 ciudades como mínimo" }
          else if (!this.useRealData) await this.resolveSimulation();
          else if (_intCityAmount > MAX_CITIES) { throw `${MAX_CITIES} como máximo` }
          else await this.resolveSimulation();
        }
        catch (error) { 
          this.error = error;
          this.loading = false;
        }
      }, 500);
    },
    async resolveTestingBt() {
      if (this.btTestingGraph)
        this.graphs.push(await new CitiesGraph(this.btTestingGraph.clone(SORT_BACKTRACKING)).sortNodes());
      else if (this.cityAmount) {
        this.btTestingGraph = await new CitiesGraph({ 
          size: parseInt(this.cityAmount),
          useRealData: this.useRealData,
          sortType: SORT_BACKTRACKING
        }).sortNodes();
        this.graphs.push(this.btTestingGraph);
      }
    },
    async resolveSimulation() {
      // Generate base graph
      const graph = new CitiesGraph({ 
        size: parseInt(this.cityAmount),
        iterations: parseInt(this.iterations),
        useRealData: this.useRealData, 
        sortType: this.sortType 
      });
      // Sort base graph by type
      if (this.sortType === SORT_ALL) {
        // Sort by all tipes
        this.graphs.push(await new CitiesGraph(graph.clone(SORT_BACKTRACKING)).sortNodes());
        this.graphs.push(await new CitiesGraph(graph.clone(SORT_HEURISTIC)).sortNodes());
        this.graphs.push(await new CitiesGraph(graph.clone(SORT_THEVEGAS)).sortNodes());
      }
      // Sort by self type
      else this.graphs.unshift(await graph.sortNodes());
      // Stop loading and show maps
      this.loading = false;
    },
    clearSimulations() {
      this.graphs = [];
    },
    graphInfo(graph) {
      return [{
        title: "Ciudades recorridas",
        value: graph.size
      }, {
        title: "Fecha de simulación",
        value: graph.formatedSortDate
      }, {
        title: "Tipo de resolución",
        value: graph.sortType
      },{
        title: "Resultados",
        value: graph.sortResult.subGraphs.length
      },{
        title: "Tiempo de procesado (ms)",
        value: graph.totalTimeMs
      },{
        title: "Ciudad inicial",
        value: graph.originNode.name,
        hide: !graph.useRealData
      }, {
        title: "Iteraciones 2-OPT",
        value: graph.iterations,
        hide: !graph.sortType === SORT_HEURISTIC
      },{
        title: "Ciudades recorridas",
        value: graph.citiesToVisit.map(c => c.name).join(", "),
        hide: !graph.useRealData
      }];
    }
  },
  mounted() {
    /*this.cityAmount = "6";
    this.startNewSimulation();
    this.cityAmount = "";*/
  },
}
</script>

<style scoped>
.map-container {
  border: 1px solid #aaa;
  border-radius: 10px;
  margin:10px;
  background-color: #fcfcfc;
  margin-bottom:20px;
  box-shadow: 0 0 5px 5px #0001;
  overflow: hidden;
}
.map-info-container{
  min-width:110px;
  flex-grow:1;
}
.map-info-content{
  padding:5px;
  border-bottom:1px solid #888;
  background-color: white;
}
.total-weight-menu{
  position: absolute;
  background-color: white;
  top: 0;
  z-index:2000;
  padding: 5px;
  border-bottom: 1px solid #888;
  border-right: 1px solid #888;
}
</style>