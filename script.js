document.addEventListener("DOMContentLoaded", function () {
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);
    ladeHadithDesTages();
    ladeDuaDesTages();
    ladeStadtAuswahl();
    ermittleStandort();
});

function updateUhrzeit() {
    let now = new Date();
    let uhrzeit = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    let datum = now.toLocaleDateString("de-DE");

    document.getElementById("aktuelle-uhrzeit").textContent = `Uhrzeit: ${uhrzeit}`;
    document.getElementById("aktuelles-datum").textContent = `Datum: ${datum}`;
}

async function ladeHadithDesTages() {
    const response = await fetch("hadith.json");
    const hadithe = await response.json();
    const zufaelligerHadith = hadithe[Math.floor(Math.random() * hadithe.length)];

    document.getElementById("hadith-arabisch").textContent = zufaelligerHadith.arabisch;
    document.getElementById("hadith-deutsch").textContent = zufaelligerHadith.deutsch;
    document.getElementById("hadith-quelle").textContent = `Quelle: ${zufaelligerHadith.quelle}`;
    document.getElementById("hadith-authentizitaet").textContent = `Authentizität: ${zufaelligerHadith.authentizität}`;
}

async function ladeDuaDesTages() {
    const response = await fetch("dua.json");
    const duas = await response.json();
    const zufaelligeDua = duas[Math.floor(Math.random() * duas.length)];

    document.getElementById("dua-arabisch").textContent = zufaelligeDua.arabisch;
    document.getElementById("dua-deutsch").textContent = zufaelligeDua.deutsch;
    document.getElementById("dua-transliteration").textContent = `Transliteration: ${zufaelligeDua.transliteration}`;
    document.getElementById("dua-quelle").textContent = `Quelle: ${zufaelligeDua.quelle}`;
}

async function ladeStadtAuswahl() {
    const response = await fetch("stadt.json");
    const staedte = await response.json();
    let select = document.getElementById("stadt-auswahl");

    staedte.forEach(stadt => {
        let option = document.createElement("option");
        option.value = stadt.name;
        option.textContent = stadt.name;
        select.appendChild(option);
    });

    select.addEventListener("change", function () {
        document.getElementById("standort").textContent = `Ihr Standort: ${this.value}`;
    });
}

function ermittleStandort() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`)
                .then(response => response.json())
                .then(data => {
                    let stadt = data.address.city || data.address.town || data.address.village || "Unbekannt";
                    document.getElementById("standort").textContent = `Ihr Standort: ${stadt}`;
                })
                .catch(() => {
                    document.getElementById("standort").textContent = "Standort konnte nicht ermittelt werden.";
                });
        }, () => {
            document.getElementById("standort").textContent = "Standortermittlung deaktiviert.";
        });
    } else {
        document.getElementById("standort").textContent = "Standortermittlung nicht unterstützt.";
    }
}
