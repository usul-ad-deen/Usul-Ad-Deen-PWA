document.addEventListener("DOMContentLoaded", function() {
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Berlin&country=Germany&method=2")
        .then(response => response.json())
        .then(data => {
            const timings = data.data.timings;
            document.getElementById("gebetszeiten-info").innerHTML = `
                <strong>Fajr:</strong> ${timings.Fajr} | 
                <strong>Dhuhr:</strong> ${timings.Dhuhr} | 
                <strong>Asr:</strong> ${timings.Asr} | 
                <strong>Maghrib:</strong> ${timings.Maghrib} | 
                <strong>Isha:</strong> ${timings.Isha}
            `;
        })
        .catch(error => {
            document.getElementById("gebetszeiten-info").textContent = "Fehler beim Laden der Gebetszeiten.";
        });
});
