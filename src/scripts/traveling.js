import { question } from "../src/questions.js";
import CitiesGraph, { MAX_CITIES } from "./citiesGraph.js";

const PRINT_STEPS = false;

/**
 * Travel to the next city recursivelly
 * @param {CitiesGraph} graph
 * @param {Number} totalWeight sum of all weights
 * @param {Number} iteration number of visited city
 * @param {Object} previousCity prevous visited city
 * @returns
 */
const travelToNextCity = async (
  graph,
  totalWeight = 0,
  iteration,
  previousCity,
  isReturnToOrigin = false
) => {
  if (isReturnToOrigin) {
    /** Return to origin */
    await printAndWait("Total de kilómetros recorridos: " + totalWeight);
    return;
  }
  /** Get nearest valid city */
  const nearest = graph.nearestCurrentUnvisitedNeighbor;
  /** If there are no more cities to visit */
  if (!nearest) {
    /** Traveled */
    const prevToOrigin = graph.currentCity;
    graph.currentCity.visited = true;
    graph.currentCity = graph.origin;
    /** Show RPG ending messages */
    /** Travel to origin */
    await travelToNextCity(
      graph,
      totalWeight + graph.currentWeightToOrigin,
      iteration + 1,
      prevToOrigin,
      true
    );
    return;
  }
  /** Traveled */
  const prev = graph.currentCity;
  graph.currentCity.visited = true;
  graph.currentCity = nearest.to;
  /** Print next city info */
  if (PRINT_STEPS)
    await printAndWait(
      `~ Hiciste un viaje de ${nearest.weight} kilómetros desde ${prev.name} hasta ${graph.currentCity.name} ~`
    );
  /** Travel to next city */
  await travelToNextCity(
    graph,
    totalWeight + nearest.weight,
    iteration + 1,
    prev
  );
};

/**
 * Show a resume menssage and start traveling
 * @param {CitiesGraph} graph
 */
const startTraveling = async (graph) => {
  /** Print initial cities information */
  await printAndWait(
    `# Las ciudades a visitar son ${graph.size}: ${graph.citiesToVisit.join(
      ", "
    )}.\n# La ciudad de origen es ${graph.originNode.name}.`
  );
  /** Go fron origin to first city */
  await travelToNextCity(graph);
};

/**
 * Main function
 */
const start = async () => {
  /** Load amount of cities */
  let size = 0;
  while (size < 3 || size > MAX_CITIES) {
    size = parseInt(
      await question(
        "Ingrese la cantidad de ciudades a visitar (Enter para seleccionar aleatoriamente) "
      )
    );
    if (size > MAX_CITIES)
      await printAndWait(
        `No hay lugar para tantas ciudades en este pueblo, vaquero (max: ${MAX_CITIES})`
      );
    if (size < 3) await printAndWait("Ingrese al menos 3 ciudades");
  }

  /** Create a cities graph */
  const graph = new CitiesGraph({ size, symmetricalConnections: true });

  /** Start the adventure */
  await startTraveling(graph);

  /** Finnish */
  process.exit(0);
};

start();
