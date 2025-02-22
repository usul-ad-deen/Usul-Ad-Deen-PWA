document.addEventListener("DOMContentLoaded", function () {
    // Standort ermitteln
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById("stadtname").textContent = data.address.city || "Unbekannte Stadt";
                });
            ladeGebetszeiten(latitude, longitude);
        }, () => {
            document.getElementById("stadtname").textContent = "Bitte Stadt manuell wählen";
        });
    }

    function berechneNachtzeiten(fajr, isha) {
        const fajrZeit = new Date(`1970-01-01T${fajr}:00`);
        const ishaZeit = new Date(`1970-01-01T${isha}:00`);

        const nachtLaenge = (fajrZeit - ishaZeit) / 1000 / 60; 
        const mitternachtZeit = new Date(ishaZeit.getTime() + (nachtLaenge / 2) * 60000);
        const letztesDrittelZeit = new Date(fajrZeit.getTime() - (nachtLaenge / 3) * 60000);

        document.getElementById("islamische-mitternacht").textContent = mitternachtZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        document.getElementById("letztes-drittel").textContent = letztesDrittelZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

    function aktualisiereUhrzeiten() {
        const jetzt = new Date();
        document.getElementById("uhrzeit-berlin").textContent = jetzt.toLocaleTimeString("de-DE");
        
        const mekkazeit = new Date(jetzt.getTime() + 2 * 3600000);
        document.getElementById("uhrzeit-mekka").textContent = mekkazeit.toLocaleTimeString("de-DE");

        document.getElementById("gregorianisches-datum").textContent = jetzt.toLocaleDateString("de-DE");
        
        const islamischesDatum = new Intl.DateTimeFormat("ar-SA", { dateStyle: "full" }).format(jetzt);
        document.getElementById("islamisches-datum").textContent = islamischesDatum;
    }
    aktualisiereUhrzeiten();
    setInterval(aktualisiereUhrzeiten, 60000);

    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            const zufaelligerHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadith-arabisch").textContent = zufaelligerHadith.arabisch;
            document.getElementById("hadith-deutsch").textContent = zufaelligerHadith.deutsch;
            document.getElementById("hadith-authentizität").textContent = "Authentizität: " + zufaelligerHadith.authentizität;
        });

    fetch("dua.json")
        .then(response => response.json())
        .then(data => {
            const zufaelligeDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("dua-arabisch").textContent = zufaelligeDua.arabisch;
            document.getElementById("dua-deutsch").textContent = zufaelligeDua.deutsch;
            document.getElementById("dua-transliteration").textContent = zufaelligeDua.transliteration;
            document.getElementById("dua-quellenangabe").textContent = "Quelle: " + zufaelligeDua.quelle;
            document.getElementById("dua-authentizität").textContent = "Authentizität: " + zufaelligeDua.authentizität;
        });
});
