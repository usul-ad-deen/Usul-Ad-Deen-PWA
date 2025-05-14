let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;
let zoomFaktor = 1.5;
const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const url = new URLSearchParams(window.location.search).get("file");

if (!url) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF-Pfad fehlt");
}

// Fortschritt & Lesezeichen
const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
const lesezeichen = parseInt(localStorage.getItem(`pdf-lesezeichen-${url}`));
if (!isNaN(gespeicherteSeite)) {
  aktuelleSeite = gespeicherteSeite;
}

pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
}).catch(err => {
  console.error("PDF konnte nicht geladen werden:", err);
  alert("Fehler beim Laden des PDFs.");
});

function renderSeite(nr) {
  pdfDoc.getPage(nr).then(page => {
    const viewport = page.getViewport({ scale: zoomFaktor });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    page.render({ canvasContext: ctx, viewport }).promise.then(() => {
      aktuelleSeite = nr;
      localStorage.setItem(`pdf-seite-${url}`, nr);
      updateFortschritt();
    });
  }).catch(err => console.error("Fehler beim Rendern:", err));
}

function updateFortschritt() {
  const prozent = Math.floor((aktuelleSeite / totalSeiten) * 100);
  document.getElementById("fortschritt").textContent = `Fortschritt: ${prozent}%`;
}

window.weiter = () => {
  if (aktuelleSeite < totalSeiten) renderSeite(aktuelleSeite + 1);
};

window.zurueck = () => {
  if (aktuelleSeite > 1) renderSeite(aktuelleSeite - 1);
};

window.zoomIn = () => {
  zoomFaktor += 0.2;
  renderSeite(aktuelleSeite);
};

window.zoomOut = () => {
  if (zoomFaktor > 0.6) {
    zoomFaktor -= 0.2;
    renderSeite(aktuelleSeite);
  }
};

window.setzeLesezeichen = () => {
  localStorage.setItem(`pdf-lesezeichen-${url}`, aktuelleSeite);
  alert(`🔖 Lesezeichen gesetzt auf Seite ${aktuelleSeite}`);
};

window.zurueckZurÜbersicht = () => {
  window.location.href = "bücher.html";
};
