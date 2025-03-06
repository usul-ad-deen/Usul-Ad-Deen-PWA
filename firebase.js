// 📌 Firebase SDKs importieren
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// 📌 Deine Firebase-Konfiguration (ersetze mit deinem neuen API-Schlüssel!)
const firebaseConfig = {
    apiKey: "AIzaSyBJ_WZNmKqrYBDveXLXkMxe7AzQq83GIPs",
    authDomain: "usul-ad-deen.firebaseapp.com",
    projectId: "usul-ad-deen",
    storageBucket: "",  // 🚀 Storage NICHT benötigt → einfach leer lassen oder entfernen
    messagingSenderId: "537579282911",
    appId: "1:537579282911:web:3146df04b4ea3fca1fa46a",
    measurementId: "G-HXVEZ8RC0T"
  };

// 📌 Firebase initialisieren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 📌 Firebase-Module exportieren, damit andere Skripte sie nutzen können
export { auth, db };
