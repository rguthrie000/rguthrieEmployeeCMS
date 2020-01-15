use employee_db;

select * from (
	select
		dept_name,
		role_title,
		role_salary
	from
		departments
	inner join roles using (dept_id)
) all_data;

select * from (
	select
		dept_name,
		emp_lastname,
		emp_firstname,
		role_title,
		role_salary,
		emp_id,
		emp_mgr_id
	from
		departments
	inner join roles     using (dept_id)
	inner join employees using (role_id)
	order by dept_name, role_salary desc, emp_lastname
) all_data;