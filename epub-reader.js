document.addEventListener("DOMContentLoaded", () => {
  const viewer = document.getElementById("viewer");
  const params = new URLSearchParams(window.location.search);
  const buchPfad = params.get("file");

  if (!buchPfad) {
    viewer.innerHTML = "<p style='padding: 2rem; color: red;'>❌ Keine EPUB-Datei angegeben.</p>";
    return;
  }

  try {
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

    // 📌 Fortschritt speichern bei Seitenwechsel
    rendition.on("relocated", (location) => {
      localStorage.setItem(`epub-pos-${buchPfad}`, location.start.cfi);
    });

    // 📌 Navigation über Buttons
    window.buchVor = () => rendition.next();
    window.buchZurück = () => rendition.prev();

  } catch (err) {
    viewer.innerHTML = `<p style="padding: 2rem; color: red;">❌ Fehler beim Laden der EPUB-Datei: ${err.message}</p>`;
    console.error("EPUB-Fehler:", err);
  }
});
