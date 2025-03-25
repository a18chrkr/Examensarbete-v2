import cytoscape from "../node_modules/cytoscape/dist/cytoscape.esm.min.mjs";

'use strict';

// Include file paths to desired datasets
const datasets = ['../json_parser/tp73.json', '../json_parser/abl1.json'];

// Use the array of datasets and merge them into one
const mergeJSONDatasets = async function(datasets){
    let mergedDatasets = [];

    for(let dataset of datasets){
        try{
            const response = await fetch(dataset);
            const data = await response.json();
            mergedDatasets = mergedDatasets.concat(data)
        }
        catch(error){
            console.log(`There was an error fetching ${dataset}: `, error);
        }
    }
    return mergedDatasets;
}

const convertToCytoscape = function(biogridData){
    const nodes = new Map(); // En map säkerställer att endast unika noder renderas
    const edges = [];
    const expSys = new Map(); // Alla experimental systems

    biogridData.forEach(interaction => {
        const interactorA = interaction["Official Symbol Interactor A"];
        const interactorB = interaction["Official Symbol Interactor B"];
        const throughput = interaction["Throughput"];
        const experimentalSystem = interaction["Experimental System"];

        // Lägger till noder som inte redan existerar
        if (!nodes.has(interactorA)) nodes.set(interactorA, { data: { id: interactorA, name: interactorA, throughput, experimentalSystem } });
        if (!nodes.has(interactorB)) nodes.set(interactorB, { data: { id: interactorB, name: interactorB, throughput, experimentalSystem } });

        if(!expSys.has(experimentalSystem)) expSys.set(experimentalSystem, experimentalSystem)

        // Lägger till en edge (relation mellan två noder)
        edges.push({
            data: {
                source: interactorA,
                target: interactorB,
                experimentalSystem
                // interaction: interaction["Experimental System"],
                // type: interaction["Experimental System Type"]
            }
        });
    });

    console.log(`Noder ${nodes.size}, Edges ${edges.length}}`)
    console.log(expSys)
    return [...nodes.values(), ...edges]; // Separerar och kombinerar node map och edge array till en enhetlig array
}

mergeJSONDatasets(datasets).then(datasets => {
    const elements = convertToCytoscape(datasets)
})

var cy = cytoscape({

    container: document.getElementById('cy'), // container to render in
  
    elements: [ // list of graph elements to start with
      { // node a
        data: { id: 'a' }
      },
      { // node b
        data: { id: 'b' }
      },
      { // edge ab
        data: { id: 'ab', source: 'a', target: 'b' }
      }
    ],
  
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },
  
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }
    ],
  
    layout: {
      name: 'grid',
      rows: 1
    }
  
  });