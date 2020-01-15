select * from (SELECT 
    dept_name,
    emp_lastname,
    emp_firstname,
    role_title,
    role_salary,
    emp_id,
    emp_mgr_id
FROM
    departments
INNER JOIN
    roles USING (dept_id)
INNER JOIN
    employees USING (role_id)
where dept_id = 1    
ORDER BY 
    dept_name,
    role_salary desc,
    emp_lastname) all_data;
   