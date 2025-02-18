document.addEventListener("DOMContentLoaded", function () {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = "Uhrzeit: " + jetzt.toLocaleTimeString("de-DE");
    }
    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

    function ladeHadithDesTages() {
        fetch("hadith.json")
            .then(response => response.json())
            .then(data => {
                let index = new Date().getDate() % data.length;
                document.getElementById("hadith-text").textContent = data[index].arabisch;
                document.getElementById("hadith-quelle").textContent = data[index].quelle;
            });
    }
    ladeHadithDesTages();

    function ladeDuaDesTages() {
        fetch("dua.json")
            .then(response => response.json())
            .then(data => {
                let index = new Date().getDate() % data.length;
                document.getElementById("dua-text").textContent = data[index].arabisch;
                document.getElementById("dua-transliteration").textContent = data[index].transliteration;
                document.getElementById("dua-bedeutung").textContent = data[index].bedeutung;
            });
    }
    ladeDuaDesTages();
    
    function ladeGebetszeiten(stadt) {
        fetch("gebetszeiten.json")
            .then(response => response.json())
            .then(data => {
                let zeiten = data[stadt];
                document.getElementById("fajr").textContent = zeiten.fajr;
                document.getElementById("shuruk").textContent = zeiten.shuruk;
                document.getElementById("dhuhr").textContent = zeiten.dhuhr;
                document.getElementById("asr").textContent = zeiten.asr;
                document.getElementById("maghrib").textContent = zeiten.maghrib;
                document.getElementById("isha").textContent = zeiten.isha;
                document.getElementById("mitternacht").textContent = zeiten.mitternacht;
                document.getElementById("letztes-drittel").textContent = zeiten.letztes_drittel;
            });
    }

    document.getElementById("stadt-auswahl").addEventListener("change", function () {
        let stadt = this.value;
        if (stadt) {
            document.getElementById("standort-name").textContent = stadt;
            ladeGebetszeiten(stadt);
        }
    });

    ladeGebetszeiten("Berlin");
});
