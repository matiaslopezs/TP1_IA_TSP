<template>
  <q-page class="column">

    <!-- GENERAL OPTIONS -->

    <div class="row justify-between">
      <div></div>
      <div class="row q-pa-md">
        <q-checkbox left-label v-model="useRealData" class="text-grey-7" label="Usar datos reales" />
        <q-input outlined v-model="cityAmount" style="width:300px" 
          :label="`Cantidad de ciudades ${useRealData ? 'Max:' + MAX_CITIES : ''}`" />
        <q-btn outline color="primary" class="q-ml-md" @click="startNewSimulation">Simular</q-btn>
      </div>
    </div>

    <!-- SIMULATIONS -->

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

      <!-- MAP -->
      <MapContainer :markers="graph.sortedNodes" :middles="graph.middlePoints" :autoFocus="true" />
    </div>

  </q-page>
</template>

<script>
import CitiesGraph, { MAX_CITIES } from 'src/scripts/citiesGraph';
import MapContainer from 'src/components/MapContainer';

export default {
  name: "Index",
  components: {MapContainer},
  data() {
    return {
      MAX_CITIES,
      cityAmount: "",
      useRealData: true,
      graphs: [],
      error: "",
    }
  },
  methods: {
    startNewSimulation() {
      const _intCityAmount = parseInt(this.cityAmount);
      if (_intCityAmount < 3) { }
      else if (!this.useRealData) this.resolveSimulation();
      else if (_intCityAmount > MAX_CITIES) { }
      else this.resolveSimulation();
    },
    resolveSimulation() {
      const _intCityAmount = parseInt(this.cityAmount);
      const useRealData = this.useRealData;
      const newGraph = new CitiesGraph({ size: _intCityAmount, useRealData });
      newGraph.sortNodes();
      this.graphs.unshift(newGraph);
    },
    graphInfo(graph) {
      return [{
        title: "Ciudades recorridas",
        value: graph.size
      }, {
        title: "Fecha de simulación",
        value: graph.formatedSortDate
      }, {
        title: "Peso total",
        value: graph.finalWeight
      },{
        title: "Tiempo de procesado (ms)",
        value: graph.totalTimeMs
      },{
        title: "Ciudad inicial",
        value: graph.originNode.name,
        hide: !graph.useRealData
      },{
        title: "Ciudades recorridas",
        value: graph.citiesToVisit.map(c => c.name).join(", "),
        hide: !graph.useRealData
      }];
    }
  },
  mounted() {
    /*this.cityAmount = "22";
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
  max-height:700px;
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
</style>