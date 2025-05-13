document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const buchPfad = params.get("file");

  if (!buchPfad) {
    alert("❌ Keine EPUB-Datei angegeben.");
    return;
  }

  const buch = ePub(buchPfad);
  const rend = buch.renderTo("viewer", {
    width: "100%",
    height: "100%",
    spread: "none"
  });

  // 📌 Fortschritt wiederherstellen
  const gespeichertePosition = localStorage.getItem(`epub-pos-${buchPfad}`);
  if (gespeichertePosition) {
    rend.display(gespeichertePosition);
  } else {
    rend.display();
  }

  // 📌 Fortschritt speichern bei Seitenwechsel
  rend.on("relocated", (location) => {
    localStorage.setItem(`epub-pos-${buchPfad}`, location.start.cfi);
  });

  // 📌 Navigation über Buttons
  window.buchVor = () => rend.next();
  window.buchZurück = () => rend.prev();
});
