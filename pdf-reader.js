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

// 📄 Seite anzeigen
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
  if (aktuelleSeite < totalSeiten) renderSeite(aktuelleSeite + 1);
};

window.zurueck = () => {
  if (aktuelleSeite > 1) renderSeite(aktuelleSeite - 1);
};

window.zurueckZurAuswahl = () => {
  window.location.href = "bücher.html";
};

// 🔖 Lesezeichen setzen
window.setzeLesezeichen = () => {
  const key = `pdf-bookmarks-${url}`;
  let bookmarks = JSON.parse(localStorage.getItem(key)) || [];
  if (!bookmarks.includes(aktuelleSeite)) {
    bookmarks.push(aktuelleSeite);
    localStorage.setItem(key, JSON.stringify(bookmarks));
    alert(`Lesezeichen auf Seite ${aktuelleSeite} gesetzt ✅`);
  } else {
    alert("⚠️ Dieses Lesezeichen existiert bereits.");
  }
};

// 📚 Lesezeichen anzeigen
window.geheZuLesezeichen = () => {
  const liste = document.getElementById("lesezeichen-liste");
  liste.classList.toggle("hidden");

  const ul = document.getElementById("lesezeichen-eintraege");
  ul.innerHTML = "";

  const bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];

  if (bookmarks.length === 0) {
    ul.innerHTML = "<li>Keine Lesezeichen gesetzt.</li>";
    return;
  }

  bookmarks.sort((a, b) => a - b).forEach(seite => {
    const li = document.createElement("li");
    li.textContent = `Seite ${seite}`;
    li.addEventListener("click", () => {
      renderSeite(seite);
      liste.classList.add("hidden");
    });
    ul.appendChild(li);
  });
};
