ddocument.addEventListener("DOMContentLoaded", function () {
    aktualisiereUhrzeit();
    setInterval(aktualisiereUhrzeit, 1000);
    ladeStadtListe();
    ermittleStandort();
    ladeHadithDesTages();
    ladeDuaDesTages();
});

function aktualisiereUhrzeit() {
    let jetzt = new Date();
    document.getElementById("aktuelle-uhrzeit").textContent = "Uhrzeit: " + jetzt.toLocaleTimeString("de-DE");
    ladeMekkaUhrzeit(jetzt);
}

function ladeMekkaUhrzeit(jetzt) {
    let mekkaZeit = new Date(jetzt.getTime() + (2 * 60 * 60 * 1000)); // Mekka ist 2 Stunden voraus
    document.getElementById("mekka-uhrzeit").textContent = "Mekka-Zeit: " + mekkaZeit.toLocaleTimeString("de-DE");
}

function ladeStadtListe() {
    fetch("stadt.json")
        .then(response => response.json())
        .then(data => {
            let stadtAuswahl = document.getElementById("stadt-auswahl");
            data.staedte.forEach(stadt => {
                let option = document.createElement("option");
                option.value = stadt;
                option.textContent = stadt;
                stadtAuswahl.appendChild(option);
            });

            stadtAuswahl.addEventListener("change", function () {
                if (this.value) {
                    ladeGebetszeiten(this.value);
                    document.getElementById("aktueller-standort").textContent = "Ihr Standort: " + this.value;
                }
            });
        })
        .catch(error => console.error("Fehler beim Laden der Städte:", error));
}

function ermittleStandort() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                ladeStadtVonKoordinaten(lat, lon);
            },
            function () {
                console.log("Standortermittlung fehlgeschlagen. Manuelle Auswahl erforderlich.");
                document.getElementById("aktueller-standort").textContent = "Ihr Standort: Nicht ermittelt";
            }
        );
    }
}

function ladeStadtVonKoordinaten(lat, lon) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            let stadt = data.address.city || data.address.town || data.address.village || "Unbekannt";
            document.getElementById("aktueller-standort").textContent = "Ihr Standort: " + stadt;
            ladeGebetszeiten(stadt);
        })
        .catch(error => console.error("Fehler beim Ermitteln der Stadt:", error));
}

function ladeGebetszeiten(stadt) {
    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                let timings = data.data.timings;
                document.getElementById("fajr").textContent = timings.Fajr;
                document.getElementById("shuruk").textContent = timings.Sunrise;
                document.getElementById("dhuhr").textContent = timings.Dhuhr;
                document.getElementById("asr").textContent = timings.Asr;
                document.getElementById("maghrib").textContent = timings.Maghrib;
                document.getElementById("isha").textContent = timings.Isha;

                ladeIslamischesDatum(data.data.date.hijri);
                ladeGregorianischesDatum(data.data.date.gregorian);
            }
        })
        .catch(error => console.error("Fehler beim Laden der Gebetszeiten:", error));
}

function ladeIslamischesDatum(hijriDate) {
    document.getElementById("islamisches-datum").textContent = `Islamisches Datum: ${hijriDate.day}.${hijriDate.month.en} ${hijriDate.year} H`;
}

function ladeGregorianischesDatum(gregorianDate) {
    document.getElementById("gregorianisches-datum").textContent = `Gregorian


async function ladeHadithDesTages() {
    const response = await fetch("hadith.json");
    const hadithe = await response.json();
    const zufaelligerHadith = hadithe[Math.floor(Math.random() * hadithe.length)];

    document.getElementById("hadith-arabisch").textContent = zufaelligerHadith.arabisch;
    document.getElementById("hadith-deutsch").textContent = zufaelligerHadith.deutsch;
    document.getElementById("hadith-quelle").textContent = `Quelle: ${zufaelligerHadith.quelle}`;
    document.getElementById("hadith-authentizitaet").textContent = `Authentizität: ${zufaelligerHadith.authentizität}`;
}

async function ladeDuaDesTages() {
    const response = await fetch("dua.json");
    const duas = await response.json();
    const zufaelligeDua = duas[Math.floor(Math.random() * duas.length)];

    document.getElementById("dua-arabisch").textContent = zufaelligeDua.arabisch;
    document.getElementById("dua-deutsch").textContent = zufaelligeDua.deutsch;
    document.getElementById("dua-transliteration").textContent = `Transliteration: ${zufaelligeDua.transliteration}`;
    document.getElementById("dua-quelle").textContent = `Quelle: ${zufaelligeDua.quelle}`;
}

