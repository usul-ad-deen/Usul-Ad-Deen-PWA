document.addEventListener("DOMContentLoaded", function () {
    // Standort abrufen und Gebetszeiten anzeigen
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchGebetszeiten(lat, lon);
                fetchStadtname(lat, lon);
            },
            function (error) {
                console.log("Standort konnte nicht ermittelt werden. Manuelle Auswahl erforderlich.");
                document.getElementById("manualCitySelection").style.display = "block";
            }
        );
    } else {
        console.log("Geolocation wird nicht unterstützt.");
    }

    // Stadtname anhand der Koordinaten holen
    function fetchStadtname(lat, lon) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            .then(response => response.json())
            .then(data => {
                const city = data.address.city || data.address.town || data.address.village || "Unbekannt";
                document.getElementById("currentLocation").textContent = `Ihr Standort: ${city}`;
            })
            .catch(error => console.error("Fehler beim Abrufen der Stadt:", error));
    }

    // Gebetszeiten abrufen
    function fetchGebetszeiten(lat, lon) {
        fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`)
            .then(response => response.json())
            .then(data => {
                const timings = data.data.timings;
                document.getElementById("fajr").textContent = timings.Fajr;
                document.getElementById("dhuhr").textContent = timings.Dhuhr;
                document.getElementById("asr").textContent = timings.Asr;
                document.getElementById("maghrib").textContent = timings.Maghrib;
                document.getElementById("isha").textContent = timings.Isha;
                document.getElementById("shuruk").textContent = timings.Sunrise;
            })
            .catch(error => console.error("Fehler beim Abrufen der Gebetszeiten:", error));
    }
});
