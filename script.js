document.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
     let jetztUTC = new Date();
        let mekkaOffset = 2 * 60 * 60 * 1000;
        let mekkaZeit = new Date(jetztUTC.getTime() + mekkaOffset);
        document.getElementById("mekka-uhrzeit").textContent = "Mekka: " + mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
   
    }

    setInterval(updateUhrzeit, 1000);  

    
   async function ladeIslamischesDatum() {
    try {
        let heute = new Date();
        let gregorianischesDatum = `${heute.getDate()}-${heute.getMonth() + 1}-${heute.getFullYear()}`;

        let response = await fetch(`https://api.aladhan.com/v1/gToH/${gregorianischesDatum}`);
        let data = await response.json();

        let islamischerTag = data.data.hijri.day;
        let islamischerMonat = data.data.hijri.month.en;
        let islamischesJahr = data.data.hijri.year;

        let monateDeutsch = {
            "Muharram": "Muharram", "Safar": "Safar", "Rabi' al-Awwal": "Erster Rabi'",
            "Rabi' al-Thani": "Zweiter Rabi'", "Jumada al-Awwal": "Erster Jumada",
            "Jumada al-Thani": "Zweiter Jumada", "Rajab": "Rajab", "Sha'ban": "Sha'ban",
            "Ramadan": "Ramadan", "Shawwal": "Schawwal", "Dhul-Qi'dah": "Dhul-Qi'dah",
            "Dhul-Hijjah": "Dhul-Hijjah"
        };

        let islamischerMonatDeutsch = monateDeutsch[islamischerMonat] || islamischerMonat;
        document.getElementById("islamisches-datum").textContent = 
            `${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
    } catch (error) {
        console.error("Fehler beim Laden des islamischen Datums:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    async function ladeGebetszeiten(stadt) {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();

        function zeitAnpassen(zeit, minuten) {
            let [h, m] = zeit.split(":").map(Number);
            let neueZeit = new Date();
            neueZeit.setHours(h, m + minuten);
            return neueZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
        }

        let fajr = zeitAnpassen(data.data.timings.Fajr, -4);
        let maghrib = zeitAnpassen(data.data.timings.Maghrib, 3);

        document.getElementById("fajr").textContent = fajr;
        document.getElementById("shuruk").textContent = zeitAnpassen(data.data.timings.Sunrise, -3);
        document.getElementById("dhuhr").textContent = zeitAnpassen(data.data.timings.Dhuhr, 2);
        document.getElementById("asr").textContent = zeitAnpassen(data.data.timings.Asr, 2);
        document.getElementById("maghrib").textContent = maghrib;
        document.getElementById("isha").textContent = zeitAnpassen(data.data.timings.Isha, 5);

        document.getElementById("mitternacht").textContent = berechneMitternacht(fajr, maghrib);
        document.getElementById("letztes-drittel").textContent = berechneLetztesDrittel(fajr, maghrib);
    }

    function berechneMitternacht(fajr, maghrib) {
        let [fH, fM] = fajr.split(":").map(Number);
        let [mH, mM] = maghrib.split(":").map(Number);

        let maghribZeit = new Date();
        maghribZeit.setHours(mH, mM, 0);

        let fajrZeit = new Date();
        fajrZeit.setHours(fH, fM, 0);
        if (fajrZeit < maghribZeit) {
            fajrZeit.setDate(fajrZeit.getDate() + 1);
        }

        let nachtDauer = (fajrZeit - maghribZeit) / 2;
        let mitternacht = new Date(maghribZeit.getTime() + nachtDauer);

        return mitternacht.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    function berechneLetztesDrittel(fajr, maghrib) {
        let [fH, fM] = fajr.split(":").map(Number);
        let [mH, mM] = maghrib.split(":").map(Number);

        let maghribZeit = new Date();
        maghribZeit.setHours(mH, mM, 0);

        let fajrZeit = new Date();
        fajrZeit.setHours(fH, fM, 0);
        if (fajrZeit < maghribZeit) {
            fajrZeit.setDate(fajrZeit.getDate() + 1);
        }

        let nachtDauer = (fajrZeit - maghribZeit) / 3;
        let letztesDrittel = new Date(maghribZeit.getTime() + (2 * nachtDauer));

        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    async function ladeFeiertage() {
        let response = await fetch("feiertage.json");
        let feiertage = await response.json();
        let tabelle = document.getElementById("feiertage-tabelle");

        feiertage.forEach(feiertag => {
            let datum = new Date(feiertag.datum);
            let heute = new Date();
            let countdown = Math.ceil((datum - heute) / (1000 * 60 * 60 * 24));

            let row = document.createElement("tr");
            row.innerHTML = `<td>${feiertag.name}</td><td>${datum.toLocaleDateString("de-DE")}</td><td class="countdown-bold">${countdown} Tage</td>`;
            tabelle.appendChild(row);
        });
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
                    document.getElementById("stadt-name").textContent = "Unbekannt. Bitte manuell wählen.";
                }
            }, () => {
                console.error("Standort konnte nicht ermittelt werden.");
                document.getElementById("stadt-name").textContent = "Unbekannt. Bitte manuell wählen.";
            });
        }
    }

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

            dropdown.addEventListener("change", function () {
                let gewählteStadt = this.value;
                document.getElementById("stadt-name").textContent = gewählteStadt;
                ladeGebetszeiten(gewählteStadt);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
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

  
    ladeGebetszeiten("Berlin");
    ladeHadith();
    ladeDua();
    ladeStadtAuswahl();
    ermittleStandort();
    ladeIslamischesDatum();
    ladeMekkaUhrzeit();
    ladeDatum();
    updateUhrzeit();
    ladeFeiertage();
    
});
