document.addEventListener("DOMContentLoaded", async () => {
    const buchListe = document.getElementById("buch-liste");
    const buchIframe = document.getElementById("buch-iframe");

    async function ladeBücher() {
        try {
            let response = await fetch("bücher.json");
            let bücher = await response.json();

            bücher.forEach(buch => {
                let buchItem = document.createElement("li");
                buchItem.innerHTML = `<strong>${buch.titel}</strong> 
                    <a href="${buch.datei}" download target="_blank">📥 Download</a> 
                    <button onclick="zeigeBuch('${buch.datei}')">📖 Lesen</button>`;
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
            alert("EPUB kann derzeit nur heruntergeladen werden.");
        }
    };

    ladeBücher();
});

