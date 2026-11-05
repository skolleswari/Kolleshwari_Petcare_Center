document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) toggle.addEventListener("click", () => nav.classList.toggle("open"));
});

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
function showMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", isError);
}
function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[char]);
}
