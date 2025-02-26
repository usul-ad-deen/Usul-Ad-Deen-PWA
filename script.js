document.addEventListener("DOMContentLoaded", async () => {

    // 📌 Aktualisiert Uhrzeit & Datum (Berlin & Mekka)
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        // Mekka-Zeit (UTC+3)
        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById("mekka-uhrzeit").textContent = mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
    }
    setInterval(updateUhrzeit, 1000);

    // 📌 Dark Mode Umschalten
    document.getElementById("dark-mode-toggle").addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    // 📌 Menü ein-/ausblenden
    document.querySelector(".menu-button").addEventListener("click", function () {
        document.querySelector(".menu-list").classList.toggle("show");
    });

    // 📌 Lädt das islamische Datum (automatische Aktualisierung ab Maghrib)
    async function ladeIslamischesDatum() {
        try {
            let heute = new Date();
            let response = await fetch(`https://api.aladhan.com/v1/gToH/${heute.getDate()}-${heute.getMonth() + 1}-${heute.getFullYear()}`);
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
            document.getElementById("islamisches-datum").textContent = `${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
        } catch (error) {
            console.error("Fehler beim Laden des islamischen Datums:", error);
        }
    }

    // 📌 Standortermittlung & Laden der Gebetszeiten
 async function ermittleStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let stadt = data.address.city || data.address.town || data.address.village || "Berlin";

                    document.getElementById("stadt-name").textContent = stadt;
                    ladeGebetszeiten(stadt);
                } catch (error) {
                    console.error("Fehler bei der Standortermittlung:", error);
                    document.getElementById("stadt-name").textContent = "Berlin";
                    ladeGebetszeiten("Berlin");
                }
            }, () => {
                console.error("Standort konnte nicht ermittelt werden.");
                document.getElementById("stadt-name").textContent = "Berlin";
                ladeGebetszeiten("Berlin");
            });
        } else {
            document.getElementById("stadt-name").textContent = "Berlin";
           
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
    // 📌 Gebetszeiten laden
    async function ladeGebetszeiten(stadt) {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();

        function zeitAnpassen(zeit, minuten) {
            let [h, m] = zeit.split(":").map(Number);
            let neueZeit = new Date();
            neueZeit.setHours(h, m + minuten);
            return neueZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
        }

        let fajr = zeitAnpassen(data.data.timings.Fajr, 2);
        let maghrib = zeitAnpassen(data.data.timings.Maghrib, 2);

        document.getElementById("imsak").textContent = zeitAnpassen(data.data.timings.Fajr, -3);
        document.getElementById("fajr").textContent = fajr;
        document.getElementById("shuruk").textContent = zeitAnpassen(data.data.timings.Sunrise, -2);
        document.getElementById("dhuhr").textContent = zeitAnpassen(data.data.timings.Dhuhr, 2);
        document.getElementById("asr").textContent = zeitAnpassen(data.data.timings.Asr, 2);
        document.getElementById("maghrib").textContent = maghrib;
        document.getElementById("isha").textContent = zeitAnpassen(data.data.timings.Isha, 3);
   
        berechneMitternachtUndDrittel(fajr, maghrib);
    }

    // 📌 Mitternacht & letztes Drittel der Nacht berechnen
    function berechneMitternachtUndDrittel(fajr, maghrib) {
        let [fH, fM] = fajr.split(":").map(Number);
        let [mH, mM] = maghrib.split(":").map(Number);

        let maghribZeit = new Date();
        maghribZeit.setHours(mH, mM, 0);

        let fajrZeit = new Date();
        fajrZeit.setHours(fH, fM, 0);
        if (fajrZeit < maghribZeit) {
            fajrZeit.setDate(fajrZeit.getDate() + 1);
        }

        let nachtDauer = (fajrZeit - maghribZeit);
        let mitternacht = new Date(maghribZeit.getTime() + (nachtDauer / 2));
        let letztesDrittel = new Date(maghribZeit.getTime() + (2 * (nachtDauer / 3)));

        document.getElementById("mitternacht").textContent = mitternacht.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        document.getElementById("letztes-drittel").textContent = letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }


    // 📌 Feiertags-Countdown (beginnend ab Maghrib des jeweiligen Standorts)
    async function berechneCountdowns(stadt) {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();
        let maghribZeit = data.data.timings.Maghrib;

        let feiertage = {
            "ramadan-countdown": "2025-03-01",
            "fitr-countdown": "2025-03-30",
            "hajj-countdown": "2025-06-04",
            "arafah-countdown": "2025-06-05",
            "adha-countdown": "2025-06-06",
            "neujahr-countdown": "2025-06-26",
            "ashura-countdown": "2025-07-05",
            "isra-countdown": "2026-01-16"
        };

        for (let id in feiertage) {
            berechneCountdown(feiertage[id], id, maghribZeit);
        }
    }

    async function berechneCountdown(datumString, elementId, maghribZeit) {
        let [maghribStunde, maghribMinute] = maghribZeit.split(":").map(Number);
        let feiertag = new Date(datumString);
        feiertag.setHours(maghribStunde, maghribMinute, 0);

        let jetzt = new Date();
        let diffMs = feiertag - jetzt;

        if (diffMs <= 0) {
            document.getElementById(elementId).textContent = "Heute!";
            return;
        }

        let tage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let stunden = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        document.getElementById(elementId).textContent = `${tage} Tage, ${stunden} Stunden`;
    }

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

    // 📌 Dua des Tages laden
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

       
   
    // 📌 Starte alle Funktionen beim Laden der Seite
    updateUhrzeit();
    ladeIslamischesDatum();
    ermittleStandort();
     ladeGebetszeiten("Berlin");
    berechneCountdown(feiertage[id], id, maghribZeit);
    ladeHadith();
    ladeDua();
    ladeStadtAuswahl();
    berechneMitternachtUndDrittel();

});
