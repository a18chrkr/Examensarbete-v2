'use strict'

export const mergeJSONDatasets = async function (datasets) {
    let mergedDatasets = [];

    for (let dataset of datasets) {
        try {
            const response = await fetch(dataset);
            const data = await response.json();
            mergedDatasets = mergedDatasets.concat(data)
        }
        catch (error) {
            console.log(`There was an error fetching ${dataset}: `, error);
        }
    }
    return mergedDatasets;
}