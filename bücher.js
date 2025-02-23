document.addEventListener("DOMContentLoaded", async () => {
    const buchListe = document.getElementById("buch-liste");
    const buchIframe = document.getElementById("buch-iframe");

    async function ladeBücher() {
        try {
            let response = await fetch("bücher.json");
            let bücher = await response.json();

            bücher.forEach(buch => {
                let buchItem = document.createElement("li");
                let downloadLink = document.createElement("a");
                downloadLink.href = buch.datei;
                downloadLink.download = buch.datei.split("/").pop();
                downloadLink.textContent = "📥 Download";

                let leseButton = document.createElement("button");
                leseButton.textContent = "📖 Lesen";
                leseButton.onclick = () => zeigeBuch(buch.datei);

                buchItem.innerHTML = `<strong>${buch.titel}</strong> `;
                buchItem.appendChild(downloadLink);
                buchItem.appendChild(leseButton);
                buchListe.appendChild(buchItem);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Bücher:", error);
        }
    }

    function zeigeBuch(datei) {
        if (datei.endsWith(".pdf")) {
            buchIframe.src = datei;
        } else if (datei.endsWith(".epub")) {
            alert("EPUB-Dateien können nur heruntergeladen und in einer EPUB-Reader-App geöffnet werden.");
        } else {
            alert("Dieses Format wird nicht unterstützt.");
        }
    }

    ladeBücher();
});
