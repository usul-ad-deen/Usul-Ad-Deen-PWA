document.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");
    }

    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

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
                "Ramadan": "Ramadan", "Shawwal": "Shawwal", "Dhul-Qi'dah": "Dhul-Qi'dah",
                "Dhul-Hijjah": "Dhul-Hijjah"
            };

            let islamischerMonatDeutsch = monateDeutsch[islamischerMonat];
            document.getElementById("islamisches-datum").textContent = 
                `Islamischer Tag: ${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
        } catch (error) {
            console.error("Fehler beim Laden des islamischen Datums:", error);
        }
    }

    function ladeMekkaUhrzeit() {
        let jetztUTC = new Date();
        let mekkaOffset = 3 * 60 * 60 * 1000;
        let mekkaZeit = new Date(jetztUTC.getTime() + mekkaOffset);
        document.getElementById("mekka-uhrzeit").textContent = "Mekka: " + mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
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

    async function ladeGebetszeiten(stadt) {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
        let data = await response.json();

        let fajr = data.data.timings.Fajr;
        let maghrib = data.data.timings.Maghrib;

        document.getElementById("fajr").textContent = fajr;
        document.getElementById("shuruk").textContent = data.data.timings.Sunrise;
        document.getElementById("dhuhr").textContent = data.data.timings.Dhuhr;
        document.getElementById("asr").textContent = data.data.timings.Asr;
        document.getElementById("maghrib").textContent = maghrib;
        document.getElementById("isha").textContent = data.data.timings.Isha;
        document.getElementById("mitternacht").textContent = berechneMitternacht(fajr, maghrib);
        document.getElementById("letztes-drittel").textContent = berechneLetztesDrittel(fajr, maghrib);
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
    }

    ladeIslamischesDatum();
    ladeMekkaUhrzeit();
    ladeGebetszeiten("Berlin");
    ladeHadith();
    ladeDua();
});




