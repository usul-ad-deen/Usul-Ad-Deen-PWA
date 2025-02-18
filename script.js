document.addEventListener("DOMContentLoaded", () => {
    aktualisiereUhrzeit();
    ladeHadithDesTages();
    ladeDuaDesTages();
    ermittleStandort();

    setInterval(aktualisiereUhrzeit, 1000);
});

function aktualisiereUhrzeit() {
    let jetzt = new Date();
    let uhrzeit = jetzt.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let datum = jetzt.toLocaleDateString("de-DE", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    document.getElementById("aktuelleUhrzeit").textContent = uhrzeit;
    document.getElementById("aktuellesDatum").textContent = datum;
}

function ermittleStandort() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(response => response.json())
                .then(data => {
                    let stadt = data.address.city || data.address.town || "Unbekannt";
                    document.getElementById("standortAnzeige").textContent = "Ihr Standort: " + stadt;
                    ladeGebetszeiten(lat, lon);
                });
        }, () => {
            document.getElementById("standortAnzeige").textContent = "Standort konnte nicht ermittelt werden";
            document.getElementById("stadtAuswahlContainer").style.display = "block";
        });
    }
}

function ladeGebetszeiten(lat, lon) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("fajr").textContent = data.data.timings.Fajr;
            document.getElementById("shuruk").textContent = data.data.timings.Sunrise;
            document.getElementById("dhuhr").textContent = data.data.timings.Dhuhr;
            document.getElementById("asr").textContent = data.data.timings.Asr;
            document.getElementById("maghreb").textContent = data.data.timings.Maghrib;
            document.getElementById("isha").textContent = data.data.timings.Isha;
            berechneNachtzeiten(data.data.timings.Fajr, data.data.timings.Isha);
        });
}

function berechneNachtzeiten(fajr, isha) {
    let fajrZeit = new Date("1970-01-01T" + fajr + "Z").getTime();
    let ishaZeit = new Date("1970-01-01T" + isha + "Z").getTime();

    let mitternacht = new Date((fajrZeit + ishaZeit) / 2).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });
    let letztesDrittel = new Date((2 * fajrZeit + ishaZeit) / 3).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });

    document.getElementById("mitternacht").textContent = mitternacht;
    document.getElementById("letztesDrittel").textContent = letztesDrittel;
}
