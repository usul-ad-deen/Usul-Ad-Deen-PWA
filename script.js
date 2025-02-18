document.addEventListener("DOMContentLoaded", function () {
    aktualisiereUhrzeitUndDatum();
    bestimmeStandort();
    ladeGebetszeiten();
    ladeHadithDesTages();
    ladeDuaDesTages();
    ladeStadtAuswahl();
});

// ⏳ **Uhrzeit & Datum sekündlich aktualisieren**
function aktualisiereUhrzeitUndDatum() {
    function updateTime() {
        let nowBerlin = new Date();
        let nowMekka = new Date(nowBerlin.getTime() + 2 * 60 * 60 * 1000);

        document.getElementById("uhrzeitBerlin").textContent = nowBerlin.toLocaleTimeString("de-DE");
        document.getElementById("uhrzeitMekka").textContent = nowMekka.toLocaleTimeString("de-DE");

        document.getElementById("datumGregorianisch").textContent = nowBerlin.toLocaleDateString("de-DE");
        document.getElementById("datumIslamisch").textContent = new Intl.DateTimeFormat("ar-SA", { calendar: "islamic-umalqura" }).format(nowBerlin);
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// 📍 **Standort & Stadt ermitteln**
function bestimmeStandort() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                document.getElementById("standortAnzeige").textContent = "Ihr Standort: " + lat + ", " + lon;
                ladeGebetszeiten(lat, lon);
            },
            function () {
                document.getElementById("stadtAuswahlContainer").style.display = "block";
            }
        );
    }
}

// 📚 **Hadith & Dua laden**
function ladeHadithDesTages() {
    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            let zufallsHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadithText").innerHTML = `
                <strong>Arabisch:</strong> ${zufallsHadith.arabisch} <br>
                <strong>Deutsch:</strong> ${zufallsHadith.deutsch} <br>
                <strong>Authentizität:</strong> ${zufallsHadith.authentizitaet}
            `;
        });
}

function ladeDuaDesTages() {
    fetch("dua.json")
        .then(response => response.json())
        .then(data => {
            let zufallsDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("duaText").innerHTML = `
                <strong>Arabisch:</strong> ${zufallsDua.arabisch} <br>
                <strong>Deutsch:</strong> ${zufallsDua.deutsch} <br>
                <strong>Transliteration:</strong> ${zufallsDua.transliteration}
            `;
        });
}

// 🕌 **Gebetszeiten abrufen & Islamische Mitternacht & Letztes Drittel berechnen**
function ladeGebetszeiten(lat, lon) {
    let apiUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let timings = data.data.timings;

            document.getElementById("fajr").textContent = timings.Fajr;
            document.getElementById("shuruk").textContent = timings.Sunrise;
            document.getElementById("dhuhr").textContent = timings.Dhuhr;
            document.getElementById("asr").textContent = timings.Asr;
            document.getElementById("maghreb").textContent = timings.Maghrib;
            document.getElementById("isha").textContent = timings.Isha;

            let mitternacht = berechneMitternacht(timings.Maghrib, timings.Fajr);
            let letztesDrittel = berechneLetztesDrittel(timings.Maghrib, timings.Fajr);

            document.getElementById("mitternacht").textContent = mitternacht;
            document.getElementById("letztesDrittel").textContent = letztesDrittel;
        });
}

// 🔢 **Islamische Mitternacht berechnen**
function berechneMitternacht(maghrib, fajr) {
    let maghribTime = timeToMinutes(maghrib);
    let fajrTime = timeToMinutes(fajr);

    let mitternachtMin = maghribTime + Math.floor((fajrTime - maghribTime) / 2);
    return minutesToTime(mitternachtMin);
}

// 🔢 **Letztes Drittel der Nacht berechnen**
function berechneLetztesDrittel(maghrib, fajr) {
    let maghribTime = timeToMinutes(maghrib);
    let fajrTime = timeToMinutes(fajr);

    let letztesDrittelMin = fajrTime - Math.floor((fajrTime - maghribTime) / 3);
    return minutesToTime(letztesDrittelMin);
}

// ⏳ **Hilfsfunktionen für Zeitberechnungen**
function timeToMinutes(timeStr) {
    let [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
