document.addEventListener("DOMContentLoaded", () => {
    // Standortbasierte Gebetszeiten abrufen
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPrayerTimes, showManualCitySelection);
    } else {
        showManualCitySelection();
    }
});

// Funktion zur Abrufung der Gebetszeiten basierend auf dem Standort
function getPrayerTimes(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`)
        .then(response => response.json())
        .then(data => {
            displayPrayerTimes(data.data.timings);
            document.getElementById("user-location").textContent = `Ihr Standort: Automatisch erkannt`;
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der Gebetszeiten:", error);
            showManualCitySelection();
        });
}

// Funktion zur Anzeige der Gebetszeiten
function displayPrayerTimes(timings) {
    document.getElementById("fajr").textContent = `Fajr: ${timings.Fajr}`;
    document.getElementById("shuruk").textContent = `Sonnenaufgang: ${timings.Sunrise}`;
    document.getElementById("dhuhr").textContent = `Dhuhr: ${timings.Dhuhr}`;
    document.getElementById("asr").textContent = `Asr: ${timings.Asr}`;
    document.getElementById("maghrib").textContent = `Maghrib: ${timings.Maghrib}`;
    document.getElementById("isha").textContent = `Isha: ${timings.Isha}`;
}

// Funktion zur Anzeige der manuellen Stadtwahl
function showManualCitySelection() {
    document.getElementById("user-location").textContent = "Bitte Stadt manuell wählen:";
    document.getElementById("manual-city-selection").style.display = "block";
}

// Stadt manuell auswählen
document.getElementById("city-select").addEventListener("change", function() {
    const city = this.value;
    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Germany&method=2`)
        .then(response => response.json())
        .then(data => {
            displayPrayerTimes(data.data.timings);
            document.getElementById("user-location").textContent = `Ausgewählte Stadt: ${city}`;
        })
        .catch(error => console.error("Fehler beim Abrufen der Gebetszeiten:", error));
});

// Funktion zum Laden des täglichen Hadiths
function loadDailyHadith() {
    fetch("https://usul-ad-deen.weebly.com/daily-hadith.json")
        .then(response => response.json())
        .then(data => {
            document.getElementById("daily-hadith").innerHTML = `<strong>Hadith des Tages:</strong> ${data.hadith}`;
        })
        .catch(error => console.error("Fehler beim Laden des Hadith:", error));
}

loadDailyHadith();
