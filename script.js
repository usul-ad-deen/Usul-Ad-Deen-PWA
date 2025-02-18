document.addEventListener("DOMContentLoaded", function () {
    fetchPrayerTimes();
    fetchDailyHadith();
    fetchDailyDua();
    getUserLocation();
});

function fetchPrayerTimes(city = "") {
    let url = "https://api.aladhan.com/v1/timingsByCity?city=" + (city || "Berlin") + "&country=Germany&method=2";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let timings = data.data.timings;
            document.getElementById("prayer-times-list").innerHTML = `
                <li>Fajr: <b>${timings.Fajr}</b></li>
                <li>Shuruk: ${timings.Sunrise}</li>
                <li>Dhuhr: <b>${timings.Dhuhr}</b></li>
                <li>Asr: <b>${timings.Asr}</b></li>
                <li>Maghrib: <b>${timings.Maghrib}</b></li>
                <li>Isha: <b>${timings.Isha}</b></li>
                <li>Mitternacht: ${timings.Midnight}</li>
            `;
            document.getElementById("islamic-date").innerText = `Islamischer Tag: ${data.data.date.hijri.date}`;
            document.getElementById("gregorian-date").innerText = `Gregorianischer Tag: ${data.data.date.gregorian.date}`;
        });
}
async function ladeHadithDesTages() {
    try {
        let response = await fetch("hadith.json");
        let hadithe = await response.json();

        let heute = new Date().getDate();
        let hadith = hadithe[heute % hadithe.length]; // Wählt einen Hadith basierend auf dem Tag

        document.getElementById("hadith-arabic").textContent = hadith.arabic;
        document.getElementById("hadith-german").textContent = hadith.german;
        document.getElementById("hadith-quelle").textContent = "Quelle: " + hadith.quelle + " (" + hadith.authentizität + ")";

    } catch (error) {
        console.error("Fehler beim Laden des Hadiths:", error);
    }
}

// Ruft die Funktion auf, wenn die Seite geladen wird
document.addEventListener("DOMContentLoaded", ladeHadithDesTages);



function fetchDailyDua() {
    fetch("dua.json")
        .then(response => response.json())
        .then(data => {
            let dailyDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("dua-arabic").innerText = dailyDua.arabic;
            document.getElementById("dua-german").innerText = dailyDua.german;
            document.getElementById("dua-transliteration").innerText = `Transliteration: ${dailyDua.transliteration}`;
            document.getElementById("dua-source").innerText = `Quelle: ${dailyDua.source}`;
        });
}


function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(response => response.json())
                .then(data => {
                    let city = data.address.city || "Unbekannt";
                    document.getElementById("user-location").innerText = `Ihr Standort: ${city}`;
                    fetchPrayerTimes(city);
                });
        }, () => {
            document.getElementById("user-location").innerText = "Standort nicht verfügbar.";
        });
    } else {
        document.getElementById("user-location").innerText = "Standortermittlung nicht möglich.";
    }
}

document.getElementById("city-select").addEventListener("change", function () {
    let city = this.value;
    if (city) {
        document.getElementById("user-location").innerText = `Manuell gewählt: ${city}`;
        fetchPrayerTimes(city);
    }
});
