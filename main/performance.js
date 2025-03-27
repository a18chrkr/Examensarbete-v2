
export const startPerformanceObserver = function (reloads = 10, delay = 500) {

    window.addEventListener('load', () => {

        // Ensure measurements is always initialized correctly
        let measurements = JSON.parse(localStorage.getItem('measurements') || "[]");

        const measurement = {};

        setTimeout(() => {
            const perf = performance.getEntriesByType('navigation')[0]?.toJSON();

            if (!perf) {
                console.log('There was an error measuring performance.');
                return;
            }

            measurement['loadTime'] = (perf.loadEventEnd - perf.loadEventStart).toFixed(2);
            measurement['totalLoadTime'] = (perf.loadEventEnd - perf.startTime).toFixed(2);
            measurement['domContentLoadedTime'] = (perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart).toFixed(2);

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
                measurements.unshift(['loadTime', 'totalLoadTime', 'domContentLoadTime'])

                const csvMeasurements = "data:text/csv;charset=utf-8," + measurements.map(row => row.join(',')).join('\n');
                const encodedMeasurements = encodeURI(csvMeasurements);

                // Creates a clickable link which allow nameing the download file
                const link = document.createElement("a");
                link.setAttribute("href", encodedMeasurements);
                link.setAttribute("download", "measurements.csv"); // Name of csv file
                document.body.appendChild(link);
                link.click(); // Auto clicks the link to download the csv

                localStorage.removeItem('reloadCount'); // Reset iteration counter
                localStorage.removeItem('measurements'); // Remove all measurements 
            }
        }, delay);
        console.log(`Current iteration: ${(parseInt(localStorage.getItem('reloadCount')) || 0) + 1}`); // Logs current iteration
    });
}
