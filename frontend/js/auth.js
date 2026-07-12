// If a token already exists, skip login/register and go straight to dashboard
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");

// ---------- PASSWORD SHOW/HIDE TOGGLE ----------
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";

    togglePassword.querySelector(".eye-icon").style.display = isHidden ? "none" : "block";
    togglePassword.querySelector(".eye-off-icon").style.display = isHidden ? "block" : "none";
    togglePassword.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });
}

// Shows a message in the shared message area, styled as error or success
function showMessage(text, type = "error") {
  errorMsg.textContent = text;
  errorMsg.classList.remove("error-msg", "success-msg");
  errorMsg.classList.add(type === "success" ? "success-msg" : "error-msg");
}

// ---------- LOGIN ----------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("", "error");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await apiRequest("/auth/login", "POST", { email, password }, false);

      // Store JWT token + basic user info in localStorage for later requests
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));

      showMessage("Login successful! Redirecting...", "success");

      // Brief pause so the success message is actually visible before navigating away
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (error) {
      // Backend returns a generic message for security (doesn't reveal which field was wrong)
      showMessage("Incorrect email or password. Please try again.", "error");
    }
  });
}

// ---------- REGISTER ----------
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage("", "error");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const data = await apiRequest("/auth/register", "POST", { name, email, password }, false);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));

      showMessage("Account created! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}
