document.addEventListener("DOMContentLoaded", function () {
    // Standort ermitteln
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById("stadtname").textContent = data.address.city || "Unbekannte Stadt";
                });
            ladeGebetszeiten(latitude, longitude);
        }, () => {
            document.getElementById("stadtname").textContent = "Bitte Stadt manuell wählen";
        });
    }

   document.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE");
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");
document.getElementById("mecca-time").innerText = "Uhrzeit Mekka: " + new Date().toLocaleTimeString("ar-SA", {timeZone: "Asia/Riyadh"});
    }

    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

    async function ladeGebetszeiten(position) {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${position}&country=DE&method=3`);
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
        let [nH] = (mH + fH) / 2
        let [nM] = (mM + fM) / 2
    
        let mitternacht = new Date();
        mitternacht.setHours(fH - nH, fM - nM)
        return mitternacht.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false});
    }

    function berechneLetztesDrittel(fajr) {
        let [fH, fM] = fajr.split(":").map(Number);
        let letztesDrittel = new Date();
        letztesDrittel.setHours(fH - 2, fM);
        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false});
    }



    ladeGebetszeiten("Berlin");
    ladeHadith();
    ladeDua();
});




    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            const zufaelligerHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadith-arabisch").textContent = zufaelligerHadith.arabisch;
            document.getElementById("hadith-deutsch").textContent = zufaelligerHadith.deutsch;
            document.getElementById("hadith-authentizität").textContent = "Authentizität: " + zufaelligerHadith.authentizität;
        });

    fetch("dua.json")
        .then(response => response.json())
        .then(data => {
            const zufaelligeDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("dua-arabisch").textContent = zufaelligeDua.arabisch;
            document.getElementById("dua-deutsch").textContent = zufaelligeDua.deutsch;
            document.getElementById("dua-transliteration").textContent = zufaelligeDua.transliteration;
            document.getElementById("dua-quellenangabe").textContent = "Quelle: " + zufaelligeDua.quelle;
            document.getElementById("dua-authentizität").textContent = "Authentizität: " + zufaelligeDua.authentizität;
        });
});
