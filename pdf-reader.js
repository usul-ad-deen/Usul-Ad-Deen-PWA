import { auth, db } from "./firebase-init.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;
let zoomFaktor = 1.5;

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const url = new URLSearchParams(window.location.search).get("file");

if (!url) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF fehlt");
}

const lesezeichenBox = document.getElementById("lesezeichen-liste");

// 📌 Lokaler Fortschritt
const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
if (!isNaN(gespeicherteSeite)) aktuelleSeite = gespeicherteSeite;

let lesezeichen = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];

// 📘 PDF laden
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
}).catch(err => {
  alert("Fehler beim Laden des PDF-Dokuments.");
  console.error(err);
});

// 🔁 Seite anzeigen
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

// 📊 Fortschritt
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
window.setzeLesezeichen = async () => {
  if (!lesezeichen.includes(aktuelleSeite)) {
    lesezeichen.push(aktuelleSeite);
    lesezeichen.sort((a, b) => a - b);
    localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(lesezeichen));

    // Firebase-Sync (optional)
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "lesezeichen", user.uid), {
        [url]: lesezeichen
      });
    }

    alert(`✅ Lesezeichen für Seite ${aktuelleSeite} gespeichert`);
  } else {
    alert("❗ Dieses Lesezeichen ist bereits vorhanden");
  }
};

// 📚 Lesezeichenliste anzeigen
window.zeigeLesezeichen = () => {
  lesezeichenBox.innerHTML = `<h3>📚 Meine Lesezeichen</h3>`;
  if (lesezeichen.length === 0) {
    lesezeichenBox.innerHTML += "<p>Keine Lesezeichen gesetzt.</p>";
  } else {
    lesezeichen.forEach(seite => {
      const btn = document.createElement("button");
      btn.textContent = `📄 Seite ${seite}`;
      btn.onclick = () => renderSeite(seite);
      lesezeichenBox.appendChild(btn);
    });
  }
  lesezeichenBox.hidden = !lesezeichenBox.hidden;
};
