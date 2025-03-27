import cytoscape from "../../node_modules/cytoscape/dist/cytoscape.esm.min.mjs";
import { startPerformanceObserver } from "../performance.js";
import { mergeJSONDatasets } from "../jsonMerge.js";

/*
    This script use Cytoscape.js to parse, concat
    and render TAB3 formatted datasets from BioGRID.
    TAB3 documentation can be found here: https://wiki.thebiogrid.org/doku.php/biogrid_tab_version_3.0
*/

'use strict';

// Include file paths to desired datasets
const datasets = ['../../json_parser/tp73.json', '../../json_parser/abl1.json'];

startPerformanceObserver();

const convertToCytoscape = function (biogridData) {
    const nodes = new Map(); // A map ensure only unique values
    const edges = [];

    biogridData.forEach(interaction => {
        const interactorA = interaction["Official Symbol Interactor A"];
        const interactorB = interaction["Official Symbol Interactor B"];
        const throughput = interaction["Throughput"];

        // Add nodes that do no exists already
        if (!nodes.has(interactorA)) nodes.set(interactorA, { data: { id: interactorA, name: interactorA, throughput } });
        if (!nodes.has(interactorB)) nodes.set(interactorB, { data: { id: interactorB, name: interactorB, throughput } });

        // Add edges (relation between nodes)
        edges.push({
            data: {
                source: interactorA,
                target: interactorB
            }
        });
    });

    console.log(`Noder ${nodes.size}, Edges ${edges.length}}`) // Logs total amount of nodes and edges
    return [...nodes.values(), ...edges]; // ... spread operator make elements in the map & array individual elements
}

const renderCytoscape = function (elements) {
    cytoscape({
        container: document.getElementById("cy"), // DOM element to render Cytoscape
        elements: elements,
        style: [
            {
                selector: "node", // Default node
                style: {
                    "label": "data(name)",
                    "background-color": "#0074D9", // Blue
                    "height": "30px",
                    "width": "30px",
                }
            },
            {
                selector: "node[throughput = 'High Throughput']", // High throughput node
                style: {
                    "background-color": "#ff6666", // Red
                }
            },
            {
                selector: "edge",
                style: {
                    "width": 2,
                    "line-color": "gray",
                }
            },
        ],
        layout: {
            name: "concentric",
            animate: false,
        }
    });
}

mergeJSONDatasets(datasets).then(datasets => {
    const elements = convertToCytoscape(datasets)
    renderCytoscape(elements);
})