// 📌 Imports
import { auth, db } from "./firebase-init.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;
let zoomStufe = 1.5;

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");

const url = new URLSearchParams(window.location.search).get("file");
const dateiname = url?.split("/").pop(); // Nur Dateiname für Lesezeichen-ID

if (!url) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF-Pfad fehlt");
}

// 📌 Lesezeichen aus Firestore laden
async function ladeLesezeichenCloud(dateiname) {
  const user = auth.currentUser;
  if (!user) return 1;

  const uid = user.uid;
  const docId = `${uid}_${dateiname}`;
  const docRef = doc(db, "bookmarks", docId);

  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data().seite || 1;
  } else {
    return 1;
  }
}

// 📌 Lesezeichen in Firestore speichern
async function speichereLesezeichenCloud(dateiname, seite) {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const docId = `${uid}_${dateiname}`;
  const docRef = doc(db, "bookmarks", docId);

  await setDoc(docRef, {
    uid,
    dateiname,
    seite,
    updated: Date.now()
  });
}

// 📌 PDF laden
pdfjsLib.getDocument(url).promise.then(async pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;

  // 🔄 Seite aus Firebase oder LocalStorage laden
  const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
  if (!isNaN(gespeicherteSeite)) {
    aktuelleSeite = gespeicherteSeite;
  }

  const cloudSeite = await ladeLesezeichenCloud(dateiname);
  if (cloudSeite > aktuelleSeite) aktuelleSeite = cloudSeite;

  renderSeite(aktuelleSeite);
}).catch(err => {
  console.error("Fehler beim PDF-Laden:", err);
  alert("❌ PDF konnte nicht geladen werden.");
});

// 📌 Seite rendern
function renderSeite(nr) {
  pdfDoc.getPage(nr).then(page => {
    const viewport = page.getViewport({ scale: zoomStufe });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      aktuelleSeite = nr;
      updateFortschritt();

      // Speicher in localStorage & Firebase
      localStorage.setItem(`pdf-seite-${url}`, nr);
      speichereLesezeichenCloud(dateiname, nr);
    });
  });
}

// 📌 Fortschritt anzeigen
function updateFortschritt() {
  const prozent = Math.floor((aktuelleSeite / totalSeiten) * 100);
  document.getElementById("fortschritt").textContent = `Fortschritt: ${prozent}% (${aktuelleSeite}/${totalSeiten})`;
}

// 📌 Navigation
window.weiter = () => {
  if (aktuelleSeite < totalSeiten) renderSeite(aktuelleSeite + 1);
};

window.zurueck = () => {
  if (aktuelleSeite > 1) renderSeite(aktuelleSeite - 1);
};

window.zoomIn = () => {
  zoomStufe += 0.25;
  renderSeite(aktuelleSeite);
};

window.zoomOut = () => {
  zoomStufe = Math.max(0.5, zoomStufe - 0.25);
  renderSeite(aktuelleSeite);
};

window.zurueckZurListe = () => {
  window.location.href = "bücher.html";
};
