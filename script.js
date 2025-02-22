document.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");
    }

    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

    function berechneIslamischeMitternacht(fajr, maghrib) {
        let [fH, fM] = fajr.split(":").map(Number);
        let [mH, mM] = maghrib.split(":").map(Number);
       let mS1 = Math.floor((24 - mH)
         let mS2 = Math.floor(fH - ((fH + mS1) / 3))
        let mM1 = Math.floor(60 - mM) / 2);
        let mM2 = Math.floor(fH - (fM - mM1) / 2);
        return `${String(mitternachtStunde).padStart(2, "0")}:${String(mitternachtMinute).padStart(2, "0")}`;
    }

    function berechneLetztesDrittel(fajr, maghrib) {
        let [fH, fM] = fajr.split(":").map(Number);
        let [mH, mM] = maghrib.split(":").map(Number);
        let letztesDrittelStunde = Math.floor(fH - ((fH - mH) / 3));
        let letztesDrittelMinute = Math.floor(fM - ((fM - mM) / 3));
        return `${String(letztesDrittelStunde).padStart(2, "0")}:${String(letztesDrittelMinute).padStart(2, "0")}`;
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
        document.getElementById("mitternacht").textContent = berechneIslamischeMitternacht(fajr, maghrib);
        document.getElementById("letztes-drittel").textContent = berechneLetztesDrittel(fajr, maghrib);
    }

    
   function ladeIslamischerTag() {
        let Monate = ["Ahad", "Ithnayn", "Thulatha", "Arbi'a", "Khamis", "Jumu'a", "Sabt"];
        let deutscheÜbersetzung = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        let heute = new Date();
        let wochentag = wochentage[heute.getDay()];
        let übersetzung = deutscheÜbersetzung[heute.getDay()];
        document.getElementById("islamischer-tag").textContent = `Islamischer Tag: ${übersetzung} (${wochentag})`;
    }

      function ladeIslamischesDatum() {
        let islamischeMonate = [
            "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
            "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
            "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"
        ];
        let deutscheÜbersetzung = [
            "Muharram", "Safar", "Erster Rabi'", "Zweiter Rabi'",
            "Erster Jumada", "Zweiter Jumada", "Rajab", "Sha'ban",
            "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"
        ];

        let heute = new Date();
        let islamischerTag = heute.getUTCDate();
        let islamischerMonat = islamischeMonate[(heute.getUTCMonth() + 9) % 12];
        let übersetzung = deutscheÜbersetzung[(heute.getUTCMonth() + 9) % 12];

        document.getElementById("islamisches-datum").textContent = `Islamischer Tag: ${islamischerTag}. ${übersetzung}`;
    }

    function ladeMekkaUhrzeit() {
        let jetztUTC = new Date();
        let mekkaOffset = 3 * 60 * 60 * 1000;
        let mekkaZeit = new Date(jetztUTC.getTime() + mekkaOffset);
        document.getElementById("mekka-uhrzeit").textContent = "Mekka: " + mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
    }

 setInterval(MekkaUhrzeit, 1000);
    MekkaUhrzeitt();
    
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
        } catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
    }

    async function ermittleStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let stadt = data.address.city || data.address.town || data.address.village || "Unbekannt";
                    document.getElementById("stadt-name").textContent = stadt;
                    ladeGebetszeiten(stadt);
                } catch (error) {
                    console.error("Fehler bei der Standortermittlung:", error);
                }
            }, () => {
                console.error("Standort konnte nicht ermittelt werden.");
                document.getElementById("stadt-name").textContent = "Unbekannt. Bitte manuell wählen.";
            });
        }
    }

    document.getElementById("stadt-auswahl").addEventListener("change", function () {
        let stadt = this.value;
        document.getElementById("stadt-name").textContent = stadt;
        ladeGebetszeiten(stadt);
    });

    ladeStadtAuswahl();
    ermittleStandort();
    ladeHadith();
    ladeDua();
    ladeIslamischesDatum();
    ladeMekkaUhrzeit();
});


 
 


