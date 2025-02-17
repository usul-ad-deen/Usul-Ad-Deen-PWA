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

    // Hadith des Tages abrufen und anzeigen
    function fetchHadithDesTages() {
        const hadithSammlung = [
            {
                arabisch: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
                deutsch: "Die Taten werden nur nach den Absichten beurteilt.",
                quelle: "Sahih al-Bukhari, Hadith 1"
            },
            {
                arabisch: "لاَ يَرْحَمُ اللَّهُ مَنْ لاَ يَرْحَمُ النَّاسَ",
                deutsch: "Allah erbarmt sich nicht über den, der sich nicht über die Menschen erbarmt.",
                quelle: "Sahih Muslim, Hadith 2319"
            },
            {
                arabisch: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
                deutsch: "Wer an Allah und den Jüngsten Tag glaubt, soll Gutes sprechen oder schweigen.",
                quelle: "Sahih al-Bukhari, Hadith 6018"
            }
        ];

        const zufallsHadith = hadithSammlung[Math.floor(Math.random() * hadithSammlung.length)];
        document.getElementById("hadith-arabisch").textContent = zufallsHadith.arabisch;
        document.getElementById("hadith-deutsch").textContent = zufallsHadith.deutsch;
        document.getElementById("hadith-quelle").textContent = zufallsHadith.quelle;
    }

    fetchHadithDesTages();
});
