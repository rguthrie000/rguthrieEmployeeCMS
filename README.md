# rguthrieEmployeeCMS
Employee CMS, UCF-ORL-FSF HW 12
rguthrie, 20200114

This node.js CLI app uses a mySQL database to implement a simplified employee Content Management System.

*@*@*@     --- REQUIRES MYSQL CONNECTION. ---       @*@*@*
*@*@*@ 1. ENTER YOUR USERNAME AND PASSWORD AS       @*@*@*
*@*@*@    ARGUMENT DEFAULTS IN ./db/mysqlQueries.js @*@*@*

# Requirements

Functional requirements
* Build a command-line application supporting:
  * Add departments, roles, employees
  * View by department, role, employee, and manager
  * Update employee role and manager
  * Delete departments, roles, and employees
  * View the total utilized budget (combined salaries) of a department

# Design Notes

Design Requirements
* To use and thereby learn JOIN, use multiple tables in the database.
* Assume a functional organization, i.e. no role may be in more than one department.

# Database design

* Relationships:
  * an employee has a name, a role, and may have a manager
  * a role has a title, a salary, and may have a department
  * a department has a name 

DB tables
* **department**:
  * **id**               - INT PRIMARY KEY
  * **name**             - VARCHAR(30) to hold department name
* **role**:
  * **id**               - INT PRIMARY KEY
  * **title**            - VARCHAR(30) to hold role title
  * **salary**           - DECIMAL to hold role salary
  * **department_id**    - INT to hold reference to department role belongs to
* **employee**:
  * **id**               - INT PRIMARY KEY
  * **first_name**       - VARCHAR(30) to hold employee first name
  * **last_name**        - VARCHAR(30) to hold employee last name
  * **role_id**          - INT to hold reference to role employee has
  * **manager_id**       - INT to hold reference to the manager of the current employee.
                           This field may be null if the employee has no manager.mySQL database manager CLI using node.js

These tables are joined as needed to support the required relationships. 

## This application was developed with:
VS Code - Smart Editor for HTML/CSS/JS
node.js - JavaScript command-line interpreter
express.js - JavaScript extension for server support
Google Chrome Inspector - inspection/analysis tools integrated in Chrome Browser.
DBeaver database viewer - mySQL database creation, table creation, and query/visualization development

## Versioning

GitHub is used for version control; the github repository is 
rguthrie000/rguthrieEmployeeCMS.

## Author
rguthrie000 (Richard Guthrie)

## Acknowledgments
rguthrie000 is grateful to the UCF Coding Bootcamp - we rock!



