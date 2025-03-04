document.addEventListener("DOMContentLoaded", async () => {
    const buchListe = document.getElementById("buch-liste");
    const buchIframe = document.getElementById("buch-iframe");

    async function ladeBücher() {
        try {
            let response = await fetch("bücher.json");
            if (!response.ok) throw new Error("Fehler beim Abrufen der Bücherliste");
            let bücher = await response.json();

            buchListe.innerHTML = ""; // Verhindert doppelte Einträge

            bücher.forEach(buch => {
                let buchItem = document.createElement("li");
                buchItem.innerHTML = `
                    <strong>${buch.titel}</strong><br>
                    ${buch.pdf ? `<a href="${buch.pdf}" download>📥 PDF</a>` : ""}
                    ${buch.epub ? `<a href="${buch.epub}" download>📥 EPUB</a>` : ""}
                    ${buch.pdf ? `<button onclick="zeigeBuch('${buch.pdf}')">📖 Lesen</button>` : ""}
                    ${buch.appstore ? `<a href="${buch.appstore}" target="_blank">📱 App Store</a>` : ""}
                    ${buch.playstore ? `<a href="${buch.playstore}" target="_blank">📱 Play Store</a>` : ""}
                `;
                buchListe.appendChild(buchItem);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Bücher:", error);
        }
    }

    window.zeigeBuch = function(datei) {
        if (datei.endsWith(".pdf")) {
            buchIframe.src = datei;
        } else {
            alert("Dieses Format kann nur heruntergeladen werden.");
        }
    };

    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = `Berlin: ${jetzt.toLocaleTimeString("de-DE", { hour12: false })}`;
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById("mekka-uhrzeit").textContent = `Mekka: ${mekkaZeit.toLocaleTimeString("de-DE", { hour12: false })}`;
    }
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);

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


   async function ermittleStandort() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let stadt = data.address.city || data.address.town || data.address.village || null;

                    if (!stadt) { 
                        document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                        await ladeStadtAuswahl();
                        return;
                    }

                    aktuelleStadt = stadt; // Speichert die aktuelle Stadt
                    document.getElementById("stadt-name").innerHTML = `📍 Ihr Standort: ${stadt} <br> Oder Stadt auswählen:`;
                    document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
                    await ladeGebetszeiten(stadt);
                    await ladeStadtAuswahl();

                } catch (error) {
                    console.error("Fehler bei Standortermittlung:", error);
                    document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                    document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
                    await ladeStadtAuswahl();

                }
            },
            async () => {
                console.warn("Standort abgelehnt oder nicht verfügbar.");
               
                document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
await ladeStadtAuswahl();

            }
        );
    } else {
        console.warn("Geolocation nicht unterstützt.");
       document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
await ladeStadtAuswahl();

    }
}

async function ladeStadtAuswahl() {
    try {
        let response = await fetch("stadt.json");
        let städte = await response.json();
        let dropdown = document.getElementById("stadt-auswahl");

        // ❗ Falls das Dropdown nicht existiert, erstelle es
        if (!dropdown) {
            console.error("❌ Fehler: Dropdown-Element nicht gefunden! Erstelle es jetzt.");
            let container = document.getElementById("stadt-container"); // Stelle sicher, dass es ein Container-Element gibt
            if (!container) {
                console.error("❌ Fehler: Kein Container für die Stadtauswahl gefunden!");
                return;
            }
            dropdown = document.createElement("select");
            dropdown.id = "stadt-auswahl";
            container.appendChild(dropdown); // Füge es ins DOM ein
        }

        dropdown.innerHTML = ""; // ❗ Verhindert doppelte Optionen!

        // Standardoption hinzufügen
        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Stadt auswählen --";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        dropdown.appendChild(defaultOption);

        // Städte hinzufügen
        städte.forEach(stadt => {
            let option = document.createElement("option");
            option.value = stadt.name;
            option.textContent = stadt.name;
            dropdown.appendChild(option);
        });

        // ❗ Zeige das Dropdown an
        dropdown.style.display = "block";

        dropdown.addEventListener("change", async function () {
            let gewählteStadt = this.value;
            aktuelleStadt = gewählteStadt; // Speichert die neue Stadt
            document.getElementById("stadt-name").innerHTML = `📍 Manuelle Auswahl: ${gewählteStadt}`;
            
            if (countdownInterval) {
                clearInterval(countdownInterval); // ❗ Verhindert das Springen der Uhrzeiten!
            }
            
            await ladeGebetszeiten(gewählteStadt);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Städte:", error);
    }
}
   
    
    
    let countdownInterval = null;
    let aktuelleStadt = null;

    // 📌 Reihenfolge der Gebete
    const prayerOrder = ["Letztes Drittel", "Fajr", "Shuruk", "Duha", "Duha-Ende", "Dhuhr", "Asr", "Maghrib", "Isha", "Mitternacht", "Mitternacht-Ende"];

    // 📌 Lade Gebetszeiten
    async function ladeGebetszeiten(stadt) {
        try {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }

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
                "Duha": zeitAnpassen(data.data.timings.Sunrise, 15),
                "Dhuhr": zeitAnpassen(data.data.timings.Dhuhr, 0),
                "Asr": zeitAnpassen(data.data.timings.Asr, 0),
                "Maghrib": zeitAnpassen(data.data.timings.Maghrib, 1),
                "Isha": zeitAnpassen(data.data.timings.Isha, 0),
                "Duha-Ende": zeitAnpassen(data.data.timings.Dhuhr, -10)
            };

            let { mitternacht, letztesDrittel } = berechneMitternachtUndDrittel(prayerTimes.Fajr, prayerTimes.Maghrib);

            prayerTimes["Letztes Drittel"] = letztesDrittel;
            prayerTimes["Mitternacht"] = mitternacht;
            prayerTimes["Mitternacht-Ende"] = zeitAnpassen(mitternacht, 1);
            

            // 🔹 Setze Gebetszeiten in die Tabelle
            Object.keys(prayerTimes).forEach(prayer => {
                let element = document.getElementById(`${prayer.toLowerCase().replace(/ /g, "-")}`);
                if (element) {
                    element.textContent = prayerTimes[prayer].slice(0, 5);
                }
            });

            updateGebetszeitenCountdown(prayerTimes);
            // Stoppe vorherigen Countdown vor dem Start eines neuen Countdowns
            if (countdownInterval) {
            clearInterval(countdownInterval);
}

            // Starte neuen Countdown
        countdownInterval = setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);

            
        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Gebetszeiten:", error);
        }
    }

    // 📌 Berechnung von Mitternacht & letztem Drittel
    function berechneMitternachtUndDrittel(fajr, maghrib) {
        let [fajrH, fajrM] = fajr.split(":").map(Number);
        let [maghribH, maghribM] = maghrib.split(":").map(Number);

        let maghribZeit = maghribH * 60 + maghribM;
        let fajrZeit = fajrH * 60 + fajrM;

        if (fajrZeit < maghribZeit) {
            fajrZeit += 24 * 60;
        }

        let nachtDauer = fajrZeit - maghribZeit;

        let mitternachtMinuten = maghribZeit + (nachtDauer / 2);
        let mitternachtH = Math.floor(mitternachtMinuten / 60) % 24;
        let mitternachtM = Math.floor(mitternachtMinuten % 60);

        let letztesDrittelMinuten = maghribZeit + (2 * (nachtDauer / 3));
        let letztesDrittelH = Math.floor(letztesDrittelMinuten / 60) % 24;
        let letztesDrittelM = Math.floor(letztesDrittelMinuten % 60);

        return {
            mitternacht: `${String(mitternachtH).padStart(2, '0')}:${String(mitternachtM).padStart(2, '0')}`,
            letztesDrittel: `${String(letztesDrittelH).padStart(2, '0')}:${String(letztesDrittelM).padStart(2, '0')}`
        };
    }

    // 📌 Gebetszeiten-Countdown
    function updateGebetszeitenCountdown(prayerTimes) {

        
        let jetzt = new Date();
        let currentTime = jetzt.getHours() * 60 + jetzt.getMinutes();
        let currentSeconds = jetzt.getSeconds();

        let nextPrayer = null, nextPrayerTime = null, currentPrayer = null, currentPrayerEndTime = null;

        for (let i = 0; i < prayerOrder.length - 1; i++) {
            let prayer = prayerOrder[i];
            if (!prayerTimes[prayer]) continue;

            let [startH, startM] = prayerTimes[prayer].split(":").map(Number);
            let prayerStartMinutes = startH * 60 + startM;

            let [endH, endM] = prayerTimes[prayerOrder[i + 1]].split(":").map(Number);
            let prayerEndMinutes = endH * 60 + endM;

            if (prayerEndMinutes < prayerStartMinutes) {
                prayerEndMinutes += 24 * 60;
            }

            let countdownElement = document.getElementById(`${prayer.toLowerCase().replace(/ /g, "-")}-countdown`);
            if (!countdownElement) continue;

            if (currentTime < prayerStartMinutes) {
                let remainingMinutes = prayerStartMinutes - currentTime - 1;
                let remainingSeconds = 60 - currentSeconds;
                countdownElement.textContent = `Beginnt in: ${formatTime(remainingMinutes, remainingSeconds, false)}`;

                if (!nextPrayer) {
                    nextPrayer = prayer;
                    nextPrayerTime = prayerStartMinutes;
                }
            }
            else if (currentTime >= prayerStartMinutes && currentTime < prayerEndMinutes) {
                let remainingMinutes = prayerEndMinutes - currentTime - 1;
                let remainingSeconds = 60 - currentSeconds;
                countdownElement.textContent = `Begonnen. Noch: ${formatTime(remainingMinutes, remainingSeconds, false)}`;
                currentPrayer = prayer;
                currentPrayerEndTime = prayerEndMinutes;
            }
            else {
                countdownElement.textContent = "Bereits abgelaufen.";
            }
        }

        let nextHours = Math.floor((nextPrayerTime - currentTime - 1) / 60);
        let nextMinutes = (nextPrayerTime - currentTime - 1) % 60;
        let nextSeconds = 60 - currentSeconds;

        document.getElementById("next-prayer").textContent = `Nächstes Gebet: ${nextPrayer} (${prayerTimes[nextPrayer].slice(0, 5)})`;
        document.getElementById("next-prayer-countdown").textContent = `Beginnt in: ${formatTime(nextHours * 60 + nextMinutes, nextSeconds, true)}`;

        if (currentPrayer) {
            let remainingMinutes = currentPrayerEndTime - currentTime - 1;
            let remainingSeconds = 60 - currentSeconds;
            document.getElementById("current-prayer").textContent = `Aktuelles Gebet: ${currentPrayer} (${prayerTimes[currentPrayer].slice(0, 5)})`;
            document.getElementById("current-prayer-countdown").textContent = `Endet in: ${formatTime(remainingMinutes, remainingSeconds, true)}`;
        }
    }

    function formatTime(minutes, seconds, showSeconds) {
        let h = Math.floor(minutes / 60);
        let m = minutes % 60;
        let s = seconds;

        return showSeconds
            ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }



    ermittleStandort();
    await ladeBücher();
});
