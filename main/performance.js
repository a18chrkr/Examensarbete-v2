export const startPerformanceObserver = function (reloads = 210, delay = 1000) {

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

            // Set each resource name as key and load time as value
            cdnResources.forEach((resource) => {
                const url = new URL(resource.name);
                const path = url.pathname
                measurement[path] = (resource.duration).toFixed(2);
            })

            // Only saves resources if it has a fetch time
            const fullyLoadedCDNs = cdnResources.filter(r => r.responseEnd > 0);

            // Returns sum of fetch time for all CDN's in milliseconds, taking into account parallel overlaps
            function calculateActiveCDNTime(fullyLoadedCDNs) {

                // Turn each resource into a [startTime, responseEnd] pair
                const intervals = fullyLoadedCDNs.map(r => [r.startTime, r.responseEnd]).sort((a, b) => a[0] - b[0]);
                
                // Merge CDN load intervals toegether into blocks
                const merged = [];
                for (const [start, end] of intervals) {
                    if (!merged.length || merged[merged.length - 1][1] < start) {
                    merged.push([start, end]); // no overlap
                    } else {
                    merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end); // merge
                    }
                }
                
                const totalActive = merged.reduce((sum, [start, end]) => sum + (end - start), 0).toFixed(2);
                return totalActive;
            }

            const cdnLoadTimes = calculateActiveCDNTime(fullyLoadedCDNs);
            measurement['cdnLoadTime'] = cdnLoadTimes;
            measurement['totalLoadTimeWithoutCDN'] = (parseFloat(measurement['totalLoadTime']) - cdnLoadTimes).toFixed(2);
            
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
                const csvMeasurements = "data:text/csv;charset=utf-8," + csvRows.map(row => row.join(';')).join('\n');
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
