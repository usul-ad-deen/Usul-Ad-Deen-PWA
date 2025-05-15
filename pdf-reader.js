let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;
let zoomFaktor = 1.5; // Start-Zoom

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const url = new URLSearchParams(window.location.search).get("file");

if (!url) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF-Pfad fehlt");
}

const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
if (!isNaN(gespeicherteSeite)) {
  aktuelleSeite = gespeicherteSeite;
}

// 📄 PDF laden
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
}).catch(err => {
  console.error("PDF konnte nicht geladen werden:", err);
  alert("Fehler beim Laden des PDF-Dokuments.");
});

// 📄 Seite anzeigen (mit echtem Zoom!)
function renderSeite(nr) {
  pdfDoc.getPage(nr).then(page => {
    const viewport = page.getViewport({ scale: zoomFaktor });
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
  });
}

// 📊 Fortschritt anzeigen
function updateFortschritt() {
  const prozent = Math.round((aktuelleSeite / totalSeiten) * 100);
  document.getElementById("fortschritt").textContent = `Fortschritt: ${prozent}% (Seite ${aktuelleSeite}/${totalSeiten})`;
}

// 🔍 Zoom
window.zoomIn = () => {
  zoomFaktor += 0.2;
  renderSeite(aktuelleSeite);
};

window.zoomOut = () => {
  zoomFaktor = Math.max(0.6, zoomFaktor - 0.2);
  renderSeite(aktuelleSeite);
};

// 🔁 Navigation
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

window.zurueckZurAuswahl = () => {
  window.location.href = "bücher.html";
};

// 🔖 Lesezeichen
window.setzeLesezeichen = () => {
  localStorage.setItem(`pdf-bookmark-${url}`, aktuelleSeite);
  alert(`Lesezeichen auf Seite ${aktuelleSeite} gesetzt ✅`);
};

window.geheZuLesezeichen = () => {
  const bookmark = parseInt(localStorage.getItem(`pdf-bookmark-${url}`));
  if (!isNaN(bookmark)) {
    renderSeite(bookmark);
  } else {
    alert("⚠️ Kein Lesezeichen gesetzt.");
  }
};
