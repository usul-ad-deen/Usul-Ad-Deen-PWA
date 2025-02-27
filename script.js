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

    async function ladeIslamischesDatum(stadt) {
    try {
        let heute = new Date();
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();
        let maghribZeit = data.data.timings.Maghrib;

        let [mH, mM] = maghribZeit.split(":").map(Number);
        let maghribDatum = new Date();
        maghribDatum.setHours(mH, mM, 0, 0);

        if (heute >= maghribDatum) {
            heute.setDate(heute.getDate() + 1);
        }

        let islamischesDatumResponse = await fetch(`https://api.aladhan.com/v1/gToH/${heute.getDate()}-${heute.getMonth() + 1}-${heute.getFullYear()}`);
        let islamischesDatumData = await islamischesDatumResponse.json();
        let islamischerTag = islamischesDatumData.data.hijri.day;
        let islamischerMonat = islamischesDatumData.data.hijri.month.en;
        let islamischesJahr = islamischesDatumData.data.hijri.year;

        document.getElementById("islamisches-datum").textContent = `${islamischerTag}. ${islamischerMonat} ${islamischesJahr}`;
    } catch (error) {
        console.error("Fehler beim Laden des islamischen Datums:", error);
    }
}


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

    try {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();
        let maghribZeit = data.data.timings.Maghrib;
        let [mH, mM] = maghribZeit.split(":").map(Number);

        Object.keys(feiertage).forEach(id => {
            let feiertagsDatum = new Date(feiertage[id]);
            let maghribVorFeiertag = new Date(feiertagsDatum);
            maghribVorFeiertag.setDate(maghribVorFeiertag.getDate() - 1);
            maghribVorFeiertag.setHours(mH, mM, 0, 0);

            let jetzt = new Date();
            let diffMs = maghribVorFeiertag - jetzt;
            let tage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            let stunden = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (tage < 0) {
                document.getElementById(id).textContent = "Heute";
            } else {
                document.getElementById(id).textContent = `${tage} Tage, ${stunden} Stunden`;
            }
        });
    } catch (error) {
        console.error("Fehler beim Laden des Feiertags-Countdowns:", error);
    }
}


    // 📌 Gebetszeiten abrufen & setzen (mit Anpassung)
    async function ladeGebetszeiten(stadt) {
        try {
            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();
            let timings = data.data.timings;

            let prayerTimes = {
                "imsak": zeitAnpassen(timings.Fajr, -5),
                "fajr": zeitAnpassen(timings.Fajr, 2),
                "shuruk": zeitAnpassen(timings.Sunrise, -2),
                "dhuhr": zeitAnpassen(timings.Dhuhr, 2),
                "asr": zeitAnpassen(timings.Asr, 2),
                "maghrib": zeitAnpassen(timings.Maghrib, 2),
                "isha": zeitAnpassen(timings.Isha, 3),
                "duha": `${zeitAnpassen(timings.Sunrise, 15)} - ${zeitAnpassen(timings.Dhuhr, -15)}`,
                "nachtgebet": `${zeitAnpassen(timings.Isha, 0)} - ${berechneLetztesDrittel(timings.Fajr, timings.Maghrib)}`,
                "nachtgebet-letztes-drittel": `${berechneLetztesDrittel(timings.Fajr, timings.Maghrib)} - ${zeitAnpassen(timings.Fajr, -5)}`,
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

    // 📌 Countdown für jedes Gebet berechnen
    function updatePrayerCountdowns(prayerTimes) {
        let jetzt = new Date();
        let jetztMinuten = jetzt.getHours() * 60 + jetzt.getMinutes();

        let nextPrayer = null;
        let nextPrayerTime = null;
        let currentPrayer = null;
        let currentPrayerTime = null;

        Object.keys(prayerTimes).forEach(prayer => {
            let [h, m] = prayerTimes[prayer].split(":").map(Number);
            let prayerStartMin = h * 60 + m;

            let countdownElement = document.getElementById(`${prayer}-countdown`);
            if (countdownElement) {
                let verbleibendeMinuten = prayerStartMin - jetztMinuten;

                if (verbleibendeMinuten > 0) {
                    let stunden = Math.floor(verbleibendeMinuten / 60);
                    let minuten = verbleibendeMinuten % 60;
                    countdownElement.textContent = `Beginnt in: ${stunden} Std ${minuten} Min`;
                } else {
                    countdownElement.textContent = "Beginnt in: 00:00";
                }
            }

            if (prayerStartMin > jetztMinuten && !nextPrayer) {
                nextPrayer = prayer;
                nextPrayerTime = prayerTimes[prayer];
            }

            if (prayerStartMin <= jetztMinuten) {
                currentPrayer = prayer;
                currentPrayerTime = prayerTimes[prayer];
            }
        });

        document.getElementById("current-prayer").textContent = currentPrayer
            ? `${currentPrayer.toUpperCase()} (${currentPrayerTime})`
            : "Kein aktuelles Gebet";

        document.getElementById("next-prayer").textContent = nextPrayer
            ? `${nextPrayer.toUpperCase()} (${nextPrayerTime})`
            : "Kein weiteres Gebet";

        if (nextPrayerTime) {
            let [nh, nm] = nextPrayerTime.split(":").map(Number);
            let nextPrayerMin = nh * 60 + nm;
            let verbleibendeMinuten = nextPrayerMin - jetztMinuten;
            let stunden = Math.floor(verbleibendeMinuten / 60);
            let minuten = verbleibendeMinuten % 60;

            document.getElementById("next-prayer-countdown").textContent = `${stunden} Std ${minuten} Min`;
        } else {
            document.getElementById("next-prayer-countdown").textContent = "Kein weiteres Gebet";
        }
    }



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
    await ladeIslamischesDatum();
    await ladeFeiertagsCountdowns();
    await ladeHadith();
    await ladeDua();
    await ladeStadtAuswahl();
});
