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
                let appStoreLink = buch.appstore ? `<a href="${buch.appstore}" target="_blank">📱 App Store</a>` : "";
                let playStoreLink = buch.playstore ? `<a href="${buch.playstore}" target="_blank">📱 Google Play</a>` : "";
                let leseButton = buch.pdf ? `<button onclick="zeigeBuch('${buch.pdf}')">📖 Lesen</button>` : "";

                buchItem.innerHTML = `<strong>${buch.titel}</strong> ${pdfLink} ${epubLink} ${appStoreLink} ${playStoreLink} ${leseButton}`;
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
            alert("Dieses Buch kann nur heruntergeladen werden.");
        }
    };

    ladeBücher();
});