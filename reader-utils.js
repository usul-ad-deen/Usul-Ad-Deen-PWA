 // Diese Funktion öffnet das zuletzt gelesene Buch
window.fortsetzenLetztesBuch = () => {
  const letzteDatei = localStorage.getItem("zuletzt-gelesen");
  if (letzteDatei) {
    window.location.href = `pdf-viewer.html?file=${encodeURIComponent(letzteDatei)}`;
  } else {
    alert("⚠️ Kein zuletzt gelesenes Buch gefunden.");
  }
};
