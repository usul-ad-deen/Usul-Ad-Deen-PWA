document.addEventListener("DOMContentLoaded", function () {
    setInterval(updateTime, 1000);
    ladeGebetszeiten();
    ladeHadith();
    ladeDua();
});

function updateTime() {
    let now = new Date();
    document.getElementById("deutsche-zeit").textContent = "Berlin: " + now.toLocaleTimeString('de-DE');
    
    let mekkaZeit = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    document.getElementById("mekka-zeit").textContent = "Mekka: " + mekkaZeit.toLocaleTimeString('de-DE');

    let islamischerTag = "10 Sha'ban 1446";
    let gregorianischerTag = now.toLocaleDateString('de-DE');
    document.getElementById("islamischer-tag").textContent = "Islamischer Tag: " + islamischerTag;
    document.getElementById("gregorianischer-tag").textContent = "Gregorianischer Tag: " + gregorianischerTag;
}

function ladeGebetszeiten() {
    navigator.geolocation.getCurrentPosition(position => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        document.getElementById("standort").textContent = "Berlin"; // Beispielhafter Wert

        fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`)
            .then(response => response.json())
            .then(data => {
                let gebetszeiten = data.data.timings;
                document.getElementById("gebetszeiten-liste").innerHTML = `
                    <li><b>Fajr:</b> ${gebetszeiten.Fajr}</li>
                    <li><b>Dhuhr:</b> ${gebetszeiten.Dhuhr}</li>
                    <li><b>Asr:</b> ${gebetszeiten.Asr}</li>
                    <li><b>Maghrib:</b> ${gebetszeiten.Maghrib}</li>
                    <li><b>Isha:</b> ${gebetszeiten.Isha}</li>
                `;
            });
    }, () => {
        document.getElementById("stadt-auswahl-container").style.display = "block";
    });
}

function ladeHadith() {
    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            let hadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadith-arabisch").textContent = hadith.arabisch;
            document.getElementById("hadith-deutsch").textContent = hadith.deutsch;
            document.getElementById("hadith-quellen").textContent = hadith.quelle;
        });
}

function ladeDua() {
    fetch("dua.json")
        .then(response => response.json())
        .then(data => {
            let dua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("dua-arabisch").textContent = dua.arabisch;
            document.getElementById("dua-deutsch").textContent = dua.deutsch;
            document.getElementById("dua-transliteration").textContent = dua.transliteration;
            document.getElementById("dua-quellen").textContent = dua.quelle;
        });
}
