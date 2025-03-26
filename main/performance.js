
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

            console.log(JSON.parse(localStorage.getItem('measurements')));

            // Ensure reloadCount starts at 0 if missing
            let reloadCount = parseInt(localStorage.getItem('reloadCount') || 0);

            if (reloadCount < reloads - 1) {  // Somehow it needs the -1 to reload correct number of times
                localStorage.setItem('reloadCount', reloadCount + 1);
                location.reload();
            } else {
                console.log("Finished collecting measurements.");
                localStorage.removeItem('reloadCount'); // Reset iteration counter
                localStorage.removeItem('measurements'); // Remove all measurements 
            }
        }, delay);
        console.log((parseInt(localStorage.getItem('reloadCount')) || 0) + 1);
    });
}
