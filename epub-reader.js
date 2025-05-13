let buchPfad = new URLSearchParams(window.location.search).get("buch");

if (!buchPfad) {
  alert("❌ Keine EPUB-Datei angegeben.");
} else {
  const buch = ePub(buchPfad);
  const rend = buch.renderTo("viewer", {
    width: "100%",
    height: "100%",
    spread: "none"
  });

  // Fortschritt speichern (optional)
  const gespeichertePosition = localStorage.getItem(`epub-pos-${buchPfad}`);
  if (gespeichertePosition) {
    buch.rendition.display(gespeichertePosition);
  } else {
    buch.rendition.display();
  }

  buch.rendition.on("relocated", (location) => {
    localStorage.setItem(`epub-pos-${buchPfad}`, location.start.cfi);
  });

  // Navigation
  window.buchVor = () => buch.rendition.next();
  window.buchZurück = () => buch.rendition.prev();
}
