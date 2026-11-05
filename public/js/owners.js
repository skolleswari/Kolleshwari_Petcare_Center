let ownerRows = [];
const ownerForm = document.getElementById("ownerForm");
async function loadOwners() {
  try {
    ownerRows = await apiRequest("/api/owners");
    renderOwners(ownerRows);
    document.getElementById("ownerCount").textContent = `${ownerRows.length} owners`;
  } catch (error) { showMessage("ownerMessage", error.message, true); }
}
function renderOwners(rows) {
  const body = document.getElementById("ownersTable");
  body.innerHTML = rows.length ? rows.map(o => `
    <tr><td>#${o.owner_id}</td><td><b>${safe(o.name)}</b><br><small>${safe(o.email || "")}</small></td>
    <td>${safe(o.phone)}</td><td>${safe(o.address || "—")}</td>
    <td><button class="action-btn edit-btn" onclick="editOwner(${o.owner_id})">Edit</button><button class="action-btn delete-btn" onclick="deleteOwner(${o.owner_id})">Delete</button></td></tr>`).join("") : '<tr><td colspan="5">No owners found. Add your first owner.</td></tr>';
}
ownerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("owner_id").value;
  const payload = {
    name: document.getElementById("owner_name").value,
    email: document.getElementById("owner_email").value,
    phone: document.getElementById("owner_phone").value,
    address: document.getElementById("owner_address").value
  };
  try {
    const result = await apiRequest(id ? `/api/owners/${id}` : "/api/owners", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    showMessage("ownerMessage", result.message); resetOwnerForm(); loadOwners();
  } catch (error) { showMessage("ownerMessage", error.message, true); }
});
function editOwner(id) {
  const o = ownerRows.find(row => row.owner_id === id); if (!o) return;
  document.getElementById("owner_id").value = o.owner_id;
  document.getElementById("owner_name").value = o.name;
  document.getElementById("owner_email").value = o.email || "";
  document.getElementById("owner_phone").value = o.phone;
  document.getElementById("owner_address").value = o.address || "";
  document.getElementById("ownerFormTitle").textContent = "Update owner";
  document.getElementById("ownerSubmit").textContent = "Update owner";
  window.scrollTo({ top: 250, behavior: "smooth" });
}
async function deleteOwner(id) {
  if (!confirm("Delete this owner? Owners with registered pets cannot be deleted.")) return;
  try { const result = await apiRequest(`/api/owners/${id}`, { method: "DELETE" }); showMessage("ownerMessage", result.message); loadOwners(); }
  catch (error) { showMessage("ownerMessage", error.message, true); }
}
function resetOwnerForm() {
  ownerForm.reset(); document.getElementById("owner_id").value = "";
  document.getElementById("ownerFormTitle").textContent = "Add new owner";
  document.getElementById("ownerSubmit").textContent = "Save owner";
}
document.getElementById("ownerSearch").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderOwners(ownerRows.filter(o => [o.name,o.email,o.phone,o.address].join(" ").toLowerCase().includes(q)));
});
loadOwners();
