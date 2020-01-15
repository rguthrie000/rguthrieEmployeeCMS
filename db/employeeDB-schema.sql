drop database if exists employee_db;
create database employee_db;
use employee_db;

create table departments (
	dept_id int auto_increment primary key,
	dept_name varchar(30) not null
);
create table roles (
	role_id int not null auto_increment primary key,
	role_title varchar(30) not null,
	role_salary decimal(10,2) default 0,
	role_manager boolean default false,
	dept_id int,
    constraint fk_department
	foreign key (dept_id) references departments(dept_id)
);
create table employees (
	emp_id int not null auto_increment primary key,
	emp_lastname varchar(30) not null,
	emp_firstname varchar(30) not null,
	emp_mgr_id int,
	emp_manager boolean default false,
	role_id int,
	constraint fk_emp_role_id foreign key (role_id) references roles(role_id)
);

