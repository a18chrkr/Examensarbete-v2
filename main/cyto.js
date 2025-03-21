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