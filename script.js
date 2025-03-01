document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Skript wird geladen...");

    // 📌 Menü-Steuerung
    const menuButton = document.querySelector(".menu-button");
    const menuList = document.querySelector(".menu-list");

    menuButton.addEventListener("click", () => {
        menuList.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
        if (!menuButton.contains(event.target) && !menuList.contains(event.target)) {
            menuList.classList.remove("show");
        }
    });

    // 📌 Dark Mode umschalten & speichern
    document.getElementById("dark-mode-toggle").addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });

    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // 📌 Aktuelle Uhrzeit & Datum setzen (Berlin & Mekka)
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById("mekka-uhrzeit").textContent = mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
    }
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);

// 📌 Lädt das islamische Datum (automatische Aktualisierung ab Maghrib)
async function ladeIslamischesDatum() {
    try {
        let heute = new Date();
        let tag = heute.getDate();
        let monat = heute.getMonth() + 1;
        let jahr = heute.getFullYear();

        let response = await fetch(`https://api.aladhan.com/v1/gToH/${tag}-${monat}-${jahr}`);
        let data = await response.json();

        if (data.code === 200) {
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

            // 📌 Aktualisierung ab Maghrib
            let jetzt = new Date();
            let stunden = jetzt.getHours();
            if (stunden >= 18) { 
                islamischerTag = parseInt(islamischerTag) + 1;
            }

            document.getElementById("islamisches-datum").textContent = 
                `${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
        } else {
            console.error("Fehler beim Laden des islamischen Datums: API antwortet nicht korrekt.");
        }
    } catch (error) {
        console.error("Fehler beim Abrufen des islamischen Datums:", error);
    }
}

// 📌 Automatisches Laden beim Start
ladeIslamischesDatum();




    // 📌 Standort ermitteln & Stadt manuell auswählen
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
                    await ladeGebetszeiten(stadt);
                    await ladeFeiertagsCountdowns();
                } catch (error) {
                    console.error("Fehler bei der Standortermittlung:", error);
                    await ladeGebetszeiten("Berlin");
                    await ladeFeiertagsCountdowns();
                }
            });
        } else {
            await ladeGebetszeiten("Berlin");
            await ladeFeiertagsCountdowns();
        }
    }

 async function ladeFeiertagsCountdowns(stadt) {
    try {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();

        // Maghrib-Zeit für den Standort abrufen
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
    } catch (error) {
        console.error("Fehler beim Laden der Maghrib-Zeit:", error);
    }
}

function berechneFeiertagsCountdown(datumString, elementId, maghribZeit) {
    let jetzt = new Date();
    let feiertag = new Date(datumString);

    // Maghrib-Zeit in Stunden & Minuten umwandeln
    let [maghribStunde, maghribMinute] = maghribZeit.split(":").map(Number);

    // Feiertag beginnt am Vortag mit Maghrib
    feiertag.setDate(feiertag.getDate() - 1);
    feiertag.setHours(maghribStunde, maghribMinute, 0);

    let diffMs = feiertag - jetzt;

    if (diffMs <= 0) {
        document.getElementById(elementId).textContent = "Heute!";
        return;
    }

    let tage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    let stunden = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    document.getElementById(elementId).textContent = `${tage} Tage, ${stunden} Stunden`;
}



    // 📌 Gebetszeiten abrufen & setzen (mit Anpassung)
    async function ladeGebetszeiten(stadt) {
        try {
            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();
            let timings = data.data.timings;

            let prayerTimes = {
                "fajr": zeitAnpassen(timings.Fajr, 0),
                "shuruk": zeitAnpassen(timings.Sunrise, -2),
                "dhuhr": zeitAnpassen(timings.Dhuhr, 2),
                "asr": zeitAnpassen(timings.Asr, 2),
                "maghrib": zeitAnpassen(timings.Maghrib, 2),
                "isha": zeitAnpassen(timings.Isha, 3),
                 "duha": zeitAnpassen(timings.Sunrise, 15), // Beginn von Duha
            "nachtgebet": zeitAnpassen(timings.Isha, 0),
            "nachtgebet-letztes-drittel": berechneLetztesDrittel(timings.Fajr, timings.Maghrib),
            "mitternacht": berechneMitternacht(timings.Fajr, timings.Maghrib)
            };

            Object.keys(prayerTimes).forEach(prayer => {
                let element = document.getElementById(`${prayer}`);
                if (element) {
                    element.textContent = prayerTimes[prayer];
                }
            });

            updatePrayerCountdowns(prayerTimes);
            setInterval(() => updatePrayerCountdowns(prayerTimes), 1000);
        } catch (error) {
            console.error("Fehler beim Laden der Gebetszeiten:", error);
        }
    }

    // 📌 Funktion zur Anpassung der Gebetszeiten
    function zeitAnpassen(zeit, minuten) {
        let [h, m] = zeit.split(":").map(Number);
        let neueZeit = new Date();
        neueZeit.setHours(h, m + minuten);
        return neueZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    // 📌 Letztes Drittel der Nacht berechnen
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

        let nachtDauer = fajrZeit - maghribZeit;
        let letztesDrittel = new Date(maghribZeit.getTime() + (2 * (nachtDauer / 3)));

        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

    // 📌 Mitternacht berechnen
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

        let mitternacht = new Date(maghribZeit.getTime() + ((fajrZeit - maghribZeit) / 2));
        return mitternacht.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

  function updateGebetszeitenCountdown(prayerTimes) {
    let jetzt = new Date();
    let currentTime = jetzt.getHours() * 60 + jetzt.getMinutes();

    let nextPrayer = null, nextPrayerTime = null;
    let currentPrayer = null, currentPrayerEndTime = null;

    // Reihenfolge der Gebete inklusive Sunnah-Gebete
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

    // Falls alle Gebete des Tages vorbei sind → Zeige Fajr von morgen an
    if (!nextPrayer) {
        nextPrayer = "Fajr (morgen)";
        nextPrayerTime = parseInt(prayerTimes["Fajr"].split(":")[0]) * 60 + parseInt(prayerTimes["Fajr"].split(":")[1]) + (24 * 60);
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

    // 📌 Berechnung der verbleibenden Zeit für das nächste Gebet
    let remainingNextMinutes = nextPrayerTime - currentTime;
    let nextHours = Math.floor(remainingNextMinutes / 60);
    let nextMinutes = remainingNextMinutes % 60;
    document.getElementById("next-prayer").textContent = nextPrayer;
    document.getElementById("prayer-countdown").textContent = `${nextHours} Std ${nextMinutes} Min`;

    // 📌 Berechnung der verbleibenden Zeit für das aktuelle Gebet
    let remainingCurrentMinutes = currentPrayerEndTime - currentTime;
    let currentHours = Math.floor(remainingCurrentMinutes / 60);
    let currentMinutes = remainingCurrentMinutes % 60;
    document.getElementById("current-prayer").textContent = currentPrayer || "-";
    document.getElementById("current-prayer-countdown").textContent = currentPrayer ? `${currentHours} Std ${currentMinutes} Min` : "-";
}


// 📌 Aktualisiert den Countdown jede Sekunde
setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);




    // 📌 Hadith & Dua laden
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

    // 📌 Stadt-Auswahl laden
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

            dropdown.addEventListener("change", async function () {
                let gewählteStadt = this.value;
                document.getElementById("stadt-name").textContent = gewählteStadt;
                await ladeGebetszeiten(gewählteStadt);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
    }

    // 📌 ALLE Funktionen starten
    await ermittleStandort();
    await ladeHadith();
    await ladeDua();
    await ladeStadtAuswahl();
});
