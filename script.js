document.addEventListener("DOMContentLoaded", () => {
    function updateUhrzeit() {
        let jetzt = new Date();
        document.getElementById("uhrzeit").textContent = jetzt.toLocaleTimeString("de-DE", { hour12: false });
        document.getElementById("datum").textContent = jetzt.toLocaleDateString("de-DE");
    }

    setInterval(updateUhrzeit, 1000);
    updateUhrzeit();

    async function ladeIslamischesDatum() {
        try {
            let response = await fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toISOString().split('T')[0]);
            let data = await response.json();
            document.getElementById("islamisches-datum").textContent = data.data.hijri.weekday.de;
        } catch (error) {
            console.error("Fehler beim Laden des islamischen Datums:", error);
        }
    }

    async function ladeMekkaUhrzeit() {
        try {
            let response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Riyadh");
            let data = await response.json();
            let mekkaZeit = new Date(data.utc_datetime);
            mekkaZeit.setSeconds(mekkaZeit.getSeconds() + data.raw_offset);
            document.getElementById("mekka-uhrzeit").textContent = "Mekka: " + mekkaZeit.toLocaleTimeString("de-DE", { hour12: false });
        } catch (error) {
            console.error("Fehler beim Laden der Mekka-Zeit:", error);
        }
    }

    async function ladeGebetszeiten(stadt) {
        try {
            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();

            document.getElementById("fajr").textContent = data.data.timings.Fajr;
            document.getElementById("shuruk").textContent = data.data.timings.Sunrise;
            document.getElementById("dhuhr").textContent = data.data.timings.Dhuhr;
            document.getElementById("asr").textContent = data.data.timings.Asr;
            document.getElementById("maghrib").textContent = data.data.timings.Maghrib;
            document.getElementById("isha").textContent = data.data.timings.Isha;
          } 
        catch (error) {
            console.error("Fehler beim Laden der Gebetszeiten:", error);
                }
    }
  
   

    
    async function ladeHadith() {
        let response = await fetch("hadith.json");
        let data = await response.json();
        let zufallsHadith = data[Math.floor(Math.random() * data.length)];
        document.getElementById("hadith-arabisch").textContent = Hadith.arabisch;
        document.getElementById("hadith-deutsch").textContent = Hadith.deutsch;
        document.getElementById("hadith-quelle").textContent = Hadith.quelle;
        document.getElementById("hadith-auth").textContent = Hadith.authentizität;
    }

    async function ladeDua() {
        let response = await fetch("dua.json");
        let data = await response.json();
        let zufallsDua = data[Math.floor(Math.random() * data.length)];
        document.getElementById("dua-arabisch").textContent = zufallsDua.arabisch;
        document.getElementById("dua-deutsch").textContent = zufallsDua.deutsch;
        document.getElementById("dua-trans").textContent = zufallsDua.transliteration;
        document.getElementById("dua-quelle").textContent = zufallsDua.quelle;
    }
 
   async function ermittleStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let stadt = data.address.city || data.address.town || data.address.village || "Unbekannt";
                    document.getElementById("stadt-name").textContent = stadt;
                    ladeGebetszeiten(stadt);
                } catch (error) {
                    console.error("Fehler bei der Standortermittlung:", error);
                }
            }, () => {
                console.error("Standort konnte nicht ermittelt werden.");
                document.getElementById("stadt-name").textContent = "Unbekannt";
            });
        }
    }

    document.getElementById("stadt-auswahl").addEventListener("change", function () {
        let stadt = this.value;
        document.getElementById("stadt-name").textContent = stadt;
        ladeGebetszeiten(stadt);
    });

    async function ladeStadtAuswahl() {
        try {
            let response = await fetch("stadt.json");
            let städte = await response.json();
            let dropdown = document.getElementById("stadt-auswahl");

            städte.forEach(stadt => {
                let option = document.createElement("option");
                option.value = stadt.name;
                option.textContent = stadt.name;
                dropdown.appendChild(option);
            });
        } 
        catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
    }

    ladeStadtAuswahl();
    ermittleStandort();
    ladeIslamischesDatum();
    ladeGebetszeiten(Stadt); 
    ladeMekkaUhrzeit();
    ladeHadith();
    ladeDua();
});


function PrayerTimesApi() {
    var userLang = navigator.language || navigator.userLanguage;
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var prayer_results = JSON.parse(request.responseText);
                console.log(JSON.stringify(prayer_results.results.location.local_offset));
                var prayer_date = new Date(prayer_results.results.datetime[0].date.gregorian);

                var local_offset = prayer_results.results.location.local_offset;
                document.getElementById("prayer_city").innerHTML = prayer_results.results.location.city;
                document.getElementById("prayer_date").innerHTML = prayer_date.toLocaleDateString(userLang, options);
                document.getElementById("Imsak").innerHTML = prayer_results.results.datetime[0].times.Imsak;
                document.getElementById("Fajr").innerHTML = prayer_results.results.datetime[0].times.Fajr;
                document.getElementById("Dhuhr").innerHTML = prayer_results.results.datetime[0].times.Dhuhr;
                document.getElementById("Asr").innerHTML = prayer_results.results.datetime[0].times.Asr;
                document.getElementById("Maghrib").innerHTML = prayer_results.results.datetime[0].times.Maghrib;
                document.getElementById("Isha").innerHTML = prayer_results.results.datetime[0].times.Isha;
                SetTheClock(local_offset);

            } else {
                console.log('An error occurred during your request: ' + request.status + ' ' + request.statusText);
            }
        }
    };
    request.open('Get', api_url, true);
    request.send();
}
function time(offset) {
    var location_date = new Date(new Date().getTime() + (offset * 60000));
    var hours = location_date.getUTCHours(),
        minutes = location_date.getUTCMinutes(),
        seconds = location_date.getUTCSeconds();
    hours = addZero(hours);
    minutes = addZero(minutes);
    seconds = addZero(seconds);
    document.getElementById("prayer_clock").innerHTML = hours + ':' + minutes + ':' + seconds;
}
function addZero(val) {
    return (val <= 9) ? ("0" + val) : val;
}
function SetTheClock(local_offset) {
    time(local_offset);
    setInterval(function () { time(local_offset); }, 1000);
}

