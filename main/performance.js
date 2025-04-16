
export const startPerformanceObserver = function (reloads = 10, delay = 1000) {

    window.addEventListener('load', () => {

        setTimeout(() => {
            // Ensure measurements is always initialized correctly
            let measurements = JSON.parse(localStorage.getItem('measurements') || "[]");
            const measurement = {};
            const perf = performance.getEntriesByType('navigation')[0]?.toJSON();
            const resources = performance.getEntriesByType("resource");
            const cdnDomains = ['cloudflare', 'jsdelivr'];

            if (!perf) {
                console.log('There was an error measuring performance.');
                return;
            }

            // Get data from navigation api
            measurement['totalLoadTime'] = (perf.loadEventEnd - perf.startTime).toFixed(2);

            // Only saves cdn's'
            const cdnResources = resources.filter(resource =>
                cdnDomains.some(domain => resource.name.includes(domain))
            );

            console.table(cdnResources.map(r => ({
                name: r.name,
                startTime: r.startTime.toFixed(2),
                responseEnd: r.responseEnd.toFixed(2),
                duration: r.duration.toFixed(2)
            })));

            measurement['earliestResourceStartTime'] = "";
            measurement['latestResourceResponseEnd'] = "";

            // Set each resource name as key and load time as value
            cdnResources.forEach((resource) => {
                const url = new URL(resource.name);
                const path = url.pathname
                measurement[path] = (resource.duration).toFixed(2);
            })

            // Only saves resources if it has a fetch time
            const fullyLoadedCDNs = cdnResources.filter(r => r.responseEnd > 0);

            if (fullyLoadedCDNs.length >= 1) {
                const earliestStart = Math.min(...fullyLoadedCDNs.map(resource => resource.startTime));
                const latestEnd = Math.max(...fullyLoadedCDNs.map(resource => resource.responseEnd));
                const cdnLoadTime = (latestEnd - earliestStart).toFixed(2);

                measurement['earliestResourceStartTime'] = earliestStart.toFixed(2);
                measurement['latestResourceResponseEnd'] = latestEnd.toFixed(2);
                measurement['cdnLoadTime'] = cdnLoadTime;

                measurement['totalLoadTimeWithoutCDN'] = (
                    parseFloat(measurement['totalLoadTime']) - parseFloat(cdnLoadTime)
                ).toFixed(2);
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

                // Dynamically collect all unique keys from all measurements
                const allKeys = new Set();
                measurements.forEach(row => {
                Object.keys(row).forEach(key => allKeys.add(key));
                });

                // Convert to array (optional: sort for consistency)
                const headers = Array.from(allKeys);

                // Create CSV rows (make sure every row has all keys)
                const csvRows = measurements.map(row => {
                return headers.map(key => row.hasOwnProperty(key) ? row[key] : "");
                });

                // Add headers at the top
                csvRows.unshift(headers);

                // Generate CSV string
                const csvMeasurements = "data:text/csv;charset=utf-8," + csvRows.map(row => row.join(',')).join('\n');
                const encodedMeasurements = encodeURI(csvMeasurements);

                // Download CSV
                const link = document.createElement("a");
                link.setAttribute("href", encodedMeasurements);
                link.setAttribute("download", "measurements.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                localStorage.removeItem('reloadCount'); // Reset iteration counter
                localStorage.removeItem('measurements'); // Remove all measurements 
            }
        }, delay);
        console.log(`Current iteration: ${(parseInt(localStorage.getItem('reloadCount')) || 0) + 1}`); // Logs current iteration
    });
}
