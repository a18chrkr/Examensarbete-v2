/*
    This script use Cytoscape.js to parse, concat
    and render TAB3 formatted datasets from BioGRID.
    TAB3 documentation can be found here: https://wiki.thebiogrid.org/doku.php/biogrid_tab_version_3.0
*/

import cytoscape from "../../node_modules/cytoscape/dist/cytoscape.esm.min.mjs";
import { startPerformanceObserver } from "../performance.js";
import { mergeJSONDatasets } from "../jsonMerge.js";

'use strict';

// Include file paths to desired datasets
const datasets = [
    '../../json_parser/dataset_large/ARF4.json',
    '../../json_parser/dataset_large/CASP8.json',
    '../../json_parser/dataset_large/CCDC22.json',
    '../../json_parser/dataset_large/CKAP4.json',
    '../../json_parser/dataset_large/KBTBD4.json',
    '../../json_parser/dataset_large/KEAP1.json',
    '../../json_parser/dataset_large/SPOP.json',
    '../../json_parser/dataset_large/CD247.json',
    '../../json_parser/dataset_large/PDPK1.json',
];

startPerformanceObserver();

// Init cytoscape graph
const graph = cytoscape()

const convertBiogridData = function (biogridData) {

    biogridData.forEach(interaction => {
        const interactorA = interaction["Official Symbol Interactor A"];
        const interactorB = interaction["Official Symbol Interactor B"];
        // const throughput = interaction["Throughput"];

        // Add nodes that do no exists already
        if (!graph.getElementById(interactorA).length){
            graph.add({data: {id: interactorA, name: interactorA}})
        };
        if (!graph.getElementById(interactorB).length){
            graph.add({data: {id: interactorB, name: interactorB}});
        }

        // Add edge if not already existing in graph
        const edgeID = `${interactorA}-${interactorB}`;
        if (!graph.getElementById(edgeID).length && interactorA !== interactorB) {
            graph.add({
                data: {
                    id: edgeID,
                    source: interactorA,
                    target: interactorB
                }
            });
        }
    });
};

mergeJSONDatasets(datasets).then(datasets => {
    const biogridData = datasets;
    convertBiogridData(biogridData)
    console.log(`Nodes: ${graph.nodes().length}, Edges: ${graph.edges().length}`);


    graph.mount(document.getElementById('graph')); // this attaches it to the DOM

    graph.style([
        {
            selector: "node",
            style: {
                "label": "data(name)",
                "height": "10px",
                "width": "10px",
            }
        },
        {
            selector: "edge",
            style: {
                "width": 1,
                "line-color": "gray"
            }
        }
    ]);

    graph.layout({
        name: "circle",
        animate: false
    }).run();
})