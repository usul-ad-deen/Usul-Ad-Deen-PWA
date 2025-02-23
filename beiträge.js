document.addEventListener("DOMContentLoaded", async () => {
    const beitragsListe = document.getElementById("beitrags-liste");
    const beitragDetail = document.getElementById("beitrag-detail");
    const beitragTitel = document.getElementById("beitrag-titel");
    const beitragDatum = document.getElementById("beitrag-datum");
    const beitragInhalt = document.getElementById("beitrag-inhalt");

    async function ladeBeiträge() {
        try {
            let response = await fetch("beiträge.json");
            let beiträge = await response.json();

            beiträge.forEach(beitrag => {
                let beitragsItem = document.createElement("li");
                beitragsItem.innerHTML = `<strong>${beitrag.titel}</strong> - <em>${beitrag.datum}</em>`;
                beitragsItem.onclick = () => zeigeBeitrag(beitrag);
                beitragsListe.appendChild(beitragsItem);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Beiträge:", error);
        }
    }

    function zeigeBeitrag(beitrag) {
        beitragsListe.style.display = "none";
        beitragDetail.style.display = "block";
        beitragTitel.textContent = beitrag.titel;
        beitragDatum.textContent = "Veröffentlicht am: " + beitrag.datum;
        beitragInhalt.textContent = beitrag.inhalt;
    }

    window.schließeBeitrag = function() {
        beitragsListe.style.display = "block";
        beitragDetail.style.display = "none";
    };

    ladeBeiträge();
});