CREATE DATABASE IF NOT EXISTS kolleswari_petcare;
USE kolleswari_petcare;

CREATE TABLE IF NOT EXISTS owners (
  owner_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(15) NOT NULL,
  address VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS pets (
  pet_id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  pet_name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL,
  breed VARCHAR(50),
  age INT,
  CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id)
    REFERENCES owners(owner_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  appointment_date DATE NOT NULL,
  reason VARCHAR(200),
  status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
  CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id)
    REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Optional sample data. Run once if you want demo records.
INSERT INTO owners (name,email,phone,address)
SELECT 'Ananya Rao','ananya@example.com','9876543210','Kurnool, Andhra Pradesh'
WHERE NOT EXISTS (SELECT 1 FROM owners WHERE email='ananya@example.com');

INSERT INTO pets (owner_id,pet_name,species,breed,age)
SELECT owner_id,'Buddy','Dog','Golden Retriever',3 FROM owners
WHERE email='ananya@example.com'
AND NOT EXISTS (SELECT 1 FROM pets WHERE pet_name='Buddy' AND owner_id=owners.owner_id);
