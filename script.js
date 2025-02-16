document.addEventListener("DOMContentLoaded", function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
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
    } else {
        document.getElementById("gebetszeiten-info").textContent = "Standort nicht verfügbar.";
    }
});
