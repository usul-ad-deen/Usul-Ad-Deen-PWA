let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;
let zoomFaktor = 1.5;
const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const url = new URLSearchParams(window.location.search).get("file");
const bookmarkListe = document.getElementById("lesezeichen-liste");

if (!url) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF-Pfad fehlt");
}

// Gespeicherte Seite laden
const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
if (!isNaN(gespeicherteSeite)) {
  aktuelleSeite = gespeicherteSeite;
}

// PDF laden
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
  speichereGelesenesBuch(); // NEU: Buch zur Gelesen-Liste hinzufügen
}).catch(err => {
  console.error("PDF konnte nicht geladen werden:", err);
  alert("Fehler beim Laden des PDF-Dokuments.");
});

function renderSeite(nr) {
  pdfDoc.getPage(nr).then(page => {
    const viewport = page.getViewport({ scale: zoomFaktor });
    const ratio = window.devicePixelRatio || 1;

    canvas.height = viewport.height * ratio;
    canvas.width = viewport.width * ratio;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      transform: [ratio, 0, 0, ratio, 0, 0]
    };

    page.render(renderContext).promise.then(() => {
      aktuelleSeite = nr;
      localStorage.setItem(`pdf-seite-${url}`, nr);
      updateFortschritt();
    });
  });
}

function updateFortschritt() {
  const prozent = Math.round((aktuelleSeite / totalSeiten) * 100);
  document.getElementById("fortschritt").textContent = `Fortschritt: ${prozent}% (Seite ${aktuelleSeite}/${totalSeiten})`;
}

// Navigation
window.weiter = () => {
  if (aktuelleSeite < totalSeiten) renderSeite(aktuelleSeite + 1);
};

window.zurueck = () => {
  if (aktuelleSeite > 1) renderSeite(aktuelleSeite - 1);
};

window.zurueckZurAuswahl = () => {
  window.location.href = "bücher.html";
};

// Zoom
window.zoomIn = () => {
  zoomFaktor += 0.2;
  renderSeite(aktuelleSeite);
};

window.zoomOut = () => {
  zoomFaktor = Math.max(0.6, zoomFaktor - 0.2);
  renderSeite(aktuelleSeite);
};

// Dark Mode
window.toggleDarkMode = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark-mode", document.body.classList.contains("dark"));
};

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
  }
});

// 📌 Lesezeichen setzen
window.setzeLesezeichen = () => {
  let bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
  if (!bookmarks.includes(aktuelleSeite)) {
    bookmarks.push(aktuelleSeite);
    localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(bookmarks));
    alert(`✅ Lesezeichen für Seite ${aktuelleSeite} gesetzt.`);
  } else {
    alert("⚠️ Lesezeichen existiert bereits.");
  }
};

// 📌 Lesezeichen anzeigen + löschen
window.zeigeLesezeichen = () => {
  const bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
  if (bookmarks.length === 0) {
    alert("⚠️ Keine Lesezeichen vorhanden.");
    return;
  }

  bookmarkListe.innerHTML = "<strong>📚 Meine Lesezeichen:</strong>";
  bookmarks.forEach(seite => {
    const eintrag = document.createElement("div");
    eintrag.className = "lesezeichen-eintrag";
    eintrag.innerHTML = `
      <span>Seite ${seite}</span>
      <button onclick="geheZuLesezeichen(${seite})">📖</button>
      <button onclick="loescheLesezeichen(${seite})">❌</button>
    `;
    bookmarkListe.appendChild(eintrag);
  });

  bookmarkListe.classList.toggle("hidden");
};

window.geheZuLesezeichen = (seite) => {
  renderSeite(seite);
  bookmarkListe.classList.add("hidden");
};

window.loescheLesezeichen = (seite) => {
  let bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
  bookmarks = bookmarks.filter(s => s !== seite);
  localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(bookmarks));
  zeigeLesezeichen(); // neu rendern
};

// 📌 Gelesene Bücher speichern
function speichereGelesenesBuch() {
  let liste = JSON.parse(localStorage.getItem("gelesene-buecher")) || [];
  const eintrag = {
    datei: url,
    seite: aktuelleSeite,
    zeit: new Date().toISOString()
  };

  liste = liste.filter(e => e.datei !== url);
  liste.unshift(eintrag); // oben einfügen

  localStorage.setItem("gelesene-buecher", JSON.stringify(liste));
  localStorage.setItem("zuletzt-gelesen", url);
}

// 📌 Fortsetzen-Funktion (in anderer Datei abrufbar)
window.fortsetzenLetztesBuch = () => {
  const letzteDatei = localStorage.getItem("zuletzt-gelesen");
  if (letzteDatei) {
    window.location.href = `pdf-viewer.html?file=${encodeURIComponent(letzteDatei)}`;
  } else {
    alert("⚠️ Kein zuletzt gelesenes Buch gefunden.");
  }
};

// 📌 Liste aller gelesenen Bücher anzeigen (z. B. in `bücher.html`)
window.zeigeGeleseneBuecher = () => {
  const liste = JSON.parse(localStorage.getItem("gelesene-buecher")) || [];
  if (liste.length === 0) {
    alert("⚠️ Keine gelesenen Bücher gefunden.");
    return;
  }

  const bereich = document.getElementById("gelesene-buecher-anzeige");
  bereich.innerHTML = "<h3>📖 Gelesene Bücher</h3>";
  liste.forEach(e => {
    const div = document.createElement("div");
    div.innerHTML = `<a href="pdf-viewer.html?file=${encodeURIComponent(e.datei)}">📘 ${decodeURIComponent(e.datei)} (Seite ${e.seite})</a>`;
    bereich.appendChild(div);
  });
};
