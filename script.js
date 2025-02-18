document.addEventListener("DOMContentLoaded", function () {
    aktualisiereUhrzeitUndDatum();
    bestimmeStandort();
    ladeGebetszeiten();
    ladeHadithDesTages();
    ladeDuaDesTages();
    ladeStadtAuswahl();
});

// 🕰️ **Uhrzeit & Datum aktualisieren**
function aktualisiereUhrzeitUndDatum() {
    function formatDatum(date) {
        return date.toLocaleDateString("de-DE", { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    }

    function updateTime() {
        let nowBerlin = new Date();
        let nowMekka = new Date(nowBerlin.getTime() + 2 * 60 * 60 * 1000); // Mekka ist +2h von Berlin

        document.getElementById("uhrzeitBerlin").textContent = nowBerlin.toLocaleTimeString("de-DE");
        document.getElementById("uhrzeitMekka").textContent = nowMekka.toLocaleTimeString("de-DE");

        document.getElementById("datumGregorianisch").textContent = formatDatum(nowBerlin);

        let islamischesDatum = new Intl.DateTimeFormat("ar-SA", { dateStyle: "full", calendar: "islamic-umalqura" }).format(nowBerlin);
        document.getElementById("datumIslamisch").textContent = islamischesDatum;
    }

    updateTime();
    setInterval(updateTime, 60000);
}

// 📍 **Standort bestimmen & Stadt anzeigen**
function bestimmeStandort() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(response => response.json())
                    .then(data => {
                        let stadt = data.address.city || data.address.town || "Unbekannt";
                        document.getElementById("standortAnzeige").textContent = "Ihr Standort: " + stadt;
                    })
                    .catch(() => zeigeManuelleStadtauswahl());
            },
            function () {
                zeigeManuelleStadtauswahl();
            }
        );
    } else {
        zeigeManuelleStadtauswahl();
    }
}

// 🏙️ **Manuelle Stadtauswahl anzeigen**
function zeigeManuelleStadtauswahl() {
    document.getElementById("standortAnzeige").textContent = "Standort nicht ermittelt.";
    document.getElementById("stadtAuswahlContainer").style.display = "block";
}

// 🌍 **Deutsche Städte zur Auswahl hinzufügen**
function ladeStadtAuswahl() {
    let staedte = ["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Dresden", "Hannover"];
    let select = document.getElementById("stadtAuswahl");

    staedte.forEach(stadt => {
        let option = document.createElement("option");
        option.value = stadt;
        option.textContent = stadt;
        select.appendChild(option);
    });

    select.addEventListener("change", function () {
        document.getElementById("standortAnzeige").textContent = "Ihre Auswahl: " + this.value;
        ladeGebetszeiten();
    });
}

// 🕌 **Gebetszeiten abrufen**
function ladeGebetszeiten() {
    let stadt = document.getElementById("standortAnzeige").textContent.replace("Ihr Standort: ", "");

    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=Germany&method=2`)
        .then(response => response.json())
        .then(data => {
            let timings = data.data.timings;

            document.getElementById("fajr").textContent = timings.Fajr;
            document.getElementById("shuruk").textContent = timings.Sunrise;
            document.getElementById("dhuhr").textContent = timings.Dhuhr;
            document.getElementById("asr").textContent = timings.Asr;
            document.getElementById("maghreb").textContent = timings.Maghrib;
            document.getElementById("isha").textContent = timings.Isha;

            let mitternacht = berechneIslamischeMitternacht(timings.Maghrib, timings.Fajr);
            document.getElementById("mitternacht").textContent = mitternacht;

            let letztesDrittel = berechneLetztesDrittel(timings.Maghrib, timings.Fajr);
            document.getElementById("letztesDrittel").textContent = letztesDrittel;
        });
}

// 🌙 **Islamische Mitternacht berechnen**
function berechneIslamischeMitternacht(maghrib, fajr) {
    let [mH, mM] = maghrib.split(':').map(Number);
    let [fH, fM] = fajr.split(':').map(Number);

    let nachtDauer = ((fH + 24) * 60 + fM) - (mH * 60 + mM);
    let mitternachtMinuten = (mH * 60 + mM) + (nachtDauer / 2);

    return formatTime(mitternachtMinuten);
}

// 🌌 **Letztes Drittel der Nacht berechnen**
function berechneLetztesDrittel(maghrib, fajr) {
    let [mH, mM] = maghrib.split(':').map(Number);
    let [fH, fM] = fajr.split(':').map(Number);

    let nachtDauer = ((fH + 24) * 60 + fM) - (mH * 60 + mM);
    let drittelMinuten = (mH * 60 + mM) + (2 * (nachtDauer / 3));

    return formatTime(drittelMinuten);
}

// ⏰ **Helferfunktion für Zeitformat**
function formatTime(minutes) {
    let h = Math.floor(minutes / 60) % 24;
    let m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// 📜 **Hadith des Tages laden**
function ladeHadithDesTages() {
    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            let zufallsHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadithText").innerHTML = `
                <strong>Arabisch:</strong> ${zufallsHadith.arabisch} <br>
                <strong>Deutsch:</strong> ${zufallsHadith.deutsch} <br>
                <strong>Authentizität:</strong> ${zufallsHadith.authentizitaet}
            `;
        });
}

// 🤲 **Dua des Tages laden**
function ladeDuaDesTages() {
    fetch("dua.json")
        .then(response => response.json())
        .then(data => {
            let zufallsDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("duaText").innerHTML = `
                <strong>Arabisch:</strong> ${zufallsDua.arabisch} <br>
                <strong>Deutsch:</strong> ${zufallsDua.deutsch} <br>
                <strong>Transliteration:</strong> ${zufallsDua.transliteration}
            `;
        });
}
