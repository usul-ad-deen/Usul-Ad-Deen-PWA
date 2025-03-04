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
                let hijri = data.data.hijri;
                document.getElementById("islamisches-datum").textContent = `${hijri.day}. ${hijri.month.en} ${hijri.year}`;
            }
        } catch (error) {
            console.error("Fehler beim Abrufen des islamischen Datums:", error);
        }
    }
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
                        let stadt = data.address.city || data.address.town || data.address.village || "Unbekannt";

                        document.getElementById("stadt-name").textContent = `📍 Ihr Standort: ${stadt}`;
                        await ladeGebetszeiten(stadt);
                    } catch (error) {
                        console.error("Fehler bei Standortermittlung:", error);
                    }
                },
                () => {
                    console.warn("Standortabfrage abgelehnt.");
                }
            );
        }
    }

    async function ladeGebetszeiten(stadt) {
        try {
            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();
            let timings = data.data.timings;

            let gebete = {
                "Fajr": timings.Fajr,
                "Shuruk": timings.Sunrise,
                "Duha": addMinutes(timings.Sunrise, 15),
                "Duha-Ende": addMinutes(timings.Dhuhr, -10),
                "Dhuhr": timings.Dhuhr,
                "Asr": timings.Asr,
                "Maghrib": timings.Maghrib,
                "Isha": timings.Isha
            };

            let { mitternacht, letztesDrittel } = berechneMitternachtUndDrittel(timings.Maghrib, timings.Fajr);
            gebete["Mitternacht"] = mitternacht;
            gebete["Letztes Drittel"] = letztesDrittel;

            Object.keys(gebete).forEach(gebet => {
                let element = document.getElementById(gebet.toLowerCase().replace(" ", "-"));
                if (element) {
                    element.textContent = gebete[gebet].slice(0, 5);
                }
            });

            updateGebetszeitenCountdown(gebete);
        } catch (error) {
            console.error("Fehler beim Abrufen der Gebetszeiten:", error);
        }
    }

    function addMinutes(zeit, minuten) {
        let [h, m] = zeit.split(":").map(Number);
        let neueZeit = new Date();
        neueZeit.setHours(h, m + minuten);
        return neueZeit.toLocaleTimeString("de-DE", { hour12: false }).slice(0, 5);
    }

    function berechneMitternachtUndDrittel(maghrib, fajr) {
        let [maghribH, maghribM] = maghrib.split(":").map(Number);
        let [fajrH, fajrM] = fajr.split(":").map(Number);

        let maghribMinuten = maghribH * 60 + maghribM;
        let fajrMinuten = fajrH * 60 + fajrM + 24 * 60;
        let nachtDauer = fajrMinuten - maghribMinuten;

        let mitternachtMinuten = maghribMinuten + (nachtDauer / 2);
        let letztesDrittelMinuten = maghribMinuten + (2 * (nachtDauer / 3));

        return {
            mitternacht: formatTime(mitternachtMinuten),
            letztesDrittel: formatTime(letztesDrittelMinuten)
        };
    }

    function formatTime(minuten) {
        let h = Math.floor(minuten / 60) % 24;
        let m = minuten % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    function updateGebetszeitenCountdown(gebete) {
        let jetzt = new Date();
        let currentPrayer = Object.entries(gebete).find(([_, zeit]) => jetzt.toLocaleTimeString("de-DE", { hour12: false }) < zeit);
        
        document.getElementById("current-prayer").textContent = `Aktuelles Gebet: ${currentPrayer ? currentPrayer[0] : "Keines"}`;
        document.getElementById("next-prayer").textContent = `Nächstes Gebet: ${currentPrayer ? currentPrayer[1] : "Fajr"}`;
    }

    ermittleStandort();
    await ladeBücher();
});
