require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "kollu@4374",
  database: process.env.DB_NAME || "kolleswari_petcare",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

// Dashboard totals
app.get("/api/dashboard", asyncRoute(async (req, res) => {
  const [[owners]] = await pool.query("SELECT COUNT(*) AS total FROM owners");
  const [[pets]] = await pool.query("SELECT COUNT(*) AS total FROM pets");
  const [[appointments]] = await pool.query("SELECT COUNT(*) AS total FROM appointments");
  const [[today]] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE appointment_date = CURDATE()");
  res.json({ owners: owners.total, pets: pets.total, appointments: appointments.total, today: today.total });
}));

// OWNERS: list, create, update, delete
app.get("/api/owners", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM owners ORDER BY owner_id DESC");
  res.json(rows);
}));

app.post("/api/owners", asyncRoute(async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name?.trim() || !phone?.trim()) return res.status(400).json({ message: "Owner name and phone are required." });
  const [result] = await pool.query(
    "INSERT INTO owners (name,email,phone,address) VALUES (?,?,?,?)",
    [name.trim(), email || null, phone.trim(), address || null]
  );
  res.status(201).json({ message: "Owner added successfully.", id: result.insertId });
}));

app.put("/api/owners/:id", asyncRoute(async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name?.trim() || !phone?.trim()) return res.status(400).json({ message: "Owner name and phone are required." });
  const [result] = await pool.query(
    "UPDATE owners SET name=?, email=?, phone=?, address=? WHERE owner_id=?",
    [name.trim(), email || null, phone.trim(), address || null, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: "Owner not found." });
  res.json({ message: "Owner updated successfully." });
}));

app.delete("/api/owners/:id", asyncRoute(async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM owners WHERE owner_id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Owner not found." });
    res.json({ message: "Owner deleted successfully." });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") return res.status(409).json({ message: "This owner has registered pets. Delete or reassign the pets first." });
    throw err;
  }
}));

// PETS: joins owner name for the table
app.get("/api/pets", asyncRoute(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.*, o.name AS owner_name
    FROM pets p JOIN owners o ON p.owner_id=o.owner_id
    ORDER BY p.pet_id DESC
  `);
  res.json(rows);
}));

app.post("/api/pets", asyncRoute(async (req, res) => {
  const { owner_id, pet_name, species, breed, age } = req.body;
  if (!owner_id || !pet_name?.trim() || !species) return res.status(400).json({ message: "Owner, pet name and species are required." });
  const [result] = await pool.query(
    "INSERT INTO pets (owner_id,pet_name,species,breed,age) VALUES (?,?,?,?,?)",
    [owner_id, pet_name.trim(), species, breed || null, age === "" ? null : age]
  );
  res.status(201).json({ message: "Pet registered successfully.", id: result.insertId });
}));

app.put("/api/pets/:id", asyncRoute(async (req, res) => {
  const { owner_id, pet_name, species, breed, age } = req.body;
  if (!owner_id || !pet_name?.trim() || !species) return res.status(400).json({ message: "Owner, pet name and species are required." });
  const [result] = await pool.query(
    "UPDATE pets SET owner_id=?, pet_name=?, species=?, breed=?, age=? WHERE pet_id=?",
    [owner_id, pet_name.trim(), species, breed || null, age === "" ? null : age, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: "Pet not found." });
  res.json({ message: "Pet details updated successfully." });
}));

app.delete("/api/pets/:id", asyncRoute(async (req, res) => {
  const [result] = await pool.query("DELETE FROM pets WHERE pet_id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: "Pet not found." });
  res.json({ message: "Pet and its appointment records deleted." });
}));

// APPOINTMENTS
app.get("/api/appointments", asyncRoute(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*, p.pet_name, o.name AS owner_name
    FROM appointments a
    JOIN pets p ON a.pet_id=p.pet_id
    JOIN owners o ON p.owner_id=o.owner_id
    ORDER BY a.appointment_date DESC, a.appointment_id DESC
  `);
  res.json(rows);
}));

app.post("/api/appointments", asyncRoute(async (req, res) => {
  const { pet_id, doctor_name, appointment_date, reason, status } = req.body;
  if (!pet_id || !doctor_name?.trim() || !appointment_date) return res.status(400).json({ message: "Pet, doctor and appointment date are required." });
  const [result] = await pool.query(
    "INSERT INTO appointments (pet_id,doctor_name,appointment_date,reason,status) VALUES (?,?,?,?,?)",
    [pet_id, doctor_name.trim(), appointment_date, reason || null, status || "Scheduled"]
  );
  res.status(201).json({ message: "Appointment booked successfully.", id: result.insertId });
}));

app.put("/api/appointments/:id", asyncRoute(async (req, res) => {
  const { pet_id, doctor_name, appointment_date, reason, status } = req.body;
  if (!pet_id || !doctor_name?.trim() || !appointment_date || !status) return res.status(400).json({ message: "Please complete all required appointment fields." });
  const [result] = await pool.query(
    "UPDATE appointments SET pet_id=?, doctor_name=?, appointment_date=?, reason=?, status=? WHERE appointment_id=?",
    [pet_id, doctor_name.trim(), appointment_date, reason || null, status, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: "Appointment not found." });
  res.json({ message: "Appointment updated successfully." });
}));

app.delete("/api/appointments/:id", asyncRoute(async (req, res) => {
  const [result] = await pool.query("DELETE FROM appointments WHERE appointment_id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: "Appointment not found." });
  res.json({ message: "Appointment deleted successfully." });
}));

// Friendly API errors
// Improved error handling
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    message: err.sqlMessage || err.message || "Internal server error",
    code: err.code || "UNKNOWN_ERROR"
  });
});
// Check MySQL connection when starting the server
async function checkDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL connected successfully!");

    await connection.ping();
    connection.release();

  } catch (error) {
    console.error("MySQL connection failed!");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
  }
}

checkDatabase();

app.listen(PORT, () => {
  console.log(
    `Kolleswari Petcare Center running at http://localhost:${PORT}`
  );
});
app.listen(PORT, () => console.log(`Kolleswari Petcare Center running at http://localhost:${PORT}`));
