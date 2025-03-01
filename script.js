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

    async function ladeGebetszeiten(stadt) {
    try {
        console.log(`📡 Lade Gebetszeiten für: ${stadt}`);
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();

        if (!data || !data.data || !data.data.timings) {
            console.error("❌ API-Fehler: Gebetszeiten konnten nicht geladen werden!");
            return;
        }

        function zeitAnpassen(zeit, minuten) {
            let [h, m] = zeit.split(":").map(Number);
            let neueZeit = new Date();
            neueZeit.setHours(h, m + minuten);
            return neueZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
        }

        let prayerTimes = {
            "Fajr": zeitAnpassen(data.data.timings.Fajr, 0),
            "Shuruk": zeitAnpassen(data.data.timings.Sunrise, 0),
            "Dhuhr": zeitAnpassen(data.data.timings.Dhuhr, 0),
            "Asr": zeitAnpassen(data.data.timings.Asr, 0),
            "Maghrib": zeitAnpassen(data.data.timings.Maghrib, 0),
            "Isha": zeitAnpassen(data.data.timings.Isha, 0)
        };

         // 📌 Sunnah-Gebete berechnen
            prayerTimes["Duha"] = `${zeitAnpassen(data.data.timings.Sunrise, 15)} - ${zeitAnpassen(data.data.timings.Dhuhr, -15)}`;
            prayerTimes["Nachtgebet"] = `${zeitAnpassen(data.data.timings.Isha, 0)} - ${berechneLetztesDrittel(data.data.timings.Fajr, data.data.timings.Maghrib)}`;
            prayerTimes["Nachtgebet - Letztes Drittel"] = `${berechneLetztesDrittel(data.data.timings.Fajr, data.data.timings.Maghrib)} - ${zeitAnpassen(data.data.timings.Fajr, -5)}`;

            // 📌 Mitternacht & letztes Drittel der Nacht berechnen
            berechneMitternachtUndDrittel(prayerTimes.Fajr, prayerTimes.Maghrib);

        // ✅ Sicherstellen, dass die IDs mit dem HTML übereinstimmen
        Object.keys(prayerTimes).forEach(prayer => {
            let element = document.getElementById(`${prayer.toLowerCase()}`);
            if (element) {
                element.textContent = prayerTimes[prayer];
            } else {
                console.warn(`⚠️ Warnung: Kein HTML-Element für ${prayer} gefunden!`);
            }
        });

        // ✅ Gebetszeiten-Countdown starten
        updateGebetszeitenCountdown(prayerTimes);
        setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der Gebetszeiten:", error);
    }
}

// 🛠 **Testausgabe in der Konsole anzeigen**
document.getElementById("stadt-auswahl").addEventListener("change", async function () {
    let gewählteStadt = this.value;
    console.log(`🌍 Manuelle Stadtwahl: ${gewählteStadt}`);
    document.getElementById("stadt-name").textContent = gewählteStadt;
    await ladeGebetszeiten(gewählteStadt);
});

  

    // 📌 Mitternacht & letztes Drittel berechnen
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

    // 📌 Countdown für das nächste Gebet
    function updateGebetszeitenCountdown(prayerTimes) {
        let jetzt = new Date();
        let currentTime = jetzt.getHours() * 60 + jetzt.getMinutes();

        let nextPrayer = null, nextPrayerTime = null;
        let prayerOrder = ["Fajr", "Duha", "Dhuhr", "Asr", "Maghrib", "Isha", "Nachtgebet", "Nachtgebet - Letztes Drittel"];

        for (let prayer of prayerOrder) {
            if (!prayerTimes[prayer]) continue;

            let [hours, minutes] = prayerTimes[prayer].split(":")[0].split(":").map(Number);
            let prayerMinutes = hours * 60 + minutes;

            if (prayerMinutes > currentTime) {
                nextPrayer = prayer;
                nextPrayerTime = prayerMinutes;
                break;
            }
        }

        if (!nextPrayer) {
            nextPrayer = "Fajr (Morgen)";
            nextPrayerTime = parseInt(prayerTimes["Fajr"].split(":")[0]) * 60 + parseInt(prayerTimes["Fajr"].split(":")[1]);
        }

        let remainingNextMinutes = nextPrayerTime - currentTime;
        let nextHours = Math.floor(remainingNextMinutes / 60);
        let nextMinutes = remainingNextMinutes % 60;
        document.getElementById("next-prayer").textContent = nextPrayer;
        document.getElementById("prayer-countdown").textContent = `${nextHours} Std ${nextMinutes} Min`;
    }



async function ladeFeiertagsCountdowns(stadt) {
    let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
    let data = await response.json();
    let maghribZeitHeute = data.data.timings.Maghrib;

    // 📌 Feiertage mit ihren realen Daten
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

    // 📌 Für jeden Feiertag den Countdown berechnen
    for (let id in feiertage) {
        berechneFeiertagsCountdown(feiertage[id], id, maghribZeitHeute, stadt);
    }
}

// 📌 Berechnet den Countdown ab Maghrib des Vortages des Feiertages
async function berechneFeiertagsCountdown(datumString, elementId, maghribZeitHeute, stadt) {
    let feiertag = new Date(datumString);
    feiertag.setDate(feiertag.getDate() - 1); // ❗ Feiertag -1 Tag nehmen
    let maghribZeitVortag = await holeMaghribZeit(feiertag, stadt); // Maghrib-Zeit des Vortages holen

    let [maghribStunde, maghribMinute] = maghribZeitVortag.split(":").map(Number);
    feiertag.setHours(maghribStunde, maghribMinute, 0); // Maghrib als Startzeit setzen

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

// 📌 Holt die Maghrib-Zeit des Vortages für eine Stadt
async function holeMaghribZeit(datum, stadt) {
    let tag = datum.getDate();
    let monat = datum.getMonth() + 1;
    let jahr = datum.getFullYear();
    
    let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3&date=${tag}-${monat}-${jahr}`);
    let data = await response.json();
    return data.data.timings.Maghrib;
}

// 📌 Initialisiert den Feiertags-Countdown
ladeFeiertagsCountdowns("Berlin");


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
