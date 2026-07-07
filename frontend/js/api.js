// Change this if your backend runs on a different port/URL
const API_BASE_URL = "https://task-manager-api-ie3z.onrender.com/api";

// Generic fetch wrapper that automatically attaches the JWT token (if present)
// and parses JSON responses. Throws an error with the server's message on failure.
async function apiRequest(endpoint, method = "GET", body = null, useAuth = true) {
  const headers = { "Content-Type": "application/json" };

  if (useAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
