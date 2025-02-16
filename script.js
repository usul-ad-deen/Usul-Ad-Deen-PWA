document.addEventListener("DOMContentLoaded", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation wird von deinem Browser nicht unterstützt.");
    }
});

function showPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    fetchGebetszeiten(latitude, longitude);
}

function showError(error) {
    console.log("Standort konnte nicht ermittelt werden: " + error.message);
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
        } else {
            document.getElementById("prayer-times").innerHTML = "Fehler beim Abrufen der Gebetszeiten.";
        }
    } catch (error) {
        console.error("Fehler beim Laden der Gebetszeiten:", error);
        document.getElementById("prayer-times").innerHTML = "Fehler beim Laden der Gebetszeiten.";
    }
}

// Standard-Stadt setzen
fetchPrayerTimes("Dortmund");

function getGebetszeiten() {
    let city = document.getElementById("stadt").value;
    let coords = {
        "Berlin": { lat: 52.5200, lon: 13.4050 },
        "München": { lat: 48.1351, lon: 11.5820 },
        "Hamburg": { lat: 53.5511, lon: 9.9937 },
        "Köln": { lat: 50.9375, lon: 6.9603 },
        "Frankfurt": { lat: 50.1109, lon: 8.6821 },
        "Dortmund": { lat: 51.5136, lon: 7.4653 },
        "Bochum": { lat: 51.4818, lon: 7.2162 },
        "Essen": { lat: 51.4556, lon: 7.0116 },
        "Mülheim an der Ruhr": { lat: 51.4180, lon: 6.8845 }
    };
    
    if (coords[city]) {
        fetchGebetszeiten(coords[city].lat, coords[city].lon);
    }
}

function fetchGebetszeiten(latitude, longitude) {
    const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById("fajr").innerText = data.data.timings.Fajr;
            document.getElementById("dhuhr").innerText = data.data.timings.Dhuhr;
            document.getElementById("asr").innerText = data.data.timings.Asr;
            document.getElementById("maghrib").innerText = data.data.timings.Maghrib;
            document.getElementById("isha").innerText = data.data.timings.Isha;
        })
        .catch(error => console.log("Fehler beim Abrufen der Gebetszeiten: " + error));
}
