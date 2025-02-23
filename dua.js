document.addEventListener("DOMContentLoaded", async () => {
    const duaListe = document.getElementById("dua-liste");
    const duaDetail = document.getElementById("dua-detail");
    const duaTitel = document.getElementById("dua-titel");
    const duaArabisch = document.getElementById("dua-arabisch");
    const duaTransliteration = document.getElementById("dua-transliteration");
    const duaDeutsch = document.getElementById("dua-deutsch");
    const duaQuelle = document.getElementById("dua-quelle");

    async function ladeDuas() {
        try {
            let response = await fetch("dua.json");
            let duas = await response.json();

            duas.forEach(dua => {
                let duaItem = document.createElement("li");
                duaItem.innerHTML = `<strong>${dua.titel}</strong>`;
                duaItem.onclick = () => zeigeDua(dua);
                duaListe.appendChild(duaItem);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Bittgebete:", error);
        }
    }

    function zeigeDua(dua) {
        duaListe.style.display = "none";
        duaDetail.style.display = "block";
        duaTitel.textContent = dua.titel;
        duaArabisch.textContent = dua.arabisch;
        duaTransliteration.textContent = dua.transliteration;
        duaDeutsch.textContent = dua.deutsch;
        duaQuelle.textContent = dua.quelle;
         duaAuthentizität.textContent = dua.authentizität;
    }

    window.schließeDua = function() {
        duaListe.style.display = "block";
        duaDetail.style.display = "none";
    };

    ladeDuas();
});
