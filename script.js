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
            function () {
                console.log("Standort konnte nicht ermittelt werden. Manuelle Auswahl erforderlich.");
                document.getElementById("manualCitySelection").style.display = "block";
                document.getElementById("manualCitySelection").addEventListener("change", function () {
                    const city = this.value;
                    document.getElementById("currentLocation").textContent = `Manuell gewählt: ${city}`;
                    fetchGebetszeitenFürStadt(city);
                });
            }
        );
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

    // Funktion für Gebetszeiten anhand von Städtenamen
    function fetchGebetszeitenFürStadt(city) {
        const cityCoords = {
            "Berlin": { lat: 52.5200, lon: 13.4050 },
            "Hamburg": { lat: 53.5511, lon: 9.9937 },
            "München": { lat: 48.1351, lon: 11.5820 },
            "Köln": { lat: 50.9375, lon: 6.9603 },
            "Frankfurt": { lat: 50.1109, lon: 8.6821 },
            "Stuttgart": { lat: 48.7758, lon: 9.1829 },
            "Düsseldorf": { lat: 51.2277, lon: 6.7735 }
        };

        if (cityCoords[city]) {
            fetchGebetszeiten(cityCoords[city].lat, cityCoords[city].lon);
        } else {
            console.log("Koordinaten für diese Stadt nicht vorhanden.");
        }
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

    // Gebetszeiten abrufen & zusätzliche Zeiten berechnen
    function fetchGebetszeiten(lat, lon) {
        fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`)
            .then(response => response.json())
            .then(data => {
                const timings = data.data.timings;
                
                // Standard-Gebetszeiten setzen
                document.getElementById("fajr").textContent = timings.Fajr;
                document.getElementById("dhuhr").textContent = timings.Dhuhr;
                document.getElementById("asr").textContent = timings.Asr;
                document.getElementById("maghrib").textContent = timings.Maghrib;
                document.getElementById("isha").textContent = timings.Isha;
                document.getElementById("shuruk").textContent = timings.Sunrise;

                // Islamische Mitternacht berechnen (Mitte zwischen Maghrib & Fajr)
                const mitternacht = berechneZwischenzeit(timings.Maghrib, timings.Fajr);
                document.getElementById("mitternacht").textContent = mitternacht;

                // Letztes Drittel der Nacht berechnen
                const letztesDrittel = berechneDrittelzeit(timings.Maghrib, timings.Fajr);
                document.getElementById("letztes-drittel").textContent = letztesDrittel;

                // Islamisches & gregorianisches Datum setzen
                document.getElementById("islamic-date").textContent = data.data.date.hijri.date;
                document.getElementById("gregorian-date").textContent = data.data.date.gregorian.date;
            })
            .catch(error => console.error("Fehler beim Abrufen der Gebetszeiten:", error));
    }

    // Zwischenzeit berechnen (z. B. islamische Mitternacht)
    function berechneZwischenzeit(start, end) {
        const startDate = new Date(`1970-01-01T${start}:00`);
        const endDate = new Date(`1970-01-01T${end}:00`);
        if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }
        const diff = (endDate - startDate) / 2;
        const result = new Date(startDate.getTime() + diff);
        return result.toTimeString().substring(0, 5);
    }

    // Letztes Drittel der Nacht berechnen
    function berechneDrittelzeit(start, end) {
        const startDate = new Date(`1970-01-01T${start}:00`);
        const endDate = new Date(`1970-01-01T${end}:00`);
        if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }
        const diff = (endDate - startDate) * (2 / 3);
        const result = new Date(startDate.getTime() + diff);
        return result.toTimeString().substring(0, 5);
    }

    // Mekka & Berlin Uhrzeiten abrufen
    function fetchZeiten() {
        const berlinTime = new Date().toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin" });
        const mekkaTime = new Date().toLocaleTimeString("ar-SA", { timeZone: "Asia/Riyadh" });

        document.getElementById("zeit-berlin").textContent = berlinTime;
        document.getElementById("zeit-mekka").textContent = mekkaTime;
    }

    // Hadith des Tages abrufen
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
