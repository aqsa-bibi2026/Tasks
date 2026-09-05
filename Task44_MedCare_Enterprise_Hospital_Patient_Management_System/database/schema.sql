CREATE TABLE patients(id SERIAL PRIMARY KEY,name VARCHAR(100),age INT,medical_issue TEXT);
CREATE TABLE doctors(id SERIAL PRIMARY KEY,name VARCHAR(100),specialization VARCHAR(100));
CREATE TABLE appointments(id SERIAL PRIMARY KEY,patient_id INT,doctor_id INT,date DATE);
CREATE TABLE medical_records(id SERIAL PRIMARY KEY,patient_id INT,details TEXT);
CREATE TABLE billing(id SERIAL PRIMARY KEY,patient_id INT,amount DECIMAL(10,2),status VARCHAR(50));