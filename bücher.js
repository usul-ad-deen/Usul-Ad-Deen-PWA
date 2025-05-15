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

  // 📌 Uhrzeit & Datum (Berlin & Mekka)
  function updateUhrzeit() {
    let jetzt = new Date();
    document.getElementById("uhrzeit").textContent = `Berlin: ${jetzt.toLocaleTimeString("de-DE", { hour12: false })}`;
    document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");

    let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
    document.getElementById("mekka-uhrzeit").textContent = `Mekka: ${mekkaZeit.toLocaleTimeString("de-DE", { hour12: false })}`;
  }
  updateUhrzeit();
  setInterval(updateUhrzeit, 1000);

  // 📌 Islamisches Datum
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
        if (new Date().getHours() >= 18) {
          islamischerTag = parseInt(islamischerTag) + 1;
        }

        document.getElementById("islamisches-datum").textContent =
          `${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
      }
    } catch (error) {
      console.error("Fehler beim Abrufen des islamischen Datums:", error);
    }
  }

  // 📌 Standortermittlung & Gebetszeiten (gekürzt)
  async function ermittleStandort() {
    /* ... belasse diesen Abschnitt wie gehabt ... */
  }

  async function ladeStadtAuswahl() { /* ... */ }

  async function ladeGebetszeiten(stadt) { /* ... */ }

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
});
