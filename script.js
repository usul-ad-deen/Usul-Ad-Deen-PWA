document.addEventListener("DOMContentLoaded", function () {
    const menu = document.getElementById("main-menu");
    if (!menu) {
        const nav = document.createElement("nav");
        nav.id = "main-menu";
        nav.innerHTML = `
            <ul>
                <li><a href="index.html">Startseite</a></li>
                <li><a href="gebetszeiten.html">Gebetszeiten</a></li>
                <li><a href="hadithe.html">Hadithe</a></li>
                <li><a href="buecher.html">Bücher</a></li>
                <li><a href="ueber-mich.html">Über mich</a></li>
                <li><a href="kontakt.html">Kontakt</a></li>
            </ul>
        `;
        document.body.prepend(nav);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const hadithText = document.getElementById("hadith-text");

    // Liste der Hadithe
    const hadithList = [
        {
            arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...",
            german: "Die Taten hängen von den Absichten ab, und jeder bekommt das, was er beabsichtigt...",
            source: "Sahih al-Bukhari 1"
        },
        {
            arabic: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ...",
            german: "Wer auf eine gute Tat hinweist, erhält die gleiche Belohnung wie derjenige, der sie tut...",
            source: "Sahih Muslim 1893"
        },
        {
            arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ...",
            german: "Wer an Allah und den Jüngsten Tag glaubt, soll Gutes sprechen oder schweigen...",
            source: "Sahih al-Bukhari 6018"
        }
    ];

    // Aktuelles Datum abrufen
    const today = new Date().toISOString().split('T')[0];

    // Letzten gespeicherten Hadith abrufen
    let lastHadithData = JSON.parse(localStorage.getItem("hadithData"));

    // Falls das Datum neu ist, neuen Hadith auswählen
    if (!lastHadithData || lastHadithData.date !== today) {
        const randomHadith = hadithList[Math.floor(Math.random() * hadithList.length)];
        lastHadithData = { date: today, hadith: randomHadith };
        localStorage.setItem("hadithData", JSON.stringify(lastHadithData));
    }

    // Hadith anzeigen
    hadithText.innerHTML = `
        <div class="hadith-box">
            <p class="hadith-arabic">${lastHadithData.hadith.arabic}</p>
            <p class="hadith-german">${lastHadithData.hadith.german}</p>
            <p class="hadith-source">${lastHadithData.hadith.source}</p>
        </div>
    `;
});
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
