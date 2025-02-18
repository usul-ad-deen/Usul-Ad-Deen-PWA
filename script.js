document.addEventListener("DOMContentLoaded", function () {
    aktualisiereUhrzeitUndDatum();
    ladeGebetszeiten();
    ladeHadithDesTages();
    ladeDuaDesTages();
    ladeStadtAuswahl();
    bestimmeStandort();
});

// Aktuelle Uhrzeit & Datum setzen
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

// Standort bestimmen und Stadt anzeigen
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

// Manuelle Stadtauswahl anzeigen
function zeigeManuelleStadtauswahl() {
    document.getElementById("standortAnzeige").textContent = "Standort nicht ermittelt.";
    document.getElementById("stadtAuswahlContainer").style.display = "block";
}

// Liste mit deutschen Städten laden
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
