document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
      const loginLink = document.getElementById("login-link");
  const userInfo = document.getElementById("user-info");
  const greeting = document.getElementById("greeting");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            let users = JSON.parse(localStorage.getItem("users")) || [];
            if (users.find(user => user.email === email)) {
                alert("E-Mail ist bereits registriert!");
                return;
            }

            users.push({ username, email, password });
            localStorage.setItem("users", JSON.stringify(users));

            alert("Registrierung erfolgreich! Jetzt einloggen.");
            window.location.href = "login.html";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            let users = JSON.parse(localStorage.getItem("users")) || [];
            let user = users.find(user => user.email === email && user.password === password);

            if (user) {
                localStorage.setItem("loggedInUser", JSON.stringify(user));
                alert("Login erfolgreich!");
                window.location.href = "index.html";
            } else {
                alert("Falsche E-Mail oder Passwort!");
            }
        });
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            alert("Erfolgreich ausgeloggt!");
            window.location.href = "login.html";
        });
    }
    import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Nutzer ist eingeloggt
      loginLink.classList.add("hidden");
      userInfo.classList.remove("hidden");

      const name = user.displayName || user.email.split("@")[0];
      greeting.textContent = `👋 Assalamu alaikum, ${name}`;
    } else {
      // Nutzer ist ausgeloggt
      loginLink.classList.remove("hidden");
      userInfo.classList.add("hidden");
    }
  });


window.logout = () => {
  signOut(auth).then(() => {
    location.reload(); // Seite neu laden nach Logout
  });
};

});
