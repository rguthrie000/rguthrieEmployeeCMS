// Employee CMS, UCF-ORL-FSF HW 12
// rguthrie, 20200112

//
//*@*@*@   --- REQUIRES MYSQL CONNECTION. ---   @*@*@*
//*@*@*@ 1. ENTER YOUR USERNAME AND PASSWORD AS @*@*@*
//*@*@*@ ARGUMENT DEFAULTS IN ./mysqlConnect.js @*@*@*
//*@*@*@ 2. USE CORRECT DEPENDENCY PER COMMENTS @*@*@*
//*@*@*@ IN Dependencies BLOCK BELOW.           @*@*@*
//

//********************
//*   Design Notes   *
//********************

// Functional requirements
// * Build a command-line application supporting:
//   * Add departments, roles, employees
//   * View by department, role, employee, and (BONUS) manager
//   * Update employee role and (BONUS) manager
//   * (BONUS) Delete departments, roles, and employees
//   * (BONUS) View the total utilized budget (combined salaries) of a department
// 
// Design Requirements
// * To use and thereby learn JOIN, use multiple tables in the database.
// * Assume a functional organization, i.e. no role may be in more than one department.
// * Relationships:
//   * an employee has a name, a role, and may have a manager
//   * a role has a title, a salary, and may have a department
//   * a department has a name 
//
// DB tables
// * **department**:
//   * **id**               - INT PRIMARY KEY
//   * **name**             - VARCHAR(30) to hold department name
// * **role**:
//   * **id**               - INT PRIMARY KEY
//   * **title**            - VARCHAR(30) to hold role title
//   * **salary**           - DECIMAL to hold role salary
//   * **department_id**    - INT to hold reference to department role belongs to
// * **employee**:
//   * **id**               - INT PRIMARY KEY
//   * **first_name**       - VARCHAR(30) to hold employee first name
//   * **last_name**        - VARCHAR(30) to hold employee last name
//   * **role_id**          - INT to hold reference to role employee has
//   * **manager_id**       - INT to hold reference to the manager of the current employee.
//                            This field may be null if the employee has no manager.
  
//********************
//*   Dependencies   *
//********************

const clear     = require("clear");
const chalk     = require("chalk");
const figlet    = require("figlet");
const inquirer  = require('inquirer');
const dbQuery   = require("./db/mysqlQueries.js");

// *@*@*@ TO USE YOUR mysqlConnect.js, WITH YOUR USERNAME AND PASSWORD @*@*@*

// *@*@*@ UNCOMMENT THIS LINE @*@*@*
// const openMySQL = require('./mysqlConnect.js');

// *@*@*@ AND COMMENT OUT THIS LINE @*@*@*
const openMySQL = require('./db/mysqlConnect.js');


//***************
//*   Globals   *
//***************


//*****************
//*   Functions   *
//*****************

// prompt() is the endpoint of the response handling for all database queries.
function prompt() {
    clear();
    console.log(chalk.yellow(figlet.textSync('Employee Database', { horizontalLayout: 'full' })));
    console.log(chalk.green('Welcome!\n'));
}


//***************
//*   Startup   *
//***************

// Open a mySQL connection and select an existing database.
// Two additional arguments may be provided: username, password.
// In mysqlConnect.js, the definition of openMySQL has these arguments
// with *my* defaults, so the working version of this function is 
// not pushed. I have provided 'mysqlConnect_inspect.js' to show 
// the code without providing defaults for username and password.

let queryObj = {
     table: '',
     idCols:  [],    // array of column name strings
     idVals:  [],    // array of values to match, corresponds to idCols.
     setCols: [],    // array of column name strings
     setVals: []     // array of values to set, corresponds to setCols.
}

// prompt();
// query.openMySQL('employee_db'); 

main(); async function main() {
    await dbQuery.dbQuery('selectDept');

    queryObj.idVals[0] = 2;
    await dbQuery.dbQuery('selectRoles',queryObj);

    await dbQuery.dbQuery('selectEmployees',queryObj);

    // queryObj.table = 'departments';
    // queryObj.idCols[0]  = 'dept_name'; queryObj.idVals[0]  = 'Sales';
    // queryObj.setCols[0] = 'dept_name'; queryObj.setVals[0] = 'Marketing';
    // await dbQuery.dbQuery('update',queryObj);

    // await dbQuery.dbQuery('selectDept');

    queryObj.table = 'employees';
    queryObj.idCols[0]  = 'emp_lastname' ; queryObj.idVals[0]  = 'Frustrated';
    queryObj.idCols[1]  = 'emp_firstname'; queryObj.idVals[1]  = 'Alice';
    await dbQuery.dbQuery('delete',queryObj);

    queryObj.idCols = [];
    await dbQuery.dbQuery('selectEmployees',queryObj);

    queryObj.table = 'employees';
    queryObj.setCols[0]  = 'emp_lastname' ; queryObj.setVals[0]  = 'Frustrated';
    queryObj.setCols[1]  = 'emp_firstname'; queryObj.setVals[1]  = 'Alice';
    queryObj.setCols[2]  = 'role_id'      ; queryObj.setVals[2]  = 4;
    queryObj.setCols[3]  = 'emp_mgr_id'   ; queryObj.setVals[3]  = 2;
    await dbQuery.dbQuery('insert',queryObj);

    queryObj.idCols = [];
    await dbQuery.dbQuery('selectEmployees',queryObj);

    dbQuery.closeMySQL();
}
