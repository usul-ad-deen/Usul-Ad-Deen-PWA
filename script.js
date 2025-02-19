document.addEventListener("DOMContentLoaded", function () {
    // Standort ermitteln
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById("stadtname").textContent = data.address.city || "Stadt nicht gefunden";
                });
            ladeGebetszeiten(latitude, longitude);
        }, () => {
            document.getElementById("stadtname").textContent = "Bitte Stadt manuell wählen";
        });
    } else {
        document.getElementById("stadtname").textContent = "Standort nicht verfügbar";
    }

    // Gebetszeiten laden
    function ladeGebetszeiten(lat, lon) {
        fetch(`http://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("fajr").textContent = data.data.timings.Fajr;
                document.getElementById("shuruk").textContent = data.data.timings.Sunrise;
                document.getElementById("dhuhr").textContent = data.data.timings.Dhuhr;
                document.getElementById("asr").textContent = data.data.timings.Asr;
                document.getElementById("maghrib").textContent = data.data.timings.Maghrib;
                document.getElementById("isha").textContent = data.data.timings.Isha;
            });
    }

    // Hadith laden
    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            const zufaelligerHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadith-text").textContent = zufaelligerHadith.text;
            document.getElementById("hadith-quellenangabe").textContent = zufaelligerHadith.quelle;
        });

    // Dua laden
    fetch("dua.json")
        .then(response => response.json())
        .then(data => {
            const zufaelligeDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("dua-text").textContent = zufaelligeDua.text;
            document.getElementById("dua-quellenangabe").textContent = zufaelligeDua.quelle;
        });
});
