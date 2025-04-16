
export const startPerformanceObserver = function (reloads = 10, delay = 500) {

    window.addEventListener('load', () => {

        setTimeout(() => {
            // Ensure measurements is always initialized correctly
            let measurements = JSON.parse(localStorage.getItem('measurements') || "[]");
            const measurement = {};
            const perf = performance.getEntriesByType('navigation')[0]?.toJSON();
            const resources = performance.getEntriesByType("resource");

            if (!perf) {
                console.log('There was an error measuring performance.');
                return;
            }

            // Get data from navigation api
            measurement['loadTime'] = (perf.loadEventEnd - perf.loadEventStart).toFixed(2);
            measurement['totalLoadTime'] = (perf.loadEventEnd - perf.startTime).toFixed(2);
            measurement['domContentLoadedTime'] = (perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart).toFixed(2);

            // Only saves cdn's'
            const cdnResources = resources.filter(resource =>
                resource.name.includes('cdn') && resource.name.includes('cloudflare')
            );

            // Defaulting CDN values
            measurement['sigmaLoadTime'] = "";
            measurement['graphologyLoadTime'] = "";
            measurement['earliestResourceStartTime'] = "";
            measurement['latestResourceResponseEnd'] = "";

            // Set each resource as key and load time as value
            cdnResources.forEach(resource => {
                let resourceName;
                if (resource.name === 'https://cdnjs.cloudflare.com/ajax/libs/sigma.js/3.0.1/sigma.min.js')
                    resourceName = 'sigmaLoadTime'
                else if (resource.name === 'https://cdnjs.cloudflare.com/ajax/libs/graphology/0.26.0/graphology.umd.min.js') {
                    resourceName = 'graphologyLoadTime'
                }
                if(resourceName){
                    measurement[resourceName] = (resource.duration).toFixed(2);
                }
            })

            if(cdnResources.length >= 1){
                const startTimes = cdnResources.map(r => r.startTime);
                const responseEnds = cdnResources.map(r => r.responseEnd);

                measurement['earliestResourceStartTime'] = Math.min(...startTimes).toFixed(2);
                measurement['latestResourceResponseEnd'] = Math.max(...responseEnds).toFixed(2);
            }

            measurements.push(measurement);
            localStorage.setItem('measurements', JSON.stringify(measurements));

            // Ensure reloadCount starts at 0 if missing
            let reloadCount = parseInt(localStorage.getItem('reloadCount') || 0);

            if (reloadCount < reloads - 1) {  // Somehow it needs the -1 to reload correct number of times
                localStorage.setItem('reloadCount', reloadCount + 1);
                location.reload();
            } else {
                console.log('Finished collecting measurements.');
                console.log(measurements)

                // have to re-parse data from local storage to account for last gathered measurement
                measurements = JSON.parse(localStorage.getItem('measurements'));

                // Makes 'measurements' an array of arrays, ready for csv download
                measurements = measurements.map(measurements => Object.values(measurements))

                // Adds a row with headers for csv file
                measurements.unshift([
                    'loadTime',
                    'totalLoadTime',
                    'domContentLoadTime',
                    'sigmaLoadTime',
                    'graphologyLoadTime',
                    'earliestResourceStartTime',
                    'latestResourceResponseEnd'
                ])

                // CSV content
                const csvMeasurements = "data:text/csv;charset=utf-8," + measurements.map(row => row.join(',')).join('\n');
                const encodedMeasurements = encodeURI(csvMeasurements);

                // Creates a clickable link which allow nameing the download file
                const link = document.createElement("a");
                link.setAttribute("href", encodedMeasurements);
                link.setAttribute("download", "measurements.csv"); // Name of csv file
                document.body.appendChild(link);
                link.click(); // Auto clicks the link to download the csv
                document.body.removeChild(link);

                localStorage.removeItem('reloadCount'); // Reset iteration counter
                localStorage.removeItem('measurements'); // Remove all measurements 
            }
        }, delay);
        console.log(`Current iteration: ${(parseInt(localStorage.getItem('reloadCount')) || 0) + 1}`); // Logs current iteration
    });
}
