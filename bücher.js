document.addEventListener("DOMContentLoaded", async () => {
  const buchGrid = document.getElementById("buecher-grid");
  const kategorieFilter = document.getElementById("buch-filter");
  let buchDaten = [];

  // 📌 Bücher laden und initial anzeigen
  async function ladeBücher() {
    try {
      let response = await fetch("bücher.json");
      if (!response.ok) throw new Error("Fehler beim Abrufen der Bücherliste");
      buchDaten = await response.json();
      zeigeBücher(buchDaten);
    } catch (error) {
      console.error("Fehler beim Laden der Bücher:", error);
      buchGrid.innerHTML = "<p>❌ Bücher konnten nicht geladen werden.</p>";
    }
  }

  // 📌 Zeigt Bücher in Kachel-Ansicht
  function zeigeBücher(liste) {
    buchGrid.innerHTML = "";

    liste.forEach(buch => {
      const tile = document.createElement("div");
      tile.className = "buch-tile";
      tile.innerHTML = `
        <img src="${buch.cover || 'icons/book-placeholder.png'}" alt="${buch.titel}">
        <h3>${buch.titel}</h3>
        <p><strong>Autor:</strong> ${buch.autor || 'Unbekannt'}</p>
        <p><strong>Sprache:</strong> ${buch.kategorien?.includes("Deutsch") ? "Deutsch" : (buch.kategorien?.includes("Arabisch") ? "Arabisch" : "Englisch")}</p>
        <p><strong>Kategorien:</strong> ${buch.kategorien?.join(", ")}</p>
        <div class="buch-buttons">
          ${buch.pdf ? `<a href="${buch.pdf}" download>⬇️ PDF</a>` : ""}
          ${buch.epub ? `<a href="${buch.epub}" download>⬇️ EPUB</a>` : ""}
          ${buch.readerLink ? `<a href="${buch.readerLink}" target="_blank">📖 Direkt lesen</a>` : ""}
          ${buch.appstore ? `<a href="${buch.appstore}" target="_blank">📱 App Store</a>` : ""}
          ${buch.playstore ? `<a href="${buch.playstore}" target="_blank">📱 Play Store</a>` : ""}
        </div>
      `;
      buchGrid.appendChild(tile);
    });
  }

  // 📌 Kategorie-Filter bei Änderung
  kategorieFilter.addEventListener("change", () => {
    const gewählteKategorie = kategorieFilter.value;

    if (gewählteKategorie === "") {
      zeigeBücher(buchDaten);
    } else {
      const gefiltert = buchDaten.filter(buch =>
        buch.kategorien && buch.kategorien.includes(gewählteKategorie)
      );
      zeigeBücher(gefiltert);
    }
  });

  // 📌 Gelesene Bücher Dropdown mit Titel
  window.toggleGeleseneBuecher = () => {
    const dropdown = document.getElementById("gelesene-dropdown");
    dropdown.classList.toggle("hidden");

    if (!dropdown.classList.contains("hidden")) {
      const liste = JSON.parse(localStorage.getItem("gelesene-buecher")) || [];

      if (liste.length === 0) {
        dropdown.innerHTML = "<p>⚠️ Noch keine Bücher gelesen.</p>";
        return;
      }

      fetch("bücher.json")
        .then(res => res.json())
        .then(buecher => {
          dropdown.innerHTML = "<strong>📘 Gelesene Bücher:</strong><ul>";
          liste.forEach(e => {
            const buch = buecher.find(b =>
              b.pdf === e.datei || b.readerLink?.includes(e.datei)
            );
            const titel = buch?.titel || decodeURIComponent(e.datei).split("/").pop();
            dropdown.innerHTML += `<li><a href="pdf-reader.html?file=${encodeURIComponent(e.datei)}">📘 ${titel} (Seite ${e.seite})</a></li>`;
          });
          dropdown.innerHTML += "</ul>";
        })
        .catch(() => {
          dropdown.innerHTML = "<p>⚠️ Fehler beim Laden der Buchtitel.</p>";
        });
    }
  };

 // 📌 Aktuelle Uhrzeit & Datum setzen (Berlin & Mekka)
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = `Berlin: ${jetzt.toLocaleTimeString("de-DE", { hour12: false })}`;
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById("mekka-uhrzeit").textContent = `Mekka: ${mekkaZeit.toLocaleTimeString("de-DE", { hour12: false })}`;
    }
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);

// 📌 Lädt das islamische Datum (automatische Aktualisierung ab Maghrib)
async function ladeIslamischesDatum() {
    try {
        let heute = new Date();
        let tag = heute.getDate();
        let monat = heute.getMonth() + 1;
        let jahr = heute.getFullYear();

        let response = await fetch(`https://api.aladhan.com/v1/gToH/${tag}-${monat}-${jahr}`);
        let data = await response.json();

        if (data.code === 200) {
            let islamischerTag = data.data.hijri.day;
            let islamischerMonat = data.data.hijri.month.en;
            let islamischesJahr = data.data.hijri.year;

            let monateDeutsch = {
                "Muharram": "Muharram", "Safar": "Safar", "Rabi' al-Awwal": "Erster Rabi'",
                "Rabi' al-Thani": "Zweiter Rabi'", "Jumada al-Awwal": "Erster Jumada",
                "Jumada al-Thani": "Zweiter Jumada", "Rajab": "Rajab", "Sha'ban": "Sha'ban",
                "Ramadan": "Ramadan", "Shawwal": "Schawwal", "Dhul-Qi'dah": "Dhul-Qi'dah",
                "Dhul-Hijjah": "Dhul-Hijjah"
            };

            let islamischerMonatDeutsch = monateDeutsch[islamischerMonat] || islamischerMonat;

            // 📌 Aktualisierung ab Maghrib
            let jetzt = new Date();
            let stunden = jetzt.getHours();
            if (stunden >= 18) { 
                islamischerTag = parseInt(islamischerTag) + 1;
            }

            document.getElementById("islamisches-datum").textContent = 
                `${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
        } else {
            console.error("Fehler beim Laden des islamischen Datums: API antwortet nicht korrekt.");
        }
    } catch (error) {
        console.error("Fehler beim Abrufen des islamischen Datums:", error);
    }
}

// 📌 Automatisches Laden beim Start
ladeIslamischesDatum(); 

async function ermittleStandort() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let stadt = data.address.city || data.address.town || data.address.village || null;

                    if (!stadt) { 
                        document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                        await ladeStadtAuswahl();
                        return;
                    }

                    aktuelleStadt = stadt; // Speichert die aktuelle Stadt
                    document.getElementById("stadt-name").innerHTML = `📍 Ihr Standort: ${stadt} <br> Oder Stadt auswählen:`;
                    document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
                    await ladeGebetszeiten(stadt);
                    await ladeStadtAuswahl();

                } catch (error) {
                    console.error("Fehler bei Standortermittlung:", error);
                    document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                    document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
                    await ladeStadtAuswahl();

                }
            },
            async () => {
                console.warn("Standort abgelehnt oder nicht verfügbar.");
               
                document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
await ladeStadtAuswahl();

            }
        );
    } else {
        console.warn("Geolocation nicht unterstützt.");
       document.getElementById("stadt-name").innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
document.getElementById("stadt-container").style.display = "block"; // Zeigt Dropdown an
await ladeStadtAuswahl();

    }
}

async function ladeStadtAuswahl() {
    try {
        let response = await fetch("stadt.json");
        let städte = await response.json();
        let dropdown = document.getElementById("stadt-auswahl");

        // ❗ Falls das Dropdown nicht existiert, erstelle es
        if (!dropdown) {
            console.error("❌ Fehler: Dropdown-Element nicht gefunden! Erstelle es jetzt.");
            let container = document.getElementById("stadt-container"); // Stelle sicher, dass es ein Container-Element gibt
            if (!container) {
                console.error("❌ Fehler: Kein Container für die Stadtauswahl gefunden!");
                return;
            }
            dropdown = document.createElement("select");
            dropdown.id = "stadt-auswahl";
            container.appendChild(dropdown); // Füge es ins DOM ein
        }

        dropdown.innerHTML = ""; // ❗ Verhindert doppelte Optionen!

        // Standardoption hinzufügen
        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Stadt auswählen --";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        dropdown.appendChild(defaultOption);

        // Städte hinzufügen
        städte.forEach(stadt => {
            let option = document.createElement("option");
            option.value = stadt.name;
            option.textContent = stadt.name;
            dropdown.appendChild(option);
        });

        // ❗ Zeige das Dropdown an
        dropdown.style.display = "block";

        dropdown.addEventListener("change", async function () {
            let gewählteStadt = this.value;
            aktuelleStadt = gewählteStadt; // Speichert die neue Stadt
            document.getElementById("stadt-name").innerHTML = `📍 Manuelle Auswahl: ${gewählteStadt}`;
            
            if (countdownInterval) {
                clearInterval(countdownInterval); // ❗ Verhindert das Springen der Uhrzeiten!
            }
            
            await ladeGebetszeiten(gewählteStadt);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Städte:", error);
    }
}
    
    let countdownInterval = null;
    let aktuelleStadt = null;

    
   // 📌 Lade Gebetszeiten
 async function ladeGebetszeiten(stadt) {
    try {
        let response = await fetch(https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3);
        let data = await response.json();
        let timings = data.data.timings;

        const jetzt = new Date();
        const zeitJetzt = jetzt.getHours() * 60 + jetzt.getMinutes();

        const gebete = [
            { name: "Fajr", zeit: timings.Fajr },
            { name: "Dhuhr", zeit: timings.Dhuhr },
            { name: "Asr", zeit: timings.Asr },
            { name: "Maghrib", zeit: timings.Maghrib },
            { name: "Isha", zeit: timings.Isha }
        ];

        let nächstesGebet = null;
        let aktuellesGebet = null;

        for (let i = 0; i < gebete.length; i++) {
            const [h, m] = gebete[i].zeit.split(":").map(Number);
            const gebetsZeit = h * 60 + m;

            if (zeitJetzt < gebetsZeit) {
                nächstesGebet = gebete[i];
                aktuellesGebet = gebete[i - 1] || gebete[gebete.length - 1];
                break;
            }
        }

        if (!nächstesGebet) {
            nächstesGebet = gebete[0]; // nächster Tag
            aktuellesGebet = gebete[gebete.length - 1];
        }

        document.getElementById("next-prayer").textContent = Nächstes Gebet: ${nächstesGebet.name} (${nächstesGebet.zeit});
        document.getElementById("current-prayer").textContent = Aktuelles Gebet: ${aktuellesGebet.name} (${aktuellesGebet.zeit});
        document.getElementById("next-prayer-countdown").textContent = "";
        document.getElementById("current-prayer-countdown").textContent = "";

    } catch (error) {
        console.error("Fehler beim Laden der Gebetszeiten:", error);
    }
}
  
  // 📌 Zeige Button für letztes gelesenes Buch
  function zeigeFortsetzenButton() {
    const letzteDatei = localStorage.getItem("zuletzt-gelesen");
    if (letzteDatei) {
      document.getElementById("fortsetzen-bereich")?.classList.remove("hidden");
    }
  }

  // 📌 Funktion zum Fortsetzen
  window.fortsetzenLetztesBuch = () => {
    const letzteDatei = localStorage.getItem("zuletzt-gelesen");
    if (letzteDatei) {
      window.location.href = `pdf-reader.html?file=${encodeURIComponent(letzteDatei)}`;
    } else {
      alert("⚠️ Kein zuletzt gelesenes Buch gefunden.");
    }
  };

  // 📌 Start
  await ladeIslamischesDatum();
  await ladeBücher();
  await ermittleStandort();
  zeigeFortsetzenButton();
  await ladeGebetszeiten(stadt);
 
});
