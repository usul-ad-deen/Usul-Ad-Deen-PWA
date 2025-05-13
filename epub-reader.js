document.addEventListener("DOMContentLoaded", () => {
  // 📌 URL-Parameter auslesen
  const params = new URLSearchParams(window.location.search);
  const buchPfad = params.get("file");

  if (!buchPfad) {
    alert("❌ Keine EPUB-Datei angegeben.");
    return;
  }

  // 📌 ePub laden
  const buch = ePub(buchPfad);

  const rendition = buch.renderTo("viewer", {
    width: "100%",
    height: "100%",
    spread: "none"
  });

  // 📌 Fortschritt wiederherstellen
  const gespeichertePosition = localStorage.getItem(`epub-pos-${buchPfad}`);
  if (gespeichertePosition) {
    rendition.display(gespeichertePosition);
  } else {
    rendition.display();
  }

  // 📌 Fortschritt speichern bei Navigation
  rendition.on("relocated", (location) => {
    localStorage.setItem(`epub-pos-${buchPfad}`, location.start.cfi);
  });

  // 📌 Steuerung über Buttons
  window.buchVor = () => rendition.next();
  window.buchZurück = () => rendition.prev();
});
