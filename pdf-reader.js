document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById("viewer");
  const params = new URLSearchParams(window.location.search);
  const pdfPfad = params.get("file");

  if (!pdfPfad) {
    document.body.innerHTML = "<p style='text-align:center; margin-top:2em;'>❌ Keine PDF-Datei angegeben.</p>";
    return;
  }

  // Fortschritt laden
  const gespeicherterScroll = localStorage.getItem(`pdf-scroll-${pdfPfad}`);
  iframe.src = pdfPfad;

  iframe.addEventListener("load", () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Versuche alle paar Sekunden den Fortschritt zu speichern
    const interval = setInterval(() => {
      try {
        const html = iframe.contentWindow.document.documentElement;
        const body = iframe.contentWindow.document.body;
        const scrolled = html.scrollTop || body.scrollTop;
        const total = (html.scrollHeight || body.scrollHeight) - html.clientHeight;

        if (total > 0) {
          const ratio = Math.round((scrolled / total) * 100);
          localStorage.setItem(`pdf-scroll-${pdfPfad}`, scrolled);
          document.getElementById("progress").textContent = `Fortschritt: ${ratio}%`;
        }
      } catch (e) {
        console.warn("⚠️ Fortschrittsüberwachung nicht möglich:", e);
      }
    }, 1500);

    // Scroll zurücksetzen, falls Fortschritt existiert
    if (gespeicherterScroll) {
      setTimeout(() => {
        try {
          iframe.contentWindow.scrollTo(0, parseInt(gespeicherterScroll));
        } catch (e) {
          console.warn("⚠️ Fehler beim Zurückscrollen:", e);
        }
      }, 800); // warten bis PDF aufgebaut ist
    }
  });
});

