document.addEventListener("DOMContentLoaded", async () => {
    const buchListe = document.getElementById("buch-liste");
    const buchIframe = document.getElementById("buch-iframe");

    async function ladeBücher() {
        try {
            let response = await fetch("bücher.json");
            let bücher = await response.json();

            bücher.forEach(buch => {
                let buchItem = document.createElement("li");
                buchItem.innerHTML = `<strong>${buch.titel}</strong> - <a href="${buch.datei}" target="_blank">Herunterladen</a> | <button onclick="zeigeBuch('${buch.datei}')">Lesen</button>`;
                buchListe.appendChild(buchItem);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Bücher:", error);
        }
    }

    window.zeigeBuch = function(datei) {
        buchIframe.src = datei;
    };

    ladeBücher();
});
