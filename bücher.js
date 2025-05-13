document.addEventListener("DOMContentLoaded", async () => {
    const buchSuche = document.getElementById("buch-suche");
    const buchGrid = document.getElementById("buecher-grid");
    let buchDaten = [];

    async function ladeBücher() {
        try {
            let response = await fetch("bücher.json");
            if (!response.ok) throw new Error("Fehler beim Abrufen der Bücherliste");
            buchDaten = await response.json();
            zeigeBücher(buchDaten);
        } catch (error) {
            console.error("Fehler beim Laden der Bücher:", error);
            buchGrid.innerHTML = "<p>❌ Bücher konnten nicht geladen werden.</p>";
        }
    }

    function zeigeBücher(liste) {
        buchGrid.innerHTML = "";
        liste.forEach(buch => {
            const tile = document.createElement("div");
            tile.className = "buch-tile";
            tile.innerHTML = `
                <img src="${buch.cover || 'icons/book-placeholder.png'}" alt="${buch.titel}">
                <h3>${buch.titel}</h3>
                <p><strong>Autor:</strong> ${buch.autor || 'Unbekannt'}</p>
                <p><strong>Sprache:</strong> ${buch.sprache || 'Deutsch'} | <strong>Format:</strong> ${buch.format || 'PDF/EPUB'}</p>
                <p>${buch.beschreibung || ''}</p>
                <div class="buch-buttons">
                    ${buch.pdf ? `<a href="${buch.pdf}" target="_blank">📖 PDF öffnen</a>` : ""}
                    ${buch.epub ? `<a href="${buch.epub}" download>⬇️ EPUB</a>` : ""}
                    ${buch.readerLink ? `<a href="${buch.readerLink}" target="_blank">📖 EPUB lesen</a>` : ""}
                    ${buch.appstore ? `<a href="${buch.appstore}" target="_blank">📱 App Store</a>` : ""}
                    ${buch.playstore ? `<a href="${buch.playstore}" target="_blank">📱 Play Store</a>` : ""}
                </div>
            `;
            buchGrid.appendChild(tile);
        });
    }

    buchSuche.addEventListener("input", () => {
        const query = buchSuche.value.toLowerCase();
        const gefiltert = buchDaten.filter(b =>
            b.titel.toLowerCase().includes(query) ||
            (b.autor && b.autor.toLowerCase().includes(query))
        );
        zeigeBücher(gefiltert);
    });

    // Uhrzeit & Datum
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = `Berlin: ${jetzt.toLocaleTimeString("de-DE", { hour12: false })}`;
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById("mekka-uhrzeit").textContent = `Mekka: ${mekkaZeit.toLocaleTimeString("de-DE", { hour12: false })}`;
    }
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);

    // Islamisches Datum
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

    // Standortermittlung & Gebetszeiten
    let countdownInterval = null;
    let aktuelleStadt = null;

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

                        aktuelleStadt = stadt;
                        document.getElementById("stadt-name").innerHTML = `📍 Ihr Standort: ${stadt} <br> Oder Stadt auswählen:`;
                        document.getElementById("stadt-container").style.display = "block";
                        await ladeGebetszeiten(stadt);
                        await ladeStadtAuswahl();

                    } catch (error) {
                        console.error("Fehler bei Standortermittlung:", error);
                        document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                        document.getElementById("stadt-container").style.display = "block";
                        await ladeStadtAuswahl();
                    }
                },
                async () => {
                    console.warn("Standort abgelehnt oder nicht verfügbar.");
                    document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                    document.getElementById("stadt-container").style.display = "block";
                    await ladeStadtAuswahl();
                }
            );
        } else {
            console.warn("Geolocation nicht unterstützt.");
            document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
            document.getElementById("stadt-container").style.display = "block";
            await ladeStadtAuswahl();
        }
    }

    async function ladeStadtAuswahl() {
        try {
            let response = await fetch("stadt.json");
            let städte = await response.json();
            let dropdown = document.getElementById("stadt-auswahl");

            if (!dropdown) {
                let container = document.getElementById("stadt-container");
                if (!container) return;
                dropdown = document.createElement("select");
                dropdown.id = "stadt-auswahl";
                container.appendChild(dropdown);
            }

            dropdown.innerHTML = "";
            let defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "-- Stadt auswählen --";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            dropdown.appendChild(defaultOption);

            städte.forEach(stadt => {
                let option = document.createElement("option");
                option.value = stadt.name;
                option.textContent = stadt.name;
                dropdown.appendChild(option);
            });

            dropdown.style.display = "block";

            dropdown.addEventListener("change", async function () {
                let gewählteStadt = this.value;
                aktuelleStadt = gewählteStadt;
                document.getElementById("stadt-name").innerHTML = `📍 Manuelle Auswahl: ${gewählteStadt}`;
                if (countdownInterval) clearInterval(countdownInterval);
                await ladeGebetszeiten(gewählteStadt);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
    }

    async function ladeGebetszeiten(stadt) {
        try {
            if (countdownInterval) clearInterval(countdownInterval);

            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();
            if (!data || !data.data || !data.data.timings) return;

            let prayerTimes = {
                "Fajr": data.data.timings.Fajr,
                "Shuruk": data.data.timings.Sunrise,
                "Duha": data.data.timings.Sunrise,
                "Dhuhr": data.data.timings.Dhuhr,
                "Asr": data.data.timings.Asr,
                "Maghrib": data.data.timings.Maghrib,
                "Isha": data.data.timings.Isha
            };

            document.getElementById("next-prayer").textContent = `Nächstes Gebet: ${Object.keys(prayerTimes)[0]}`;
            document.getElementById("next-prayer-countdown").textContent = "";
        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Gebetszeiten:", error);
        }
    }

    // Start
    updateUhrzeit();
    ladeIslamischesDatum();
    ermittleStandort();
    await ladeBücher();
});
