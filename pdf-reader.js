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

const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
if (!isNaN(gespeicherteSeite)) {
  aktuelleSeite = gespeicherteSeite;
}

pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
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

// Lesezeichen
window.setzeLesezeichen = () => {
  let bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
  if (!bookmarks.includes(aktuelleSeite)) {
    bookmarks.push(aktuelleSeite);
    localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(bookmarks));
    alert(`Lesezeichen für Seite ${aktuelleSeite} gesetzt ✅`);
  } else {
    alert("⚠️ Lesezeichen existiert bereits.");
  }
};

window.zeigeLesezeichen = () => {
  const bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
  if (bookmarks.length === 0) {
    alert("⚠️ Keine Lesezeichen gesetzt.");
    return;
  }

  bookmarkListe.innerHTML = "<strong>📚 Meine Lesezeichen:</strong>";
  bookmarks.forEach(seite => {
    const eintrag = document.createElement("div");
    eintrag.className = "lesezeichen-eintrag";
    eintrag.textContent = `Seite ${seite}`;
    eintrag.onclick = () => {
      renderSeite(seite);
      bookmarkListe.classList.add("hidden");
    };
    bookmarkListe.appendChild(eintrag);
  });

  bookmarkListe.classList.toggle("hidden");
};
