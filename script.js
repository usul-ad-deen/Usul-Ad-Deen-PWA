document.addEventListener("DOMContentLoaded", function () {
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);
    ladeHadithDesTages();
    ladeDuaDesTages();
    ladeStadtAuswahl();
    ermittleStandort();
    ladeKalenderdaten();
});

function updateUhrzeit() {
    let now = new Date();
    let uhrzeit = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    let datum = now.toLocaleDateString("de-DE");

    document.getElementById("aktuelle-uhrzeit").textContent = `Uhrzeit: ${uhrzeit}`;
    document.getElementById("aktuelles-datum").textContent = `Datum: ${datum}`;
}

async function ladeKalenderdaten() {
    try {
        const response = await fetch("https://api.aladhan.com/v1/gToH?date=today");
        const data = await response.json();

        let islamischesDatum = data.data.hijri.day + ". " + data.data.hijri.month.en + " " + data.data.hijri.year + " AH";
        let gregorianischesDatum = data.data.gregorian.date;

        document.getElementById("islamisches-datum").textContent = `Islamisches Datum: ${islamischesDatum}`;
        document.getElementById("gregorianisches-datum").textContent = `Gregorianisches Datum: ${gregorianischesDatum}`;

        ladeMekkaUhrzeit();
    } catch (error) {
        console.error("Fehler beim Laden des Kalenders:", error);
    }
}

async function ladeMekkaUhrzeit() {
    try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Riyadh");
        const data = await response.json();

        let mekkaZeit = new Date(data.datetime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        document.getElementById("mekka-uhrzeit").textContent = `Mekka-Zeit: ${mekkaZeit}`;
    } catch (error) {
        console.error("Fehler beim Laden der Mekka-Zeit:", error);
    }
}

// Setze alle Gebetszeiten standardmäßig auf 00:00
function setzeStandardGebetszeiten() {
    let zeiten = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    zeiten.forEach((zeit) => {
        document.getElementById(zeit).textContent = "00:00";
    });
}

// Standort automatisch ermitteln
function ermittleStandort() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                ladeGebetszeiten(lat, lon);
            },
            (error) => {
                console.log("Standort konnte nicht ermittelt werden. Bitte manuelle Auswahl treffen.");
                setzeStandardGebetszeiten();
            }
        );
    } else {
        console.log("Geolocation wird nicht unterstützt.");
        setzeStandardGebetszeiten();
    }
}

// Manuelle Stadtauswahl
async function ladeStadtAuswahl() {
    const response = await fetch("städte.json");
    const städte = await response.json();
    let stadtDropdown = document.getElementById("stadt-auswahl");

    städte.forEach((stadt) => {
        let option = document.createElement("option");
        option.value = JSON.stringify({ lat: stadt.lat, lon: stadt.lon });
        option.textContent = stadt.name;
        stadtDropdown.appendChild(option);
    });

    stadtDropdown.addEventListener("change", function () {
        let koordinaten = JSON.parse(this.value);
        ladeGebetszeiten(koordinaten.lat, koordinaten.lon);
    });
}

// Lade Gebetszeiten von Aladhan API
async function ladeGebetszeiten(lat, lon) {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`);
        const data = await response.json();
        let zeiten = data.data.timings;

        document.getElementById("fajr").textContent = zeiten.Fajr;
        document.getElementById("dhuhr").textContent = zeiten.Dhuhr;
        document.getElementById("asr").textContent = zeiten.Asr;
        document.getElementById("maghrib").textContent = zeiten.Maghrib;
        document.getElementById("isha").textContent = zeiten.Isha;

    } catch (error) {
        console.error("Fehler beim Laden der Gebetszeiten:", error);
        setzeStandardGebetszeiten();
    }
}

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

