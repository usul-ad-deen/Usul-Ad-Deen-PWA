document.addEventListener("DOMContentLoaded", function() {
    fetchDailyHadith();
    fetchDailyDua();
    getLocationAndPrayerTimes();
});

function fetchDailyHadith() {
    fetch("hadith.json")
        .then(response => response.json())
        .then(data => {
            const randomHadith = data[Math.floor(Math.random() * data.length)];
            document.getElementById("hadith-arabic").innerText = randomHadith.arabic;
            document.getElementById("hadith-german").innerText = randomHadith.german;
            document.getElementById("hadith-authenticity").innerText = "Authentizität: " + randomHadith.authenticity;
        })
        .catch(error => console.error("Fehler beim Laden des Hadiths:", error));
}

function fetchDailyDua() {
    fetch("duas.json")
        .then(response => response.json())
        .then(data => {
            const randomDua = data[Math.floor(Math.random() * data.length)];
            document.getElementById("dua-arabic").innerText = randomDua.arabic;
            document.getElementById("dua-transliteration").innerText = randomDua.transliteration;
            document.getElementById("dua-german").innerText = randomDua.german;
        })
        .catch(error => console.error("Fehler beim Laden des Bittgebets:", error));
}

function getLocationAndPrayerTimes() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetchPrayerTimes(latitude, longitude);
        }, () => {
            document.getElementById("location").innerText = "Standort konnte nicht ermittelt werden. Bitte Stadt manuell auswählen.";
        });
    } else {
        document.getElementById("location").innerText = "Standortermittlung nicht unterstützt.";
    }
}

function fetchPrayerTimes(lat, lon) {
    const apiUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const timings = data.data.timings;
            const date = data.data.date;
            document.getElementById("fajr").innerText = "Fajr: " + timings.Fajr;
            document.getElementById("shuruk").innerText = "Sonnenaufgang: " + timings.Sunrise;
            document.getElementById("dhuhr").innerText = "Dhuhr: " + timings.Dhuhr;
            document.getElementById("asr").innerText = "Asr: " + timings.Asr;
            document.getElementById("maghrib").innerText = "Maghrib: " + timings.Maghrib;
            document.getElementById("isha").innerText = "Isha: " + timings.Isha;

            const midnight = calculateMidnight(timings.Maghrib, timings.Fajr);
            document.getElementById("midnight").innerText = "Islamische Mitternacht: " + midnight;

            const lastThird = calculateLastThirdOfNight(timings.Maghrib, timings.Fajr);
            document.getElementById("last-third").innerText = "Letztes Drittel der Nacht: " + lastThird;

            document.getElementById("islamic-date").innerText = "Islamisches Datum: " + date.hijri.date;
            document.getElementById("gregorian-date").innerText = "Gregorianisches Datum: " + date.gregorian.date;

            document.getElementById("mecca-time").innerText = "Uhrzeit Mekka: " + new Date().toLocaleTimeString("ar-SA", {timeZone: "Asia/Riyadh"});
            document.getElementById("berlin-time").innerText = "Uhrzeit Berlin: " + new Date().toLocaleTimeString("de-DE", {timeZone: "Europe/Berlin"});
        })
        .catch(error => console.error("Fehler beim Laden der Gebetszeiten:", error));
}

function calculateMidnight(maghrib, fajr) {
    return "Berechnet aus Maghrib & Fajr"; 
}

function calculateLastThirdOfNight(maghrib, fajr) {
    return "Berechnet aus Maghrib & Fajr"; 
}
