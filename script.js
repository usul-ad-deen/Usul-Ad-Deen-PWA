
  document.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        // Mekka-Zeit (UTC+3)
        let jetztUTC = new Date();
        let mekkaOffset = 2 * 60 * 60 * 1000;
        let mekkaZeit = new Date(jetztUTC.getTime() + mekkaOffset);
        document.getElementById("mekka-uhrzeit").textContent = mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
    }
    setInterval(updateUhrzeit, 1000);
    
 const darkModeToggle = document.getElementById("dark-mode-toggle");
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    // Menü ein-/ausblenden
    document.querySelector(".menu-button").addEventListener("click", function () {
        document.querySelector(".menu-list").classList.toggle("show");
  
      });
    
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
            
            // Islamisches Datum soll mit Maghrib aktualisiert werden
            let jetzt = new Date();
            let stunden = jetzt.getHours();
            if (stunden >= 18) { // Maghrib beginnt ab 18:00 Uhr
                islamischerTag = parseInt(islamischerTag) + 1;
            }

            document.getElementById("islamisches-datum").textContent = 
                `${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
        } catch (error) {
            console.error("Fehler beim Laden des islamischen Datums:", error);
        }
    }

    function berechneCountdown(datumString, elementId) {
        let jetzt = new Date();
        let feiertag = new Date(datumString);
        feiertag.setHours(18, 0, 0); // Feiertage beginnen um Maghrib des Vortags

        let diffMs = feiertag - jetzt;
        if (diffMs <= 0) {
            document.getElementById(elementId).textContent = "Heute!";
            return;
        }

        let tage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let stunden = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        document.getElementById(elementId).textContent = `${tage} Tage, ${stunden} Stunden`;
    }


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
 
        document.getElementById("Imsak").textContent = zeitAnpassen(data.data.timings.Fajr, -3);
        document.getElementById("fajr").textContent = fajr;
        document.getElementById("shuruk").textContent = zeitAnpassen(data.data.timings.Sunrise, -2);
        document.getElementById("dhuhr").textContent = zeitAnpassen(data.data.timings.Dhuhr, 2);
        document.getElementById("asr").textContent = zeitAnpassen(data.data.timings.Asr, 2);
        document.getElementById("maghrib").textContent = maghrib;
        document.getElementById("isha").textContent = zeitAnpassen(data.data.timings.Isha, 3);

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
            document.getElementById("dua-auth").textContent = zufallsDua.authentizität;
    }

  
    const prayerTimes = 
        document.getElementById("Imsak").textContent = zeitAnpassen(data.data.timings.Fajr, -3);
        document.getElementById("fajr").textContent = fajr;
        document.getElementById("shuruk").textContent = zeitAnpassen(data.data.timings.Sunrise, -2);
        document.getElementById("dhuhr").textContent = zeitAnpassen(data.data.timings.Dhuhr, 2);
        document.getElementById("asr").textContent = zeitAnpassen(data.data.timings.Asr, 2);
        document.getElementById("maghrib").textContent = maghrib;
        document.getElementById("isha").textContent = zeitAnpassen(data.data.timings.Isha, 3);
        document.getElementById("mitternacht").textContent = berechneMitternacht(fajr, maghrib);
        document.getElementById("letztes-drittel").textContent = berechneLetztesDrittel(fajr, maghrib);
  

    // Setze die Gebetszeiten in die HTML-Elemente
    Object.keys(prayerTimes).forEach(prayer => {
        document.getElementById(`${prayer.toLowerCase()}-time`).textContent = prayerTimes[prayer];
    });

    function getNextPrayer() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        let nextPrayer = null;
        let nextPrayerTime = null;

        Object.entries(prayerTimes).forEach(([prayer, time]) => {
            const [hours, minutes] = time.split(":").map(Number);
            const prayerMinutes = hours * 60 + minutes;
            if (prayerMinutes > currentTime && !nextPrayer) {
                nextPrayer = prayer;
                nextPrayerTime = prayerMinutes;
            }
        });

        if (!nextPrayer) {
            nextPrayer = "Fajr";
            nextPrayerTime = parseInt(prayerTimes["Fajr"].split(":")[0]) * 60 + parseInt(prayerTimes["Fajr"].split(":")[1]);
        }

        return { nextPrayer, nextPrayerTime };
    }

    function updatePrayerCountdown() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const { nextPrayer, nextPrayerTime } = getNextPrayer();

        const remainingMinutes = nextPrayerTime - currentTime;
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;

        document.getElementById("next-prayer").textContent = nextPrayer;
        document.getElementById("countdown").textContent = `${hours} Std ${minutes} Min`;
    }

    setInterval(updateCountdown, 10000);


    ladeGebetszeiten("Berlin");
    ladeHadith();
    ladeDua();
    ladeStadtAuswahl();
    ermittleStandort();
    ladeIslamischesDatum();
    ladeMekkaUhrzeit();
    ladeDatum();
    updateUhrzeit();
    updatePrayerCountdown();
    setzeCountdown();
    berechneCountdown("2025-03-01", "ramadan-countdown");
    berechneCountdown("2025-03-30", "fitr-countdown");
    berechneCountdown("2025-06-04", "hajj-countdown");
    berechneCountdown("2025-06-05", "arafah-countdown");
    berechneCountdown("2025-06-06", "adha-countdown");
    berechneCountdown("2025-06-26", "neujahr-countdown");
    berechneCountdown("2025-07-05", "ashura-countdown");
    berechneCountdown("2026-01-16", "isra-countdown");

});
