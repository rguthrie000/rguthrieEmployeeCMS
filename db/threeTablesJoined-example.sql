DROP DATABASE IF EXISTS hospital;
CREATE DATABASE hospital;
USE hospital;
CREATE TABLE doctor (
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  name VARCHAR(110),
  department VARCHAR(100),
  patient_id INTEGER NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE patient (
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  name VARCHAR(100),
  doctor_id INTEGER NOT NULL,
  prescription_id INTEGER NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE prescription (
  id INTEGER(11) AUTO_INCREMENT NOT NULL,
  name VARCHAR(100),
  description VARCHAR(100),
  PRIMARY KEY (id)
);
INSERT INTO doctor  (name, department, patient_id) values ('DR Jane Austen', 'ER', 1);
INSERT INTO doctor  (name, department, patient_id) values ('DR Mark Twain', 'endocrinologist', 2);
INSERT INTO doctor  (name, department, patient_id) values ('DR Lewis Carroll', 'dermatologist' , 1);
INSERT INTO doctor  (name, department, patient_id) values ('DR Andre Asselin', 'anesthesiologist', 3);
INSERT INTO patient  (name, doctor_id, prescription_id) values ('John Doe', 1, 3);
INSERT INTO patient  (name, doctor_id, prescription_id) values ('Courtney Besteman', 2, 1);
INSERT INTO patient  (name, doctor_id, prescription_id) values ('Kyle Frank', 1, 1);
INSERT INTO patient  (name, doctor_id, prescription_id) values ('Carl Aus', 3, 4);
INSERT INTO patient  (name, doctor_id, prescription_id) values ('Al Duo', 2, 3);
INSERT INTO patient  (name, doctor_id, prescription_id) values ('Frank Allbert', 4, 2);
INSERT INTO patient  (name, doctor_id, prescription_id) values ('Rodger Still', 4, 1);
INSERT INTO prescription (name, description) values ('Amitriptyline HCL', 'fdnasdfjn fjdasfjk fdjakjk');
INSERT INTO prescription (name, description) values ('Acyclovir', 'fdnasdfjn fjdasfjk fdjakjk');
INSERT INTO prescription (name, description) values ('Allopurinol', 'fdnasdfjn fjdasfjk fdjakjk');
INSERT INTO prescription (name, description) values ('Hydrochlorothiazide', 'fdnasdfjn fjdasfjk fdjakjk');
select * from doctor;
select * from patient;
select * from prescription;
select 
	doctor.name as doctor_name,
	patient.name as patient_name,
	prescription.name as prescription_name 
from doctor
join patient on patient.id = doctor.id
join prescription on prescription.id = patient.id;
select doctor.name as doctor_name, patient.name as patient_name, prescription.name  from doctor
join patient on doctor.id = patient.id
join prescription on patient.id = prescription.id;