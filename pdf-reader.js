
import { auth, db } from './firebase-init.js';
import { setDoc, doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;
let zoomFaktor = 1.5;
const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const url = new URLSearchParams(window.location.search).get("file");
const bookmarkListe = document.getElementById("lesezeichen-liste");
const pdfjsLib = window['pdfjs-dist/build/pdf'];
if (!url) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF-Pfad fehlt");
}

const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${url}`));
if (!isNaN(gespeicherteSeite)) {
  aktuelleSeite = gespeicherteSeite;
}

// 📌 PDF laden
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
  speichereGelesenesBuch(); // 💾 Buch speichern (lokal oder Firebase)
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

// 📌 Lesezeichen lokal
window.setzeLesezeichen = async () => {
  const seite = aktuelleSeite;

  if (auth.currentUser) {
    // 📤 Firebase speichern
    const uid = auth.currentUser.uid;
    const ref = doc(db, "lesezeichen", `${uid}_${encodeURIComponent(url)}`);
    await setDoc(ref, {
      uid,
      datei: url,
      seiten: arrayUnion(seite)
    }, { merge: true });
    alert(`✅ Lesezeichen für Seite ${seite} in Firebase gespeichert.`);
  } else {
    // 📥 Lokal speichern
    let bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
    if (!bookmarks.includes(seite)) {
      bookmarks.push(seite);
      localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(bookmarks));
      alert(`✅ Lesezeichen für Seite ${seite} gespeichert.`);
    } else {
      alert("⚠️ Lesezeichen existiert bereits.");
    }
  }
};

window.zeigeLesezeichen = async () => {
  bookmarkListe.innerHTML = "<strong>📚 Meine Lesezeichen:</strong>";
  let bookmarks = [];

  if (auth.currentUser) {
    const ref = doc(db, "lesezeichen", `${auth.currentUser.uid}_${encodeURIComponent(url)}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      bookmarks = snap.data().seiten || [];
    }
  } else {
    bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
  }

  if (bookmarks.length === 0) {
    alert("⚠️ Keine Lesezeichen vorhanden.");
    return;
  }

  bookmarks.forEach(seite => {
    const eintrag = document.createElement("div");
    eintrag.className = "lesezeichen-eintrag";
    eintrag.innerHTML = `
      <span>Seite ${seite}</span>
      <button onclick="geheZuLesezeichen(${seite})">📖</button>
    `;
    bookmarkListe.appendChild(eintrag);
  });

  bookmarkListe.classList.toggle("hidden");
};

window.geheZuLesezeichen = (seite) => {
  renderSeite(seite);
  bookmarkListe.classList.add("hidden");
};

// 📌 Gelesenes Buch speichern
async function speichereGelesenesBuch() {
  const eintrag = {
    datei: url,
    seite: aktuelleSeite,
    zeit: new Date().toISOString()
  };

  localStorage.setItem("zuletzt-gelesen", url);

  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    const ref = doc(db, "gelesene-buecher", uid);
    await setDoc(ref, {
      [encodeURIComponent(url)]: eintrag
    }, { merge: true });
  } else {
    let liste = JSON.parse(localStorage.getItem("gelesene-buecher")) || [];
    liste = liste.filter(e => e.datei !== url);
    liste.unshift(eintrag);
    localStorage.setItem("gelesene-buecher", JSON.stringify(liste));
  }
}

// 📌 Letztes Buch fortsetzen
window.fortsetzenLetztesBuch = () => {
  const letzteDatei = localStorage.getItem("zuletzt-gelesen");
  if (letzteDatei) {
    window.location.href = `pdf-reader.html?file=${encodeURIComponent(letzteDatei)}`;
  } else {
    alert("⚠️ Kein zuletzt gelesenes Buch gefunden.");
  }
};
