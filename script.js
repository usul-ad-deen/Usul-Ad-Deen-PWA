document.addEventListener("DOMContentLoaded", function () {
    aktualisiereUhrzeit();
    setInterval(aktualisiereUhrzeit, 1000);
    ladeHadithDesTages();
    ladeDuaDesTages();
    ermitteleStandort();
});

function aktualisiereUhrzeit() {
    const jetzt = new Date();
    const berlinZeit = jetzt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const berlinDatum = jetzt.toLocaleDateString("de-DE");
    
    document.getElementById("uhrzeit").textContent = `Berlin: ${berlinZeit}`;
    document.getElementById("datum").textContent = `Datum: ${berlinDatum}`;

    const mekkaZeit = new Intl.DateTimeFormat("de-DE", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(jetzt);
    document.getElementById("mekka-zeit").textContent = `Mekka: ${mekkaZeit}`;
}

async function ladeHadithDesTages() {
    try {
        const response = await fetch("hadith.json");
        const hadithe = await response.json();
        const index = new Date().getDate() % hadithe.length;
        const hadith = hadithe[index];

        document.getElementById("hadith-arabisch").textContent = hadith.arabisch;
        document.getElementById("hadith-deutsch").textContent = hadith.deutsch;
        document.getElementById("hadith-quelle").textContent = `Quelle: ${hadith.quelle} - ${hadith.authenzität}`;
    } catch (error) {
        console.error("Fehler beim Laden des Hadith:", error);
    }
}

async function ladeDuaDesTages() {
    try {
        const response = await fetch("dua.json");
        const duas = await response.json();
        const index = new Date().getDate() % duas.length;
        const dua = duas[index];

        document.getElementById("dua-arabisch").textContent = dua.arabisch;
        document.getElementById("dua-deutsch").textContent = dua.deutsch;
        document.getElementById("dua-transliteration").textContent = dua.transliteration;
        document.getElementById("dua-quelle").textContent = `Quelle: ${dua.quelle} - ${dua.authenzität}`;;
    } catch (error) {
        console.error("Fehler beim Laden der Dua:", error);
    }
}

function ermitteleStandort() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    const stadt = data.address.city || data.address.town || "Unbekannt";
                    document.getElementById("standort").textContent = `Ihr Standort: ${stadt}`;
                    ladeGebetszeiten(stadt);
                } catch (error) {
                    console.error("Fehler bei der Standortbestimmung:", error);
                    zeigeManuelleStadtauswahl();
                }
            },
            () => {
                zeigeManuelleStadtauswahl();
            }
        );
    } else {
        zeigeManuelleStadtauswahl();
    }
}

function zeigeManuelleStadtauswahl() {
    document.getElementById("standort").textContent = "Standort konnte nicht ermittelt werden. Bitte Stadt manuell wählen:";
    document.getElementById("stadt-auswahl").style.display = "block";
}

document.getElementById("stadt-wählen").addEventListener("change", function () {
    const stadt = this.value;
    document.getElementById("standort").textContent = `Ihr Standort: ${stadt}`;
    ladeGebetszeiten(stadt);
});

async function ladeGebetszeiten(stadt) {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=Germany&method=3`);
        const data = await response.json();
        const gebetszeiten = data.data.timings;

        document.getElementById("fajr").textContent = gebetszeiten.Fajr;
        document.getElementById("dhuhr").textContent = gebetszeiten.Dhuhr;
        document.getElementById("asr").textContent = gebetszeiten.Asr;
        document.getElementById("maghrib").textContent = gebetszeiten.Maghrib;
        document.getElementById("isha").textContent = gebetszeiten.Isha;
        document.getElementById("shuruk").textContent = gebetszeiten.Sunrise;
    } catch (error) {
        console.error("Fehler beim Laden der Gebetszeiten:", error);
    }
}
