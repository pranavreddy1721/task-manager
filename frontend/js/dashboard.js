// ---------- Guard: must be logged in to view this page ----------
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

const user = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById("userGreeting").textContent = `Hi, ${user.name || "there"} 👋`;

// ---------- Elements ----------
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const logoutBtn = document.getElementById("logoutBtn");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");

let editingTaskId = null; // tracks whether the form is in "add" or "edit" mode

// ---------- Logout ----------
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// ---------- Fetch & Render Tasks (READ) ----------
async function loadTasks() {
  try {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.append("search", searchInput.value.trim());
    if (filterStatus.value) params.append("status", filterStatus.value);
    if (filterPriority.value) params.append("priority", filterPriority.value);

    const query = params.toString() ? `?${params.toString()}` : "";
    const tasks = await apiRequest(`/tasks${query}`, "GET");

    renderTasks(tasks);
  } catch (error) {
    console.error("Failed to load tasks:", error.message);
    if (error.message.toLowerCase().includes("not authorized")) {
      localStorage.clear();
      window.location.href = "index.html";
    }
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = "";

  if (!tasks.length) {
    taskList.appendChild(emptyState);
    emptyState.style.display = "block";
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = `task-card priority-${task.priority} ${
      task.status === "Completed" ? "completed" : ""
    }`;

    const dueDateText = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : "No due date";

    card.innerHTML = `
      <div class="task-main">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ""}
        <div class="task-meta">
          <span class="badge ${task.priority}">${task.priority}</span>
          <span class="badge ${task.status}">${task.status}</span>
          <span>📅 ${dueDateText}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn toggle-btn" data-id="${task._id}" data-status="${task.status}">
          ${task.status === "Completed" ? "↩ Undo" : "✔ Done"}
        </button>
        <button class="icon-btn edit-btn" data-id="${task._id}">✏ Edit</button>
        <button class="icon-btn delete delete-btn" data-id="${task._id}">🗑 Delete</button>
      </div>
    `;

    taskList.appendChild(card);
  });

  attachCardListeners(tasks);
}

// Basic escaping to avoid breaking HTML if a task title/description contains special characters
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- CREATE / UPDATE (same form handles both) ----------
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    priority: document.getElementById("priority").value,
    dueDate: document.getElementById("dueDate").value || null,
    status: document.getElementById("status").value,
  };

  try {
    if (editingTaskId) {
      await apiRequest(`/tasks/${editingTaskId}`, "PUT", payload);
    } else {
      await apiRequest("/tasks", "POST", payload);
    }

    resetForm();
    loadTasks();
  } catch (error) {
    alert(error.message);
  }
});

function attachCardListeners(tasks) {
  // Toggle complete/incomplete
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const currentStatus = btn.dataset.status;
      const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";

      try {
        await apiRequest(`/tasks/${id}`, "PUT", { status: newStatus });
        loadTasks();
      } catch (error) {
        alert(error.message);
      }
    });
  });

  // Edit -> populate form
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const task = tasks.find((t) => t._id === btn.dataset.id);
      if (!task) return;

      editingTaskId = task._id;
      document.getElementById("title").value = task.title;
      document.getElementById("description").value = task.description || "";
      document.getElementById("priority").value = task.priority;
      document.getElementById("status").value = task.status;
      document.getElementById("dueDate").value = task.dueDate
        ? task.dueDate.split("T")[0]
        : "";

      formTitle.textContent = "Edit Task";
      submitBtn.textContent = "Update Task";
      cancelEditBtn.style.display = "inline-block";

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this task? This cannot be undone.")) return;

      try {
        await apiRequest(`/tasks/${btn.dataset.id}`, "DELETE");
        loadTasks();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

// ---------- Cancel edit ----------
cancelEditBtn.addEventListener("click", resetForm);

function resetForm() {
  editingTaskId = null;
  taskForm.reset();
  document.getElementById("priority").value = "Medium";
  document.getElementById("status").value = "Pending";
  formTitle.textContent = "Add New Task";
  submitBtn.textContent = "Add Task";
  cancelEditBtn.style.display = "none";
}

// ---------- Filters (re-fetch from server on change) ----------
let searchDebounce;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadTasks, 400); // debounce so it doesn't fire on every keystroke
});
filterStatus.addEventListener("change", loadTasks);
filterPriority.addEventListener("change", loadTasks);

// ---------- Initial load ----------
loadTasks();
