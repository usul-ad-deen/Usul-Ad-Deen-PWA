document.addEventListener("DOMContentLoaded", function () {
    getLocation();
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("location").innerText = "Geolocation wird nicht unterstützt.";
    }
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`)
        .then(response => response.json())
        .then(data => {
            displayPrayerTimes(data);
        })
        .catch(error => console.error("Fehler beim Abrufen der Gebetszeiten:", error));
}

function showError(error) {
    let errorMessage = "Standort konnte nicht ermittelt werden.";
    document.getElementById("location").innerText = errorMessage;
}

function displayPrayerTimes(data) {
    let timings = data.data.timings;
    let hijriDate = data.data.date.hijri;
    let gregorianDate = data.data.date.gregorian;
    let locationInfo = `Ihr Standort: ${data.data.meta.timezone}`;
    
    document.getElementById("location").innerText = locationInfo;
    document.getElementById("prayer-times").innerHTML = `
        <ul>
            <li>Fajr: ${timings.Fajr}</li>
            <li>Shuruk: ${timings.Sunrise}</li>
            <li>Dhuhr: ${timings.Dhuhr}</li>
            <li>Asr: ${timings.Asr}</li>
            <li>Maghrib: ${timings.Maghrib}</li>
            <li>Isha: ${timings.Isha}</li>
        </ul>
        <p>Islamisches Datum: ${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} (nach Saudi-Arabien)</p>
        <p>Gregorianisches Datum: ${gregorianDate.day} ${gregorianDate.month.en} ${gregorianDate.year}</p>
    `;
}
