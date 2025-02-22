document.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE");
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");
    }
    function aktualisiereUhrzeiten() {
        const jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE");

        const mekkazeit = new Date(jetzt.getTime() + 2 * 3600000);
        document.getElementById("uhrzeit-mekka").textContent = mekkazeit.toLocaleTimeString("de-DE");

        document.getElementById("gregorianisches-datum").textContent = jetzt.toLocaleDateString("de-DE");
        document.getElementById("islamisches-datum").textContent = "Islamisches Datum laden...";
        ladeIslamischesDatum();
    }

    function ladeIslamischesDatum() {
        fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toISOString().split("T")[0])
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    document.getElementById("islamisches-datum").textContent = data.data.hijri.date;
                }
            });
    }

    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

    async function ladeGebetszeiten(stadt) {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();

        document.getElementById("fajr").textContent = data.data.timings.Fajr;
        document.getElementById("shuruk").textContent = data.data.timings.Sunrise;
        document.getElementById("dhuhr").textContent = data.data.timings.Dhuhr;
        document.getElementById("asr").textContent = data.data.timings.Asr;
        document.getElementById("maghrib").textContent = data.data.timings.Maghrib;
        document.getElementById("isha").textContent = data.data.timings.Isha;

            let mitternacht = berechneMitternacht(data.data.timings.Maghrib, data.data.timings.Fajr);
        document.getElementById("mitternacht").textContent = mitternacht;

        let letztesDrittel = berechneLetztesDrittel(data.data.timings.Fajr);
        document.getElementById("letztes-drittel").textContent = letztesDrittel;
    }

    function berechneMitternacht(maghrib, fajr) {
        let [mH, mM] = maghrib.split(":").map(Number);
        let [fH, fM] = fajr.split(":").map(Number);
        let mitternacht = new Date();
        mitternacht.setHours((mH + fH) / 2, (mM + fM) / 2);
        return mitternacht.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    function berechneLetztesDrittel(fajr) {
        let [fH, fM] = fajr.split(":").map(Number);
        let letztesDrittel = new Date();
        letztesDrittel.setHours(fH - 2, fM);
        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    async function ladeHadith() {
        let response = await fetch("hadith.json");
        let data = await response.json();
        let zufallsHadith = data[Math.floor(Math.random() * data.length)];
        document.getElementById("hadith-arabisch").textContent = zufallsHadith.arabisch;
        document.getElementById("hadith-deutsch").textContent = zufallsHadith.deutsch;
        document.getElementById("hadith-quelle").textContent = zufallsHadith.quelle;
        document.getElementById("hadith-auth").textContent = zufallsHadith.authentizität;
    }

    async function ladeDua() {
        let response = await fetch("dua.json");
        let data = await response.json();
        let zufallsDua = data[Math.floor(Math.random() * data.length)];
        document.getElementById("dua-arabisch").textContent = zufallsDua.arabisch;
        document.getElementById("dua-deutsch").textContent = zufallsDua.deutsch;
        document.getElementById("dua-trans").textContent = zufallsDua.transliteration;
        document.getElementById("dua-quelle").textContent = zufallsDua.quelle;
    }

    function bestimmeStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById("stadtname").textContent = data.address.city || "Unbekannte Stadt";
                            ladeGebetszeiten(lat, lon);
                        });
                },
                () => {
                    document.getElementById("stadtname").textContent = "Bitte Stadt manuell wählen";
                    setzeStandardwerte();
                }
            );
        } else {
            setzeStandardwerte();
        }
    ladeGebetszeiten("Berlin");
    ladeHadith();
    ladeDua();
});
