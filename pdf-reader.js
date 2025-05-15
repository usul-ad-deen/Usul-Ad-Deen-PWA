import { auth, db } from "./firebase-init.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
  speichereGelesenesBuch();
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

window.weiter = () => {
  if (aktuelleSeite < totalSeiten) renderSeite(aktuelleSeite + 1);
};
window.zurueck = () => {
  if (aktuelleSeite > 1) renderSeite(aktuelleSeite - 1);
};
window.zurueckZurAuswahl = () => {
  window.location.href = "bücher.html";
};

window.zoomIn = () => {
  zoomFaktor += 0.2;
  renderSeite(aktuelleSeite);
};
window.zoomOut = () => {
  zoomFaktor = Math.max(0.6, zoomFaktor - 0.2);
  renderSeite(aktuelleSeite);
};

window.toggleDarkMode = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark-mode", document.body.classList.contains("dark"));
};
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
  }
});

// 🔖 Lesezeichen-Funktionen
window.setzeLesezeichen = async () => {
  const user = auth.currentUser;
  const seite = aktuelleSeite;

  if (user) {
    await speichereLesezeichenInCloud(seite);
  } else {
    let bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
    if (!bookmarks.includes(seite)) {
      bookmarks.push(seite);
      localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(bookmarks));
      alert(`✅ Lesezeichen für Seite ${seite} gesetzt.`);
    } else {
      alert("⚠️ Lesezeichen existiert bereits.");
    }
  }
};

window.zeigeLesezeichen = async () => {
  const user = auth.currentUser;
  let bookmarks = [];

  if (user) {
    bookmarks = await ladeLesezeichenAusCloud();
  } else {
    bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
  }

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

window.loescheLesezeichen = async (seite) => {
  const user = auth.currentUser;

  if (user) {
    const key = `pdf-bookmarks-${encodeURIComponent(url)}`;
    const docRef = doc(db, "lesezeichen", `${user.uid}_${key}`);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      let daten = snapshot.data().seiten || [];
      daten = daten.filter(s => s !== seite);
      await setDoc(docRef, { uid: user.uid, datei: url, seiten: daten });
    }
  } else {
    let bookmarks = JSON.parse(localStorage.getItem(`pdf-bookmarks-${url}`)) || [];
    bookmarks = bookmarks.filter(s => s !== seite);
    localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(bookmarks));
  }

  zeigeLesezeichen();
};

// 🔄 Cloud-Lesezeichen speichern
async function speichereLesezeichenInCloud(seite) {
  const user = auth.currentUser;
  const key = `pdf-bookmarks-${encodeURIComponent(url)}`;
  const docRef = doc(db, "lesezeichen", `${user.uid}_${key}`);

  try {
    const snapshot = await getDoc(docRef);
    let daten = snapshot.exists() ? snapshot.data().seiten || [] : [];

    if (!daten.includes(seite)) {
      daten.push(seite);
      await setDoc(docRef, { uid: user.uid, datei: url, seiten: daten });
      alert(`✅ Cloud-Lesezeichen für Seite ${seite} gesetzt.`);
    } else {
      alert("⚠️ Lesezeichen existiert bereits.");
    }
  } catch (error) {
    console.error("❌ Fehler beim Speichern des Cloud-Lesezeichens:", error);
  }
}

// 🔄 Cloud-Lesezeichen laden
async function ladeLesezeichenAusCloud() {
  const user = auth.currentUser;
  const key = `pdf-bookmarks-${encodeURIComponent(url)}`;
  const docRef = doc(db, "lesezeichen", `${user.uid}_${key}`);

  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data().seiten || [];
    }
  } catch (error) {
    console.error("❌ Fehler beim Laden der Cloud-Lesezeichen:", error);
  }

  return [];
}

// 🧠 Gelesene Bücher lokal merken
function speichereGelesenesBuch() {
  let liste = JSON.parse(localStorage.getItem("gelesene-buecher")) || [];
  const eintrag = {
    datei: url,
    seite: aktuelleSeite,
    zeit: new Date().toISOString()
  };

  liste = liste.filter(e => e.datei !== url);
  liste.unshift(eintrag);
  localStorage.setItem("gelesene-buecher", JSON.stringify(liste));
  localStorage.setItem("zuletzt-gelesen", url);
}

// ▶️ Fortsetzen-Funktion
window.fortsetzenLetztesBuch = () => {
  const letzteDatei = localStorage.getItem("zuletzt-gelesen");
  if (letzteDatei) {
    window.location.href = `pdf-reader.html?file=${encodeURIComponent(letzteDatei)}`;
  } else {
    alert("⚠️ Kein zuletzt gelesenes Buch gefunden.");
  }
};
