import { auth, db } from './firebase-init.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js';

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

// 📌 Firebase-Nutzer & Firestore-Pfad vorbereiten
let userId = null;
auth.onAuthStateChanged(async (user) => {
  if (user) {
    userId = user.uid;
    const docRef = doc(db, "lesezeichen", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const lesezeichen = docSnap.data()[url];
      if (lesezeichen) aktuelleSeite = lesezeichen;
    } else {
      const lokal = parseInt(localStorage.getItem(`pdf-seite-${url}`));
      if (!isNaN(lokal)) aktuelleSeite = lokal;
    }
  } else {
    const lokal = parseInt(localStorage.getItem(`pdf-seite-${url}`));
    if (!isNaN(lokal)) aktuelleSeite = lokal;
  }

  ladePdf();
});

async function ladePdf() {
  const loadingTask = pdfjsLib.getDocument(url);
  loadingTask.promise.then(pdf => {
    pdfDoc = pdf;
    totalSeiten = pdf.numPages;
    renderSeite(aktuelleSeite);
  }).catch(err => {
    console.error("PDF konnte nicht geladen werden:", err);
    alert("Fehler beim Laden des PDF-Dokuments.");
  });
}

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
  }).catch(err => {
    console.error("Fehler beim Rendern der Seite:", err);
  });
}

function updateFortschritt() {
  const prozent = Math.floor((aktuelleSeite / totalSeiten) * 100);
  document.getElementById("fortschritt").textContent = `📖 Fortschritt: ${prozent}% (Seite ${aktuelleSeite} von ${totalSeiten})`;
}

// 📌 Navigation
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
  zoomFaktor = Math.max(0.8, zoomFaktor - 0.2);
  renderSeite(aktuelleSeite);
};

window.lesezeichenSetzen = async () => {
  if (!userId) {
    alert("❌ Du musst angemeldet sein, um ein Lesezeichen zu setzen.");
    return;
  }

  const lesezeichenRef = doc(db, "lesezeichen", userId);
  await setDoc(lesezeichenRef, {
    [url]: aktuelleSeite
  }, { merge: true });

  alert("✅ Lesezeichen gespeichert!");
};

window.zurueckZurListe = () => {
  window.location.href = "bücher.html";
};
