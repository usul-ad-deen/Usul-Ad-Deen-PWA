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
                    await ladeGebetszeiten(stadt);
                    await ladeFeiertagsCountdowns(stadt);
                } catch (error) {
                    console.error("Fehler bei der Standortermittlung:", error);
                    await ladeGebetszeiten("Berlin");
                    await ladeFeiertagsCountdowns("Berlin");
                }
            });
        } else {
            await ladeGebetszeiten("Berlin");
            await ladeFeiertagsCountdowns("Berlin");
        }
    }

    // 📌 Hadith & Dua des Tages laden
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

    // 📌 Islamisches Datum laden
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

    // 📌 Städteauswahl laden
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
// 📌 Gebetszeiten abrufen
    async function ladeGebetszeiten(stadt) {
        try {
            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();

            let timings = data.data.timings;
            let prayerTimes = {
                "imsak": timings.Imsak,
                "fajr": timings.Fajr,
                "shuruk": timings.Sunrise,
                "dhuhr": timings.Dhuhr,
                "asr": timings.Asr,
                "maghrib": timings.Maghrib,
                "isha": timings.Isha
            };

            // Sunnah-Gebete berechnen
            prayerTimes["duha"] = `${zeitAnpassen(prayerTimes["shuruk"], 15)} - ${zeitAnpassen(prayerTimes["dhuhr"], -15)}`;
            prayerTimes["nachtgebet"] = `${zeitAnpassen(prayerTimes["isha"], 0)} - ${berechneLetztesDrittel(prayerTimes["fajr"], prayerTimes["maghrib"])}`;
            prayerTimes["nachtgebet-letztes-drittel"] = `${berechneLetztesDrittel(prayerTimes["fajr"], prayerTimes["maghrib"])} - ${zeitAnpassen(prayerTimes["fajr"], -5)}`;

            Object.keys(prayerTimes).forEach(prayer => {
                let element = document.getElementById(`${prayer}`);
                if (element) {
                    element.textContent = prayerTimes[prayer];
                }
            });

            updateGebetszeitenCountdown(prayerTimes);
            setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);
        } catch (error) {
            console.error("Fehler beim Laden der Gebetszeiten:", error);
        }
    }

    function zeitAnpassen(zeit, minuten) {
        let [h, m] = zeit.split(":").map(Number);
        let neueZeit = new Date();
        neueZeit.setHours(h, m + minuten);
        return neueZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
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

        let nachtDauer = fajrZeit - maghribZeit;
        let letztesDrittel = new Date(maghribZeit.getTime() + (2 * (nachtDauer / 3)));

        return letztesDrittel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

    // 📌 Feiertags-Countdown abrufen
    async function ladeFeiertagsCountdowns() {
        let feiertage = {
            "ramadan-countdown": "2025-03-01",
            "fitr-countdown": "2025-03-30",
            "hajj-countdown": "2025-06-04",
            "arafah-countdown": "2025-06-05",
            "adha-countdown": "2025-06-06",
            "neujahr-countdown": "2025-06-26",
            "ashura-countdown": "2025-07-05",
            "isra-countdown": "2026-01-16",
            "mawlid-countdown": "2025-09-15"
        };

        for (let id in feiertage) {
            berechneFeiertagsCountdown(feiertage[id], id);
        }
    }

    function berechneFeiertagsCountdown(datumString, elementId) {
        let heute = new Date();
        let feiertag = new Date(datumString);
        let diffMs = feiertag - heute;
        let tage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        document.getElementById(elementId).textContent = `${tage} Tage`;
    }

    
    // 📌 Initiale Funktionen laden
    await ermittleStandort();
    await ladeHadith();
    await ladeDua();
    await ladeIslamischesDatum();
    await ladeStadtAuswahl();
     await ermittleStandort();
    console.log("✅ Alle Funktionen erfolgreich geladen.");
});
