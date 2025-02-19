document.addEventListener("DOMContentLoaded", function () {
    const gebetszeitenFelder = {
        fajr: document.getElementById("fajr"),
        shuruk: document.getElementById("shuruk"),
        dhuhr: document.getElementById("dhuhr"),
        asr: document.getElementById("asr"),
        maghrib: document.getElementById("maghrib"),
        isha: document.getElementById("isha"),
        islamischeMitternacht: document.getElementById("islamische-mitternacht"),
        letztesDrittel: document.getElementById("letztes-drittel")
    };

    function setzeStandardwerte() {
        Object.values(gebetszeitenFelder).forEach(feld => feld.textContent = "00:00");
        document.getElementById("stadtname").textContent = "Unbekannt";
    }

    function ladeGebetszeiten(lat, lon) {
        const apiURL = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`;
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    const t = data.data.timings;
                    gebetszeitenFelder.fajr.textContent = t.Fajr;
                    gebetszeitenFelder.shuruk.textContent = t.Sunrise;
                    gebetszeitenFelder.dhuhr.textContent = t.Dhuhr;
                    gebetszeitenFelder.asr.textContent = t.Asr;
                    gebetszeitenFelder.maghrib.textContent = t.Maghrib;
                    gebetszeitenFelder.isha.textContent = t.Isha;

                    const fajrZeit = konvertiereZuDate(t.Fajr);
                    const maghribZeit = konvertiereZuDate(t.Maghrib);
                    const mitternacht = berechneMitternacht(fajrZeit, maghribZeit);
                    const letztesDrittel = berechneLetztesDrittel(fajrZeit, mitternacht);

                    gebetszeitenFelder.islamischeMitternacht.textContent = mitternacht;
                    gebetszeitenFelder.letztesDrittel.textContent = letztesDrittel;
                }
            })
            .catch(() => setzeStandardwerte());
    }

    function konvertiereZuDate(zeit) {
        const [stunden, minuten] = zeit.split(":").map(Number);
        return new Date(new Date().setHours(stunden, minuten, 0, 0));
    }

    function berechneMitternacht(fajr, maghrib) {
        const mitternacht = new Date((fajr.getTime() + maghrib.getTime()) / 2);
        return mitternacht.getHours().toString().padStart(2, "0") + ":" + mitternacht.getMinutes().toString().padStart(2, "0");
    }

    function berechneLetztesDrittel(fajr, mitternacht) {
        const letztesDrittel = new Date(mitternacht.getTime() + ((fajr.getTime() - mitternacht.getTime()) / 3) * 2);
        return letztesDrittel.getHours().toString().padStart(2, "0") + ":" + letztesDrittel.getMinutes().toString().padStart(2, "0");
    }

    function aktualisiereUhrzeiten() {
        const jetzt = new Date();
        document.getElementById("uhrzeit-berlin").textContent = jetzt.toLocaleTimeString("de-DE");

        const mekkazeit = new Date(jetzt.getTime() + 2 * 3600000);
        document.getElementById("uhrzeit-mekka").textContent = mekkazeit.toLocaleTimeString("de-DE");

        document.getElementById("gregorianisches-datum").textContent = jetzt.toLocaleDateString("de-DE");
        document.getElementById("islamisches-datum").textContent = "Islamisches Datum laden...";
        ladeIslamischesDatum();
    }

    function ladeIslamischesDatum() {
        fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toISOString().split("T")[0])
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    document.getElementById("islamisches-datum").textContent = data.data.hijri.date;
                }
            });
    }

    function ladeHadith() {
        fetch("hadith.json")
            .then(response => response.json())
            .then(data => {
                const hadith = data[0];
                document.getElementById("hadith-arabisch").textContent = hadith.arabisch;
                document.getElementById("hadith-deutsch").textContent = hadith.deutsch;
                document.getElementById("hadith-authentizität").textContent = "Authentizität: " + hadith.authentizität;
            });
    }

    function ladeDua() {
        fetch("dua.json")
            .then(response => response.json())
            .then(data => {
                const dua = data[0];
                document.getElementById("dua-arabisch").textContent = dua.arabisch;
                document.getElementById("dua-deutsch").textContent = dua.deutsch;
                document.getElementById("dua-transliteration").textContent = "Transliteration: " + dua.transliteration;
                document.getElementById("dua-quellenangabe").textContent = "Quelle: " + dua.quelle;
                document.getElementById("dua-authentizität").textContent = "Authentizität: " + dua.authentizität;
            });
    }

    function bestimmeStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                        .then(response => response.json())
                        .then(data => {
                            document.getElementById("stadtname").textContent = data.address.city || "Unbekannte Stadt";
                            ladeGebetszeiten(lat, lon);
                        });
                },
                () => {
                    document.getElementById("stadtname").textContent = "Bitte Stadt manuell wählen";
                    setzeStandardwerte();
                }
            );
        } else {
            setzeStandardwerte();
        }
    }

    setInterval(aktualisiereUhrzeiten, 60000);
    aktualisiereUhrzeiten();
    bestimmeStandort();
    ladeHadith();
    ladeDua();
});
