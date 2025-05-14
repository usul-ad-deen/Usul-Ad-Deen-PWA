let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");

// 📌 URL-Parameter lesen
const url = new URLSearchParams(window.location.search).get("file");

if (!url) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF-Pfad fehlt");
}

// 📌 Gespeicherten Fortschritt laden
const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
if (!isNaN(gespeicherteSeite)) {
  aktuelleSeite = gespeicherteSeite;
}

// 📌 PDF laden
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
}).catch(err => {
  console.error("PDF konnte nicht geladen werden:", err);
  alert("Fehler beim Laden des PDF-Dokuments.");
});

// 📌 Seite rendern
function renderSeite(nr) {
  pdfDoc.getPage(nr).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      aktuelleSeite = nr;
      localStorage.setItem(`pdf-seite-${url}`, nr);
      updateFortschritt();
    });
  }).catch(err => {
    console.error("Fehler beim Rendern der Seite:", err);
  });
}

// 📌 Fortschritt berechnen und anzeigen
function updateFortschritt() {
  const prozent = Math.floor((aktuelleSeite / totalSeiten) * 100);
  document.getElementById("fortschritt").textContent = `Fortschritt: ${prozent}%`;
}

// 📌 Navigation
window.weiter = () => {
  if (aktuelleSeite < totalSeiten) {
    renderSeite(aktuelleSeite + 1);
  }
};

window.zurueck = () => {
  if (aktuelleSeite > 1) {
    renderSeite(aktuelleSeite - 1);
  }
};
