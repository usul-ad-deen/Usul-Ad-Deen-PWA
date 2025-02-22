ocument.addEventListener("DOMContentLoaded", function () {
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);
    ladeHadith);
    ladeDua();
    ladeManuelleStadtauswahl);
    ermittleStandort();
    ladeGebetszeiten();
});

function updateUhrzeit() {
    let now = new Date();
    let uhrzeit = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    let datum = now.toLocaleDateString("de-DE");

    document.getElementById("aktuelle-uhrzeit").textContent = `Uhrzeit: ${uhrzeit}`;
    document.getElementById("aktuelles-datum").textContent = `Datum: ${datum}`;
}


async function ladeManuelleStadtauswahl() {
    const response = await fetch("stadt.json");
    const staedte = await response.json();
    let select = document.getElementById("stadt-auswahl");

    staedte.forEach(stadt => {
        let option = document.createElement("option");
        option.value = stadt.name;
        option.textContent = stadt.name;
        select.appendChild(option);
    });

    select.addEventListener("change", function () {
        document.getElementById("standort").textContent = `Ihr Standort: ${this.value}`;
    });
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

);

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
         let [mH, mM] = maghrib.split(":").map(Number);
        let [fH, fM] = fajr.split(":").map(Number);
        let [dH] = (mH + fH) / 3
        let [dM] = (mM + fM) / 3
        let letztesDrittel = new Date();
        letztesDrittel.setHours(fH - dH, fM - dM)
        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false});
    }


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
            document.getElementById("dua-authentizität").textContent = "Authentizität: " + zufaelligeDua.authentizität;
        });
});
