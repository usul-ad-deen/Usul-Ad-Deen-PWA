ddocument.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");
    }

    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

    async function ladeGebetszeiten(stadt) {
        try {
            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();

            document.getElementById("fajr").textContent = data.data.timings.Fajr;
            document.getElementById("shuruk").textContent = data.data.timings.Sunrise;
            document.getElementById("dhuhr").textContent = data.data.timings.Dhuhr;
            document.getElementById("asr").textContent = data.data.timings.Asr;
            document.getElementById("maghrib").textContent = data.data.timings.Maghrib;
            document.getElementById("isha").textContent = data.data.timings.Isha;

            document.getElementById("mitternacht").textContent = berechneMitternacht(data.data.timings.Maghrib, data.data.timings.Fajr);
            document.getElementById("letztes-drittel").textContent = berechneLetztesDrittel(data.data.timings.Fajr);
        } catch (error) {
            console.error("Fehler beim Laden der Gebetszeiten:", error);
        }
    }

    function berechneMitternacht(maghrib, fajr) {
        let [mH, mM] = maghrib.split(":").map(Number);
        let [fH, fM] = fajr.split(":").map(Number);
        let [nH] = (mH + fH) / 2
        let [nM] = (mM + fM) / 2
        let mitternacht = new Date();
        mitternacht.setHours(fH - nH, fM - nM)
        return mitternacht.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false});
    }

    function berechneLetztesDrittel(fajr) {
         let [mH, mM] = maghrib.split(":").map(Number);
        let [fH, fM] = fajr.split(":").map(Number);
        let [dH] = (mH + fH) / 3
        let [dM] = (mM + fM) / 3
        let letztesDrittel = new Date();
        letztesDrittel.setHours(fH - dH, fM - dM)
        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false});
    
    async function ladeHadith() {
        try {
            let response = await fetch("hadith.json");
            let data = await response.json();
            let zufallsHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadith-arabisch").textContent = zufallsHadith.arabisch;
            document.getElementById("hadith-deutsch").textContent = zufallsHadith.deutsch;
            document.getElementById("hadith-quelle").textContent = zufallsHadith.quelle;
            document.getElementById("hadith-auth").textContent = zufallsHadith.authentizität;
        } catch (error) {
            console.error("Fehler beim Laden des Hadiths:", error);
        }
    }

    async function ladeDua() {
        try {
            let response = await fetch("dua.json");
            let data = await response.json();
            let zufallsDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("dua-arabisch").textContent = zufallsDua.arabisch;
            document.getElementById("dua-deutsch").textContent = zufallsDua.deutsch;
            document.getElementById("dua-trans").textContent = zufallsDua.transliteration;
            document.getElementById("dua-quelle").textContent = zufallsDua.quelle;
        } catch (error) {
            console.error("Fehler beim Laden der Dua:", error);
        }
    }

    async function ladeIslamischesDatum() {
        try {
            let response = await fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toISOString().split('T')[0]);
            let data = await response.json();
            document.getElementById("islamisches-datum").textContent = data.data.hijri.date;
        } catch (error) {
            console.error("Fehler beim Laden des islamischen Datums:", error);
        }
    }

    async function ladeMekkaUhrzeit() {
        try {
            let response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Riyadh");
            let data = await response.json();
            let mekkaZeit = new Date(data.utc_datetime);
            mekkaZeit.setSeconds(mekkaZeit.getSeconds() + data.raw_offset);
            document.getElementById("mekka-uhrzeit").textContent = "Mekka: " + mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
        } catch (error) {
            console.error("Fehler beim Laden der Mekka-Zeit:", error);
        }
    }

    async function ermittleStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let stadt = data.address.city || data.address.town || data.address.village || "Unbekannt";
                    document.getElementById("stadt-name").textContent = stadt;
                    ladeGebetszeiten(stadt);
                } catch (error) {
                    console.error("Fehler bei der Standortermittlung:", error);
                }
            }, () => {
                console.error("Standort konnte nicht ermittelt werden.");
                document.getElementById("stadt-name").textContent = "Unbekannt";
            });
        }
    }

    document.getElementById("stadt-auswahl").addEventListener("change", function () {
        let stadt = this.value;
        document.getElementById("stadt-name").textContent = stadt;
        ladeGebetszeiten(stadt);
    });

    async function ladeStadtAuswahl() {
        try {
            let response = await fetch("stadt.json");
            let städte = await response.json();
            let dropdown = document.getElementById("stadt-auswahl");

            städte.forEach(stadt => {
                let option = document.createElement("option");
                option.value = stadt.name;
                option.textContent = stadt.name;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
    }

    ladeStadtAuswahl();
    ermittleStandort();
    ladeHadith();
    ladeDua();
    ladeIslamischesDatum();
    ladeMekkaUhrzeit();
});
