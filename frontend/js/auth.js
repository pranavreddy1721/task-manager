// If a token already exists, skip login/register and go straight to dashboard
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");

// ---------- LOGIN ----------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await apiRequest("/auth/login", "POST", { email, password }, false);

      // Store JWT token + basic user info in localStorage for later requests
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));

      window.location.href = "dashboard.html";
    } catch (error) {
      errorMsg.textContent = error.message;
    }
  });
}

// ---------- REGISTER ----------
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await apiRequest("/auth/register", "POST", { name, email, password }, false);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));

      window.location.href = "dashboard.html";
    } catch (error) {
      errorMsg.textContent = error.message;
    }
  });
}
