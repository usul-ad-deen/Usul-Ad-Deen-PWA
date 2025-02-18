
});
document.addEventListener("DOMContentLoaded", function () {
    aktualisiereUhrzeitUndDatum();
    bestimmeStandort();
    ladeHadithDesTages();
    ladeDuaDesTages();
});

// ⏳ **Uhrzeit & Datum sekündlich aktualisieren**
function aktualisiereUhrzeitUndDatum() {
    function updateTime() {
        let nowBerlin = new Date();
        let nowMekka = new Date(nowBerlin.getTime() + 2 * 60 * 60 * 1000);

        document.getElementById("uhrzeitBerlin").textContent = nowBerlin.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        document.getElementById("uhrzeitMekka").textContent = nowMekka.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        document.getElementById("datumBerlin").textContent = nowBerlin.toLocaleDateString("de-DE");
        document.getElementById("datumMekka").textContent = nowMekka.toLocaleDateString("de-DE");
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// 📍 **Standort & Stadtname ermitteln**
function bestimmeStandort() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                holeStadtname(lat, lon);
            },
            function () {
                document.getElementById("stadtAuswahlContainer").style.display = "block";
            }
        );
    }
}

function holeStadtname(lat, lon) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            if (data.address.city) {
                document.getElementById("standortAnzeige").textContent = `Ihr Standort: ${data.address.city}`;
            } else {
                document.getElementById("stadtAuswahlContainer").style.display = "block";
            }
        });
}
document.addEventListener("DOMContentLoaded", function () {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = "Uhrzeit: " + jetzt.toLocaleTimeString("de-DE");
    }
    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

    function ladeHadithDesTages() {
        fetch("hadith.json")
            .then(response => response.json())
            .then(data => {
                let index = new Date().getDate() % data.length;
                document.getElementById("hadith-text").textContent = data[index].arabisch;
                document.getElementById("hadith-quelle").textContent = data[index].quelle;
            });
    }
    ladeHadithDesTages();

    function ladeDuaDesTages() {
        fetch("dua.json")
            .then(response => response.json())
            .then(data => {
                let index = new Date().getDate() % data.length;
                document.getElementById("dua-text").textContent = data[index].arabisch;
                document.getElementById("dua-transliteration").textContent = data[index].transliteration;
                document.getElementById("dua-bedeutung").textContent = data[index].bedeutung;
            });
    }
    ladeDuaDesTages();
// 📚 **Hadith & Dua laden**
function ladeHadithDesTages() {
    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            let zufallsHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadithText").innerHTML = `
                <strong>Arabisch:</strong> ${zufallsHadith.arabisch} <br><br>
                <strong>Deutsch:</strong> ${zufallsHadith.deutsch} <br><br>
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
                <strong>Arabisch:</strong> ${zufallsDua.arabisch} <br><br>
                <strong>Deutsch:</strong> ${zufallsDua.deutsch} <br><br>
                <strong>Transliteration:</strong> ${zufallsDua.transliteration}
            `;
        });
}

// 🕌 **Islamische Mitternacht & Letztes Drittel berechnen**
function berechneMitternachtUndDrittel(maghrib, fajr) {
    let maghribTime = timeToMinutes(maghrib);
    let fajrTime = timeToMinutes(fajr);

    let mitternachtMin = maghribTime + Math.floor((fajrTime - maghribTime) / 2);
    let letztesDrittelMin = fajrTime - Math.floor((fajrTime - maghribTime) / 3);

    document.getElementById("mitternacht").textContent = minutesToTime(mitternachtMin);
    document.getElementById("letztesDrittel").textContent = minutesToTime(letztesDrittelMin);
}

function timeToMinutes(timeStr) {
    let [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
