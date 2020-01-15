USE employee_db;

insert into departments (dept_name)                                     values ("Web Dev");
insert into roles       (role_title,role_salary,dept_id)                values ("VP Engineering",140000.00,1);
insert into roles       (role_title,role_salary,dept_id)                values ("WebDev Manager",120000.00,1);
insert into roles       (role_title,role_salary,dept_id)                values ("Lead Engineer" ,100000.00,1);
insert into roles       (role_title,role_salary,dept_id)                values ("Sr. Engineer"  , 80000.00,1);
insert into roles       (role_title,role_salary,dept_id)                values ("Jr. Engineer"  , 40000.00,1);
insert into departments (dept_name)                                     values ("Sales");
insert into roles       (role_title,role_salary,dept_id)                values ("VP Sales"      ,140000.00,2);
insert into roles       (role_title,role_salary,dept_id)                values ("Sales Mgr"     , 80000.00,2);
insert into roles       (role_title,role_salary,dept_id)                values ("Sales Eng. 2"  , 75000.00,2);
insert into roles       (role_title,role_salary,dept_id)                values ("Sales Eng. 1"  , 65000.00,2);
insert into roles       (role_title,role_salary,dept_id)                values ("Sales Admin"   , 40000.00,2);
insert into employees   (emp_lastname,emp_firstname,role_id)            values ("Fixya","Ican",1);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Boss","Pointy-haired", 2,1);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Groundloop","Dilbert", 3,2);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Worthless","Wally"   , 4,2);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Frustrated","Alice"  , 4,2);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Foreign","Asok"      , 5,2);
insert into employees   (emp_lastname,emp_firstname,role_id)            values ("Sellya","Iwill"      , 6);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Quota","Getyer"      , 7,7);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Finesse","Smooth"    , 8,8);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Closer","Hard"       , 8,8);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Happy","Perky"       , 9,8);
insert into employees   (emp_lastname,emp_firstname,role_id,emp_mgr_id) values ("Control","Under"     ,10,8);
