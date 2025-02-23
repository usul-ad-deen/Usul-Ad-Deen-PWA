document.addEventListener("DOMContentLoaded", async () => {
    const buchListe = document.getElementById("buch-liste");
    const buchIframe = document.getElementById("buch-iframe");

    async function ladeBücher() {
        try {
            let response = await fetch("bücher.json");
            let bücher = await response.json();

            bücher.forEach(buch => {
                let buchItem = document.createElement("li");

                let pdfLink = buch.pdf ? `<a href="${buch.pdf}" download>📥 PDF</a>` : "";
                let epubLink = buch.epub ? `<a href="${buch.epub}" download>📥 EPUB</a>` : "";
                let leseButton = buch.pdf ? `<button onclick="zeigeBuch('${buch.pdf}')">📖 Lesen</button>` : "";

                buchItem.innerHTML = `<strong>${buch.titel}</strong> ${pdfLink} ${epubLink} ${leseButton}`;
                buchListe.appendChild(buchItem);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Bücher:", error);
        }
    }

    window.zeigeBuch = function(datei) {
        if (datei.endsWith(".pdf")) {
            buchIframe.src = datei;
        } else {
            alert("Dieses Format wird nur als Download unterstützt.");
        }
    };

    ladeBücher();
});