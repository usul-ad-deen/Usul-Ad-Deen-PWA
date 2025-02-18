document.addEventListener("DOMContentLoaded", function () {
    updateTime();
    setInterval(updateTime, 1000);
    fetchPrayerTimes();
    fetchHadith();
    fetchDua();
});

function updateTime() {
    let berlinTime = new Date().toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin" });
    let mekkaTime = new Date().toLocaleTimeString("de-DE", { timeZone: "Asia/Riyadh" });

    document.getElementById("berlin-time").textContent = berlinTime;
    document.getElementById("mekka-time").textContent = mekkaTime;
}

async function fetchPrayerTimes() {
    try {
        const response = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Berlin&country=Germany&method=2");
        const data = await response.json();

        document.getElementById("fajr").textContent = data.data.timings.Fajr;
        document.getElementById("shuruk").textContent = data.data.timings.Sunrise;
        document.getElementById("dhuhr").textContent = data.data.timings.Dhuhr;
        document.getElementById("asr").textContent = data.data.timings.Asr;
        document.getElementById("maghreb").textContent = data.data.timings.Maghrib;
        document.getElementById("isha").textContent = data.data.timings.Isha;
        
        let midnight = calculateMidnight(data.data.timings);
        let lastThird = calculateLastThird(data.data.timings);

        document.getElementById("midnight").textContent = midnight;
        document.getElementById("last-third").textContent = lastThird;

        document.getElementById("location").textContent = "Berlin";
    } catch (error) {
        console.error("Fehler beim Abrufen der Gebetszeiten", error);
    }
}

function calculateMidnight(timings) {
    let ishaTime = parseTime(timings.Isha);
    let fajrTime = parseTime(timings.Fajr);
    let midnight = new Date(ishaTime.getTime() + (fajrTime - ishaTime) / 2);
    return midnight.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function calculateLastThird(timings) {
    let ishaTime = parseTime(timings.Isha);
    let fajrTime = parseTime(timings.Fajr);
    let lastThird = new Date(ishaTime.getTime() + (fajrTime - ishaTime) * (2 / 3));
    return lastThird.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function parseTime(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let date = new Date();
    date.setHours(hours, minutes, 0);
    return date;
}

async function fetchHadith() {
    try {
        const response = await fetch("hadith.json");
        const data = await response.json();
        const hadith = data[Math.floor(Math.random() * data.length)];

        document.getElementById("hadith-arabic").textContent = hadith.arabic;
        document.getElementById("hadith-german").textContent = hadith.german;
        document.getElementById("hadith-source").textContent = hadith.source;
        document.getElementById("hadith-authenticity").textContent = hadith.authenticity;
    } catch (error) {
        console.error("Fehler beim Laden des Hadith", error);
    }
}

async function fetchDua() {
    try {
        const response = await fetch("dua.json");
        const data = await response.json();
        const dua = data[Math.floor(Math.random() * data.length)];

        document.getElementById("dua-arabic").textContent = dua.arabic;
        document.getElementById("dua-german").textContent = dua.german;
        document.getElementById("dua-translit").textContent = dua.transliteration;
        document.getElementById("dua-source").textContent = dua.source;
    } catch (error) {
        console.error("Fehler beim Laden des Bittgebets", error);
    }
}
