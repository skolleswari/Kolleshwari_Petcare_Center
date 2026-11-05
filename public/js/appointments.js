let appointmentRows = [], registeredPets = [];
const appointmentForm = document.getElementById("appointmentForm");
async function loadAppointmentData() {
  try {
    [appointmentRows, registeredPets] = await Promise.all([apiRequest("/api/appointments"), apiRequest("/api/pets")]);
    document.getElementById("appointment_pet").innerHTML = '<option value="">Select registered pet</option>' +
      registeredPets.map(p => `<option value="${p.pet_id}">${safe(p.pet_name)} — ${safe(p.owner_name)}</option>`).join("");
    renderAppointments(appointmentRows);
    document.getElementById("appointmentCount").textContent = `${appointmentRows.length} visits`;
  } catch (error) { showMessage("appointmentMessage", error.message, true); }
}
function renderAppointments(rows) {
  document.getElementById("appointmentsTable").innerHTML = rows.length ? rows.map(a => `
    <tr><td>#${a.appointment_id}</td><td><b>${safe(a.pet_name)}</b><br><small>${safe(a.owner_name)}</small></td>
    <td>${new Date(a.appointment_date).toLocaleDateString("en-IN")}</td><td>${safe(a.doctor_name)}</td>
    <td><span class="status ${safe(a.status)}">${safe(a.status)}</span></td>
    <td><button class="action-btn edit-btn" onclick="editAppointment(${a.appointment_id})">Edit</button><button class="action-btn delete-btn" onclick="deleteAppointment(${a.appointment_id})">Delete</button></td></tr>`).join("") : '<tr><td colspan="6">No appointments booked yet.</td></tr>';
}
appointmentForm.addEventListener("submit", async e => {
  e.preventDefault(); const id = document.getElementById("appointment_id").value;
  const payload = {
    pet_id: document.getElementById("appointment_pet").value,
    doctor_name: document.getElementById("doctor_name").value,
    appointment_date: document.getElementById("appointment_date").value,
    reason: document.getElementById("appointment_reason").value,
    status: document.getElementById("appointment_status").value
  };
  try {
    const result = await apiRequest(id ? `/api/appointments/${id}` : "/api/appointments", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    showMessage("appointmentMessage", result.message); resetAppointmentForm(); loadAppointmentData();
  } catch (error) { showMessage("appointmentMessage", error.message, true); }
});
function editAppointment(id) {
  const a = appointmentRows.find(row => row.appointment_id === id); if (!a) return;
  document.getElementById("appointment_id").value = a.appointment_id;
  document.getElementById("appointment_pet").value = a.pet_id;
  document.getElementById("doctor_name").value = a.doctor_name;
  document.getElementById("appointment_date").value = String(a.appointment_date).slice(0,10);
  document.getElementById("appointment_reason").value = a.reason || "";
  document.getElementById("appointment_status").value = a.status;
  document.getElementById("appointmentFormTitle").textContent = "Update appointment";
  document.getElementById("appointmentSubmit").textContent = "Update visit";
  window.scrollTo({ top: 250, behavior: "smooth" });
}
async function deleteAppointment(id) {
  if (!confirm("Delete this appointment?")) return;
  try { const result = await apiRequest(`/api/appointments/${id}`, { method: "DELETE" }); showMessage("appointmentMessage", result.message); loadAppointmentData(); }
  catch (error) { showMessage("appointmentMessage", error.message, true); }
}
function resetAppointmentForm() {
  appointmentForm.reset(); document.getElementById("appointment_id").value = "";
  document.getElementById("appointmentFormTitle").textContent = "Book a visit";
  document.getElementById("appointmentSubmit").textContent = "Book appointment";
}
document.getElementById("appointmentSearch").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderAppointments(appointmentRows.filter(a => [a.pet_name,a.owner_name,a.doctor_name,a.status,a.reason].join(" ").toLowerCase().includes(q)));
});
loadAppointmentData();
