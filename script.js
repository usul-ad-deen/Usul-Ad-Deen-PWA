document.addEventListener("DOMContentLoaded", async () =>{
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
        document.getElementById("uhrzeit").textContent = `Berlin: ${jetzt.toLocaleTimeString("de-DE", { hour12: false })}`;
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById("mekka-uhrzeit").textContent = `Mekka: ${mekkaZeit.toLocaleTimeString("de-DE", { hour12: false })}`;
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


// 📌 Stadt ermitteln und setzen
    async function ermittleStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    let lat = position.coords.latitude;
                    let lon = position.coords.longitude;

                    try {
                        let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        let data = await response.json();
                        let stadt = data.address.city || data.address.town || data.address.village || "";

                        if (!stadt) { // Falls Stadt leer ist
                            document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen.";
                            await ladeStadtAuswahl();
                            return;
                        }

                        // Wenn die Stadt korrekt ermittelt wurde
                        document.getElementById("stadt-name").textContent = `Standort: ${stadt}`;
                        await ladeGebetszeiten(stadt);
                    } catch (error) {
                        console.error("Fehler bei Standortermittlung:", error);
                        document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen.";
                        await ladeStadtAuswahl();
                    }
                },
                async () => {
                    console.warn("Standort abgelehnt oder nicht verfügbar.");
                    document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen.";
                    await ladeStadtAuswahl();
                }
            );
        } else {
            console.warn("Geolocation nicht unterstützt.");
            document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen.";
            await ladeStadtAuswahl();
        }
    }

    // 📌 Manuelle Stadtauswahl aktivieren
    async function ladeStadtAuswahl() {
        try {
            let response = await fetch("stadt.json");
            let städte = await response.json();
            let dropdown = document.getElementById("stadt-auswahl");
            dropdown.innerHTML = ""; // ❗ Verhindert doppelte Optionen!

            städte.forEach(stadt => {
                let option = document.createElement("option");
                option.value = stadt.name;
                option.textContent = stadt.name;
                dropdown.appendChild(option);
            });

            dropdown.addEventListener("change", async function () {
                let gewählteStadt = this.value;
                document.getElementById("stadt-name").textContent = `Manuelle Auswahl: ${gewählteStadt}`;
                await ladeGebetszeiten(gewählteStadt);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
    }


    // 📌 Gebetszeiten abrufen
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
    "Maghrib": zeitAnpassen(data.data.timings.Maghrib, 1),
    "Isha": zeitAnpassen(data.data.timings.Isha, 0)
};

// 🔹 Mitternacht & letztes Drittel berechnen
let berechneteZeiten = berechneMitternachtUndDrittel(prayerTimes.Fajr, prayerTimes.Maghrib);
let mitternacht = berechneteZeiten.mitternacht;
let letztesDrittel = berechneteZeiten.letztesDrittel;

// 🔹 Sunnah-Gebete
prayerTimes["Duha"] = zeitAnpassen(data.data.timings.Sunrise, 15);
prayerTimes["Nachtgebet"] = prayerTimes.Isha;
prayerTimes["Letztes Drittel"] = letztesDrittel;
prayerTimes["Duha-Ende"] = prayerTimes["Dhuhr"];
prayerTimes["Nachtgebet-Ende"] = prayerTimes["Letztes Drittel"];
prayerTimes["Letztes Drittel-Ende"] = prayerTimes["Fajr"];



            // 🔹 Werte in HTML setzen
            Object.keys(prayerTimes).forEach(prayer => {
                let element = document.getElementById(`${prayer.toLowerCase().replace(/ /g, "-")}`);
                if (element) {
                    element.textContent = prayerTimes[prayer];
                } else {
                    console.warn(`⚠️ Warnung: Kein HTML-Element für ${prayer} gefunden!`);
                }
            });

            // 🔹 Islamische Mitternacht & letztes Drittel setzen
            document.getElementById("mitternacht").textContent = mitternacht;
            document.getElementById("letztes-drittel").textContent = letztesDrittel;

            // 🔹 Gebetszeiten-Countdown starten
            updateGebetszeitenCountdown(prayerTimes);
            setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);
        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Gebetszeiten:", error);
        }
    }
    updateGebetszeitenCountdown(prayerTimes);
setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);


    // 📌 Mitternacht & letztes Drittel berechnen
    function berechneMitternachtUndDrittel(fajr, maghrib) {
        let [fajrH, fajrM] = fajr.split(":").map(Number);
        let [maghribH, maghribM] = maghrib.split(":").map(Number);

        let maghribZeit = maghribH * 60 + maghribM;
        let fajrZeit = fajrH * 60 + fajrM;

        if (fajrZeit < maghribZeit) {
            fajrZeit += 24 * 60;
        }

        let nachtDauer = fajrZeit - maghribZeit;

        // 🔹 Mitternacht berechnen
        let mitternachtMinuten = maghribZeit + (nachtDauer / 2);
        let mitternachtH = Math.floor(mitternachtMinuten / 60) % 24;
        let mitternachtM = Math.floor(mitternachtMinuten % 60);

        // 🔹 Letztes Drittel der Nacht berechnen
        let letztesDrittelMinuten = maghribZeit + (2 * (nachtDauer / 3));
        let letztesDrittelH = Math.floor(letztesDrittelMinuten / 60) % 24;
        let letztesDrittelM = Math.floor(letztesDrittelMinuten % 60);

        // 🔹 Werte formatieren
        let mitternachtZeit = `${String(mitternachtH).padStart(2, '0')}:${String(mitternachtM).padStart(2, '0')}`;
        let letztesDrittelZeit = `${String(letztesDrittelH).padStart(2, '0')}:${String(letztesDrittelM).padStart(2, '0')}`;

        return { mitternacht: mitternachtZeit, letztesDrittel: letztesDrittelZeit };
    }
    
// 📌 Countdown für das nächste & aktuelle Gebet
function updateGebetszeitenCountdown(prayerTimes) {
    let jetzt = new Date();
    let currentTime = jetzt.getHours() * 60 + jetzt.getMinutes();

    let nextPrayer = null, nextPrayerTime = null;
  let previousPrayer = null;
for (let i = 0; i < prayerOrder.length; i++) {
    let prayer = prayerOrder[i];
    if (!prayerTimes[prayer]) continue;

    let [startHours, startMinutes] = prayerTimes[prayer].split(":").map(Number);
    let prayerStartMinutes = startHours * 60 + startMinutes;

    if (prayerStartMinutes > currentTime) {
        nextPrayer = prayer;
        nextPrayerTime = prayerStartMinutes;
        break;
    }
    previousPrayer = prayer; // Setzt das vorherige Gebet als aktuelles
}

// Falls kein aktuelles Gebet gesetzt wurde, das letzte nehmen
currentPrayer = previousPrayer;
currentPrayerEndTime = nextPrayer ? prayerTimes[nextPrayer] : "Nächstes Gebet morgen";



    let prayerOrder = ["Fajr", "Duha", "Dhuhr", "Asr", "Maghrib", "Isha", "Nachtgebet", "Letztes Drittel"];

    for (let i = 0; i < prayerOrder.length; i++) {
        let prayer = prayerOrder[i];
        if (!prayerTimes[prayer]) continue;

        let [startHours, startMinutes] = prayerTimes[prayer].split(":").map(Number);
        let prayerStartMinutes = startHours * 60 + startMinutes;

        let [endHours, endMinutes] = prayerTimes[prayerOrder[i + 1]] ? prayerTimes[prayerOrder[i + 1]].split(":").map(Number) : [24, 0];
        let prayerEndMinutes = endHours * 60 + endMinutes;

        if (currentTime >= prayerStartMinutes && currentTime < prayerEndMinutes) {
            currentPrayer = prayer;
            currentPrayerEndTime = prayerEndMinutes;
        }

        if (prayerStartMinutes > currentTime && !nextPrayer) {
            nextPrayer = prayer;
            nextPrayerTime = prayerStartMinutes;
        }
    }

    
    if (!nextPrayer) {
    nextPrayer = "Fajr";
    nextPrayerTime = parseInt(prayerTimes["Fajr"].split(":")[0]) * 60 + parseInt(prayerTimes["Fajr"].split(":")[1]);
}


    let remainingNextMinutes = nextPrayerTime - currentTime;
    let nextHours = Math.floor(remainingNextMinutes / 60);
    let nextMinutes = remainingNextMinutes % 60;
    document.getElementById("next-prayer").textContent = `Nächstes Gebet: ${nextPrayer} (${prayerTimes[nextPrayer]})`;
    document.getElementById("next-prayer-countdown").textContent = `Beginnt in: ${nextHours} Std ${nextMinutes} Min`;

    if (currentPrayer) {
        let remainingCurrentMinutes = currentPrayerEndTime - currentTime;
        let currentHours = Math.floor(remainingCurrentMinutes / 60);
        let currentMinutes = remainingCurrentMinutes % 60;
        document.getElementById("current-prayer").textContent = `Aktuelles Gebet: ${currentPrayer} (${prayerTimes[currentPrayer]})`;
        document.getElementById("current-prayer-countdown").textContent = `Endet in: ${currentHours} Std ${currentMinutes} Min`;
    }

    // 🛠 Sunnah-Gebete anpassen
    let sunnahOrder = {
        "Duha": "Dhuhr",
        "Nachtgebet": "Letztes Drittel",
        "Letztes Drittel": "Fajr"
    };

    for (let sunnah in sunnahOrder) {
        if (!prayerTimes[sunnah] || !document.getElementById(`${sunnah.toLowerCase()}-countdown`)) continue;

        let start = prayerTimes[sunnah];
        let end = prayerTimes[sunnahOrder[sunnah]];

        let [startH, startM] = start.split(":").map(Number);
        let [endH, endM] = end.split(":").map(Number);

        let startMin = startH * 60 + startM;
        let endMin = endH * 60 + endM;

        let countdownText = document.getElementById(`${sunnah.toLowerCase()}-countdown`);

        if (currentTime < startMin) {
            let countdown = startMin - currentTime;
            countdownText.textContent = `Beginnt in ${Math.floor(countdown / 60)} Std ${countdown % 60} Min`;
        } else if (currentTime >= startMin && currentTime < endMin) {
            let countdown = endMin - currentTime;
            countdownText.textContent = `Begonnen. Endet in ${Math.floor(countdown / 60)} Std ${countdown % 60} Min`;
        } else {
            countdownText.textContent = "Nächstes Gebet morgen";
        }
    }

    // 📌 Standard-Gebete überprüfen
    for (let prayer of prayerOrder) {
        if (!prayerTimes[prayer]) continue;

        let [startH, startM] = prayerTimes[prayer].split(":").map(Number);
        let startMin = startH * 60 + startM;

        let [endH, endM] = prayerTimes[prayerOrder[prayerOrder.indexOf(prayer) + 1]] 
            ? prayerTimes[prayerOrder[prayerOrder.indexOf(prayer) + 1]].split(":").map(Number) 
            : [24, 0];
        let endMin = endH * 60 + endM;

        let countdownText = document.getElementById(`${prayer.toLowerCase()}-countdown`);

        if (currentTime < startMin) {
            let countdown = startMin - currentTime;
            countdownText.textContent = `Beginnt in ${Math.floor(countdown / 60)} Std ${countdown % 60} Min`;
        } else if (currentTime >= startMin && currentTime < endMin) {
            let countdown = endMin - currentTime;
            countdownText.textContent = `Begonnen. Endet in ${Math.floor(countdown / 60)} Std ${countdown % 60} Min`;
        } else {
            countdownText.textContent = "Nächstes Gebet morgen";
        }
    }
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
dropdown.innerHTML = ""; // ❗ Verhindert doppelte Optionen!


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
    ermittleStandort();
    await ladeHadith();
    await ladeDua();
    

});
