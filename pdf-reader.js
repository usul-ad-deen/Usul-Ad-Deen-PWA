import { auth, db } from "./firebase-init.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

let pdfDoc = null;
let aktuelleSeite = 1;
let totalSeiten = 0;
let scale = 1.5;
let user = null;
let file = new URLSearchParams(window.location.search).get("file");

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");

const greeting = document.getElementById("greeting");
const fortschritt = document.getElementById("fortschritt");
const bookmarksList = document.getElementById("bookmarks-list");

if (!file) {
  alert("❌ Keine PDF-Datei angegeben.");
  throw new Error("PDF-Pfad fehlt");
}

// Firebase Auth prüfen
auth.onAuthStateChanged(async (currentUser) => {
  user = currentUser;

  if (user) {
    greeting.textContent = `📖 Assalamu alaykum wa rahmatullah wa barakatuh, ${user.displayName || user.email}`;
    await ladeCloudLesezeichen();
  } else {
    greeting.textContent = "📖 PDF-Reader (Gast)";
  }
});

// Fortschritt aus localStorage laden
const gespeicherteSeite = parseInt(localStorage.getItem(`pdf-seite-${file}`));
if (!isNaN(gespeicherteSeite)) aktuelleSeite = gespeicherteSeite;

// PDF laden
pdfjsLib.getDocument(file).promise.then(pdf => {
  pdfDoc = pdf;
  totalSeiten = pdf.numPages;
  renderSeite(aktuelleSeite);
}).catch(err => {
  console.error("PDF konnte nicht geladen werden:", err);
  alert("Fehler beim Laden des PDF-Dokuments.");
});

function renderSeite(nr) {
  pdfDoc.getPage(nr).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      aktuelleSeite = nr;
      localStorage.setItem(`pdf-seite-${file}`, nr);
      updateFortschritt();
    });
  });
}

function updateFortschritt() {
  const prozent = Math.floor((aktuelleSeite / totalSeiten) * 100);
  fortschritt.textContent = `📘 Fortschritt: Seite ${aktuelleSeite} von ${totalSeiten} (${prozent}%)`;
}

window.weiter = () => {
  if (aktuelleSeite < totalSeiten) renderSeite(aktuelleSeite + 1);
};

window.zurueck = () => {
  if (aktuelleSeite > 1) renderSeite(aktuelleSeite - 1);
};

window.zoomIn = () => {
  scale += 0.2;
  renderSeite(aktuelleSeite);
};

window.zoomOut = () => {
  if (scale > 0.6) {
    scale -= 0.2;
    renderSeite(aktuelleSeite);
  }
};

window.toggleDarkMode = () => {
  document.body.classList.toggle("dark");
};

window.zurueckZurListe = () => {
  window.location.href = "bücher.html";
};

window.setLesezeichen = async () => {
  const bookmark = aktuelleSeite;
  localStorage.setItem(`bookmark-${file}`, bookmark);
  alert(`🔖 Lesezeichen auf Seite ${bookmark} gesetzt.`);

  if (user) {
    const ref = doc(db, "bookmarks", `${user.uid}_${file}`);
    await setDoc(ref, { seite: bookmark, dateiname: file }, { merge: true });
    ladeCloudLesezeichen();
  }
};

async function ladeCloudLesezeichen() {
  bookmarksList.innerHTML = "";
  const bookmark = localStorage.getItem(`bookmark-${file}`);

  if (bookmark) {
    const li = document.createElement("li");
    li.textContent = `Lokales Lesezeichen: Seite ${bookmark}`;
    li.onclick = () => renderSeite(parseInt(bookmark));
    bookmarksList.appendChild(li);
  }

  if (user) {
    const ref = doc(db, "bookmarks", `${user.uid}_${file}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const seite = snap.data().seite;
      const li = document.createElement("li");
      li.textContent = `Cloud-Lesezeichen: Seite ${seite}`;
      li.onclick = () => renderSeite(parseInt(seite));
      bookmarksList.appendChild(li);
    }
  }
}
