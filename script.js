document.addEventListener("DOMContentLoaded", async () => {

    // 📌 Uhrzeit & Datum aktualisieren (Berlin & Mekka)
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        // Mekka-Zeit (UTC+3)
        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById("mekka-uhrzeit").textContent = mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
    }
    setInterval(updateUhrzeit, 1000);

   // 📌 Menü-Steuerung (Fix: Menü funktioniert jetzt richtig)
    document.querySelector(".menu-button").addEventListener("click", function () {
        let menu = document.querySelector(".menu-list");
        menu.classList.toggle("show");
    });

     // 📌 Dark Mode umschalten & speichern
    document.getElementById("dark-mode-toggle").addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });

    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // 📌 Standort ermitteln & Gebetszeiten abrufen
    async function ermittleStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let stadt = data.address.city || "Berlin";

                    document.getElementById("stadt-name").textContent = stadt;
                    ladeGebetszeiten(stadt);
                    ladeFeiertagsCountdowns(stadt);
                } catch (error) {
                    ladeGebetszeiten("Berlin");
                    ladeFeiertagsCountdowns("Berlin");
                }
            });
        } else {
            ladeGebetszeiten("Berlin");
            ladeFeiertagsCountdowns("Berlin");
        }
    }

    // 📌 Hadith & Dua des Tages laden
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
  
    
   / 📌 Gebetszeiten abrufen & setzen
    async function ladeGebetszeiten(stadt) {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();

        function zeitAnpassen(zeit, minuten) {
            let [h, m] = zeit.split(":").map(Number);
            let neueZeit = new Date();
            neueZeit.setHours(h, m + minuten);
            return neueZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
        }

        let prayerTimes = {
            "Imsak": zeitAnpassen(data.data.timings.Fajr, -5),
            "Fajr": zeitAnpassen(data.data.timings.Fajr, 2),
            "Shuruk": zeitAnpassen(data.data.timings.Sunrise, -2),
            "Dhuhr": zeitAnpassen(data.data.timings.Dhuhr, 2),
            "Asr": zeitAnpassen(data.data.timings.Asr, 2),
            "Maghrib": zeitAnpassen(data.data.timings.Maghrib, 2),
            "Isha": zeitAnpassen(data.data.timings.Isha, 3)
        };

        // 📌 Sunnah-Gebete berechnen
        prayerTimes["Duha"] = `${zeitAnpassen(data.data.timings.Sunrise, 15)} - ${zeitAnpassen(data.data.timings.Dhuhr, -15)}`;
        prayerTimes["Nachtgebet"] = `${zeitAnpassen(data.data.timings.Isha, 0)} - ${berechneLetztesDrittel(data.data.timings.Fajr, data.data.timings.Maghrib)}`;
        prayerTimes["Nachtgebet - Letztes Drittel"] = `${berechneLetztesDrittel(data.data.timings.Fajr, data.data.timings.Maghrib)} - ${zeitAnpassen(data.data.timings.Fajr, -5)}`;

        // 📌 Mitternacht & letztes Drittel der Nacht berechnen
        berechneMitternachtUndDrittel(prayerTimes.Fajr, prayerTimes.Maghrib);

        // 📌 Ausgabe der Gebetszeiten in HTML
        Object.keys(prayerTimes).forEach(prayer => {
            let element = document.getElementById(`${prayer.toLowerCase().replace(/ /g, "-")}`);
            if (element) {
                element.textContent = prayerTimes[prayer];
            }
        });

        // 📌 Update der Countdown-Anzeige
        updateGebetszeitenCountdown(prayerTimes);
        setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);
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

        let nachtDauer = fajrZeit - maghribZeit;
        let mitternacht = new Date(maghribZeit.getTime() + (nachtDauer / 2));
        let letztesDrittel = new Date(maghribZeit.getTime() + (2 * (nachtDauer / 3)));

        document.getElementById("mitternacht").textContent = mitternacht.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        document.getElementById("letztes-drittel").textContent = letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

    // 📌 Countdown für das nächste & aktuelle Gebet berechnen
    function updateGebetszeitenCountdown(prayerTimes) {
        let jetzt = new Date();
        let currentTime = jetzt.getHours() * 60 + jetzt.getMinutes();

        let nextPrayer = null, nextPrayerTime = null;
        let currentPrayer = null, currentPrayerEndTime = null;

        let prayerOrder = ["Fajr", "Duha", "Dhuhr", "Asr", "Maghrib", "Isha", "Nachtgebet", "Nachtgebet - Letztes Drittel"];

        for (let i = 0; i < prayerOrder.length; i++) {
            let prayer = prayerOrder[i];
            if (!prayerTimes[prayer]) continue;

            let [startHours, startMinutes] = prayerTimes[prayer].split(":")[0].split(":").map(Number);
            let prayerStartMinutes = startHours * 60 + startMinutes;

            if (prayerStartMinutes > currentTime) {
                nextPrayer = prayer;
                nextPrayerTime = prayerStartMinutes;
                break;
            }
        }

        if (!nextPrayer) {
            nextPrayer = "Fajr";
            nextPrayerTime = parseInt(prayerTimes["Fajr"].split(":")[0]) * 60 + parseInt(prayerTimes["Fajr"].split(":")[1]);
        }

        // 📌 Berechnung für das aktuelle Gebet
        for (let i = 0; i < prayerOrder.length - 1; i++) {
            let prayer = prayerOrder[i];
            if (!prayerTimes[prayer]) continue;

            let [startHours, startMinutes] = prayerTimes[prayer].split(":")[0].split(":").map(Number);
            let prayerStartMinutes = startHours * 60 + startMinutes;

            let [endHours, endMinutes] = prayerTimes[prayerOrder[i + 1]].split(":")[0].split(":").map(Number);
            let prayerEndMinutes = endHours * 60 + endMinutes;

            if (currentTime >= prayerStartMinutes && currentTime < prayerEndMinutes) {
                currentPrayer = prayer;
                currentPrayerEndTime = prayerEndMinutes;
                break;
            }
        }

        let remainingNextMinutes = nextPrayerTime - currentTime;
        let nextHours = Math.floor(remainingNextMinutes / 60);
        let nextMinutes = remainingNextMinutes % 60;
        document.getElementById("next-prayer").textContent = nextPrayer;
        document.getElementById("prayer-countdown").textContent = `${nextHours} Std ${nextMinutes} Min`;

        let remainingCurrentMinutes = currentPrayerEndTime - currentTime;
        let currentHours = Math.floor(remainingCurrentMinutes / 60);
        let currentMinutes = remainingCurrentMinutes % 60;
        document.getElementById("current-prayer").textContent = currentPrayer;
        document.getElementById("current-prayer-countdown").textContent = `${currentHours} Std ${currentMinutes} Min`;
    }

    updateGebetszeitenCountdown({
        "Fajr": "05:30",
        "Duha": "07:00 - 11:00",
        "Dhuhr": "12:30",
        "Asr": "15:45",
        "Maghrib": "18:00",
        "Isha": "20:00",
        "Nachtgebet": "21:00 - 03:30",
        "Nachtgebet - Letztes Drittel": "03:30 - 05:15"
    });

    setInterval(updateGebetszeitenCountdown, 1000);

    // 📌 Feiertags-Countdown abrufen & setzen
    async function ladeFeiertagsCountdowns(stadt) {
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
            berechneFeiertagsCountdown(feiertage[id], id, maghribZeit);
        }
    }

    function berechneFeiertagsCountdown(datumString, elementId, maghribZeit) {
        let jetzt = new Date();
        let feiertag = new Date(datumString);
        feiertag.setHours(...maghribZeit.split(":").map(Number), 0);

        let diffMs = feiertag - jetzt;
        let tage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let stunden = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById(elementId).textContent = `${tage} Tage, ${stunden} Stunden`;
    }

    updateUhrzeit();
    ermittleStandort();
});



