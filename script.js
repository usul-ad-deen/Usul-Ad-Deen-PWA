document.addEventListener("DOMContentLoaded", function () {
    updateTime();
    fetchPrayerTimes();
    fetchHadith();
    fetchDua();
    populateCitySelection();
});

function updateTime() {
    setInterval(() => {
        const now = new Date();
        document.getElementById("current-time").textContent = now.toLocaleTimeString("de-DE");
        document.getElementById("gregorian-date").textContent = now.toLocaleDateString("de-DE");
    }, 1000);
}

async function fetchPrayerTimes() {
    try {
        const response = await fetch("prayer_times.json");
        const data = await response.json();
        const prayerTimesList = document.getElementById("prayer-times-list");
        prayerTimesList.innerHTML = "";
        data.times.forEach(time => {
            let li = document.createElement("li");
            li.textContent = `${time.name}: ${time.time}`;
            prayerTimesList.appendChild(li);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Gebetszeiten:", error);
    }
}

async function fetchHadith() {
    try {
        const response = await fetch("hadith.json");
        const data = await response.json();
        const randomHadith = data.hadiths[Math.floor(Math.random() * data.hadiths.length)];
        document.getElementById("hadith-arabisch").textContent = randomHadith.arabisch;
        document.getElementById("hadith-deutsch").textContent = randomHadith.deutsch;
        document.getElementById("hadith-quelle").textContent = randomHadith.quelle;
        
    } catch (error) {
        console.error("Fehler beim Laden des Hadiths:", error);
    }
}

async function fetchDua() {
    try {
        const response = await fetch("dua.json");
        const data = await response.json();
        const randomDua = data.duas[Math.floor(Math.random() * data.duas.length)];
        document.getElementById("dua-arabisch").textContent = randomDua.arabic; 
        document.getElementById("dua-deutsch").textContent = randomDua.deutsch;
        document.getElementById("dua-transliteration").textContent = randomDua.transliteration;
        document.getElementById("dua-quelle").textContent = randomDua.quelle;
    } catch (error) {
        console.error("Fehler beim Laden des Bittgebets:", error);
    }
}

function populateCitySelection() {
    const citySelect = document.getElementById("city-select");
    const cities = ["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf"];
    cities.forEach(city => {
        let option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    citySelect.addEventListener("change", function () {
        document.getElementById("user-location").textContent = citySelect.value;
    });
}
