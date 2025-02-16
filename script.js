async function getCityFromCoords(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await response.json();
        return data.address.city || data.address.town || data.address.village || "Unbekannte Stadt";
    } catch (error) {
        console.error("Fehler beim Abrufen der Stadt:", error);
        return "Unbekannte Stadt";
    }
}

async function fetchPrayerTimes(city) {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Germany&method=3`);
        const data = await response.json();
        
        if (data.code === 200) {
            document.getElementById("prayer-times").innerHTML = `
                <h3>Gebetszeiten für ${city}</h3>
                <p>Fajr: ${data.data.timings.Fajr}</p>
                <p>Dhuhr: ${data.data.timings.Dhuhr}</p>
                <p>Asr: ${data.data.timings.Asr}</p>
                <p>Maghrib: ${data.data.timings.Maghrib}</p>
                <p>Isha: ${data.data.timings.Isha}</p>
            `;
            document.getElementById("user-location").innerText = `📍 Ihr Standort: ${city}`;
        } else {
            document.getElementById("prayer-times").innerHTML = "Fehler beim Abrufen der Gebetszeiten.";
            document.getElementById("user-location").innerText = "📍 Standort konnte nicht ermittelt werden.";
        }
    } catch (error) {
        console.error("Fehler beim Laden der Gebetszeiten:", error);
        document.getElementById("prayer-times").innerHTML = "Fehler beim Laden der Gebetszeiten.";
        document.getElementById("user-location").innerText = "📍 Standort konnte nicht geladen werden.";
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const city = await getCityFromCoords(lat, lon);
            fetchPrayerTimes(city);
        }, (error) => {
            console.error("Fehler bei der Standortabfrage:", error);
            document.getElementById("user-location").innerText = "📍 Standort konnte nicht ermittelt werden.";
        });
    } else {
        document.getElementById("user-location").innerText = "📍 Geolocation wird von deinem Browser nicht unterstützt.";
    }
}

// Automatisch Standort abrufen beim Laden der Seite
getLocation();
