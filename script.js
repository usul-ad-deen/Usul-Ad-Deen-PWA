document.addEventListener("DOMContentLoaded", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById("stadtname").textContent = data.address.city || "Unbekannte Stadt";
                });
            ladeGebetszeiten(lat, lon);
        }, () => {
            document.getElementById("stadtname").textContent = "Bitte Stadt manuell wählen";
        });
    }

    function ladeGebetszeiten(lat, lon) {
        const apiURL = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`;
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                const t = data.data.timings;
                document.getElementById("fajr").textContent = t.Fajr;
                document.getElementById("shuruk").textContent = t.Sunrise;
                document.getElementById("dhuhr").textContent = t.Dhuhr;
                document.getElementById("asr").textContent = t.Asr;
                document.getElementById("maghrib").textContent = t.Maghrib;
                document.getElementById("isha").textContent = t.Isha;
            })
            .catch(() => {
                document.querySelectorAll("#gebetszeiten td:nth-child(2)").forEach(td => td.textContent = "00:00");
            });
    }

    function aktualisiereUhrzeiten() {
        const jetzt = new Date();
        document.getElementById("uhrzeit-berlin").textContent = jetzt.toLocaleTimeString("de-DE");
        
        const mekkazeit = new Date(jetzt.getTime() + 2 * 3600000);
        document.getElementById("uhrzeit-mekka").textContent = mekkazeit.toLocaleTimeString("de-DE");
    }

    setInterval(aktualisiereUhrzeiten, 60000);
});
