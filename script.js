document.addEventListener("DOMContentLoaded", () => {
    updateUhrzeit();
    setInterval(updateUhrzeit, 60000); // Aktualisiert Uhrzeit jede Minute

    ladeHadithDesTages();
    ladeDuaDesTages();
    ladeGebetszeiten();
});

// Uhrzeit-Funktion für Berlin & Mekka
function updateUhrzeit() {
    let jetzt = new Date();
    
    let berlinZeit = jetzt.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });
    let meccaZeit = new Date(jetzt.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }))
                        .toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });

    document.getElementById("uhrzeit-berlin").textContent = berlinZeit || "00:00";
    document.getElementById("uhrzeit-mekka").textContent = meccaZeit || "00:00";
}

// Hadith laden
async function ladeHadithDesTages() {
    try {
        let response = await fetch("hadith.json");
        let hadithe = await response.json();
        let heute = new Date().getDate();
        let hadith = hadithe[heute % hadithe.length];

        document.getElementById("hadith-arabic").textContent = hadith.arabic;
        document.getElementById("hadith-german").textContent = hadith.german;
        document.getElementById("hadith-quelle").textContent = "Quelle: " + hadith.quelle;
        document.getElementById("hadith-authentizität").textContent = "Authentizität: " + hadith.authentizität;

    } catch (error) {
        console.error("Fehler beim Laden des Hadiths:", error);
    }
}

// Dua laden
async function ladeDuaDesTages() {
    try {
        let response = await fetch("dua.json");
        let duas = await response.json();
        let heute = new Date().getDate();
        let dua = duas[heute % duas.length];

        document.getElementById("dua-arabic").textContent = dua.arabic;
        document.getElementById("dua-transliteration").textContent = dua.transliteration;
        document.getElementById("dua-german").textContent = dua.german;
        document.getElementById("dua-quelle").textContent = "Quelle: " + dua.quelle;

    } catch (error) {
        console.error("Fehler beim Laden des Bittgebets:", error);
    }
}

// Gebetszeiten laden (inkl. Mitternacht & letztes Drittel)
async function ladeGebetszeiten() {
    try {
        let response = await fetch("gebetszeiten.json");
        let zeiten = await response.json();
        let stadt = document.getElementById("stadt-auswahl").value || "Berlin";

        document.getElementById("stadt-name").textContent = stadt;

        let heute = new Date().toISOString().split("T")[0]; 
        let zeitenHeute = zeiten[stadt][heute];

        document.getElementById("fajr").textContent = zeitenHeute.fajr;
        document.getElementById("shuruk").textContent = zeitenHeute.shuruk;
        document.getElementById("dhuhr").textContent = zeitenHeute.dhuhr;
        document.getElementById("asr").textContent = zeitenHeute.asr;
        document.getElementById("maghrib").textContent = zeitenHeute.maghrib;
        document.getElementById("isha").textContent = zeitenHeute.isha;
        document.getElementById("mitternacht").textContent = zeitenHeute.mitternacht;
        document.getElementById("letztes-drittel").textContent = zeitenHeute.letztesDrittel;

    } catch (error) {
        console.error("Fehler beim Laden der Gebetszeiten:", error);
    }
}
