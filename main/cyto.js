import cytoscape from '../node_modules/cytoscape/dist/cytoscape.esm.min.mjs';

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