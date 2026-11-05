let petRows = [], ownerOptions = [];
const petForm = document.getElementById("petForm");
async function loadPetData() {
  try {
    [petRows, ownerOptions] = await Promise.all([apiRequest("/api/pets"), apiRequest("/api/owners")]);
    const select = document.getElementById("pet_owner");
    select.innerHTML = '<option value="">Select owner</option>' + ownerOptions.map(o => `<option value="${o.owner_id}">${safe(o.name)} — ${safe(o.phone)}</option>`).join("");
    renderPets(petRows); document.getElementById("petCount").textContent = `${petRows.length} pets`;
  } catch (error) { showMessage("petMessage", error.message, true); }
}
function renderPets(rows) {
  document.getElementById("petsTable").innerHTML = rows.length ? rows.map(p => `
    <tr><td>#${p.pet_id}</td><td><b>${safe(p.pet_name)}</b></td><td>${safe(p.species)}<br><small>${safe(p.breed || "Breed not specified")}</small></td>
    <td>${safe(p.owner_name)}</td><td>${safe(p.age ?? "—")}</td>
    <td><button class="action-btn edit-btn" onclick="editPet(${p.pet_id})">Edit</button><button class="action-btn delete-btn" onclick="deletePet(${p.pet_id})">Delete</button></td></tr>`).join("") : '<tr><td colspan="6">No pets registered yet.</td></tr>';
}
petForm.addEventListener("submit", async e => {
  e.preventDefault(); const id = document.getElementById("pet_id").value;
  const payload = {
    owner_id: document.getElementById("pet_owner").value,
    pet_name: document.getElementById("pet_name").value,
    species: document.getElementById("pet_species").value,
    breed: document.getElementById("pet_breed").value,
    age: document.getElementById("pet_age").value
  };
  try {
    const result = await apiRequest(id ? `/api/pets/${id}` : "/api/pets", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    showMessage("petMessage", result.message); resetPetForm(); loadPetData();
  } catch (error) { showMessage("petMessage", error.message, true); }
});
function editPet(id) {
  const p = petRows.find(row => row.pet_id === id); if (!p) return;
  document.getElementById("pet_id").value = p.pet_id;
  document.getElementById("pet_owner").value = p.owner_id;
  document.getElementById("pet_name").value = p.pet_name;
  document.getElementById("pet_species").value = p.species;
  document.getElementById("pet_breed").value = p.breed || "";
  document.getElementById("pet_age").value = p.age ?? "";
  document.getElementById("petFormTitle").textContent = "Update pet details";
  document.getElementById("petSubmit").textContent = "Update pet";
  window.scrollTo({ top: 250, behavior: "smooth" });
}
async function deletePet(id) {
  if (!confirm("Delete this pet? Its appointment records will also be deleted.")) return;
  try { const result = await apiRequest(`/api/pets/${id}`, { method: "DELETE" }); showMessage("petMessage", result.message); loadPetData(); }
  catch (error) { showMessage("petMessage", error.message, true); }
}
function resetPetForm() {
  petForm.reset(); document.getElementById("pet_id").value = "";
  document.getElementById("petFormTitle").textContent = "Register a pet";
  document.getElementById("petSubmit").textContent = "Save pet";
}
document.getElementById("petSearch").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderPets(petRows.filter(p => [p.pet_name,p.species,p.breed,p.owner_name].join(" ").toLowerCase().includes(q)));
});
loadPetData();
