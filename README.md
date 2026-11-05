# Kolleswari Petcare Center

A responsive pet-care/veterinary management website using HTML, CSS, JavaScript, Node.js, Express and MySQL.

## Project structure

- `server.js` — Express server and REST API
- `database.sql` — database and three tables
- `.env.example` — database configuration template
- `public/index.html` — homepage (uses your supplied doctor photograph)
- `public/owners.html` — owner management
- `public/pets.html` — pet management
- `public/appointments.html` — appointment management
- `public/css/style.css` — shared responsive design
- `public/js/` — browser-side CRUD logic
- `public/images/doctor-kolleswari.jpg` — your supplied doctor photograph

## Requirements

Install Node.js LTS and MySQL Server / MySQL Workbench.

## Setup

1. Open this project folder in VS Code.
2. Open MySQL Workbench, connect to your local MySQL server, open `database.sql`, and execute the whole script.
3. In VS Code terminal, run:
   ```bash
   npm install
   ```
4. Create a file named `.env` in the project root. Copy the contents of `.env.example` and replace `DB_PASSWORD` with your actual MySQL root password.
5. Start the server:
   ```bash
   npm start
   ```
6. Open `http://localhost:3000` in your browser.

## Pages

- `http://localhost:3000/` — Home
- `http://localhost:3000/owners.html` — Owners
- `http://localhost:3000/pets.html` — Pets
- `http://localhost:3000/appointments.html` — Appointments

## Important notes

- Register an owner before registering their pet.
- Register a pet before booking an appointment.
- An owner with pets cannot be deleted until those pets are deleted or reassigned.
- Deleting a pet also deletes its appointments.
- The website loads its additional gallery photos from Unsplash, so an internet connection is needed for those photos. Your doctor photograph is stored locally in this project.
- Do not share your `.env` file or upload it to GitHub.
