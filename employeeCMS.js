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

const clear       = require("clear");
const chalk       = require("chalk");
const figlet      = require("figlet");
const inquirer    = require('inquirer');
const dbQuery     = require("./db/mysqlQueries.js");
const QueryObject = require("./lib/ClassLib.js");

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

let queryObj = new QueryObject();

function promptList   (question,choices) { return inquirer.prompt([{name:"str"   ,type:"list"   ,message:question, choices:choices}])}
function promptString (question)         { return inquirer.prompt([{name:"str"   ,type:"input"  ,message:question}]);}
function promptBinary (question)         { return inquirer.prompt([{name:"yesNo" ,type:"confirm",message:question}]);}

main(); async function main() {
    prompt();
    let exit = false;
    let res;
    let match;
    while (!exit)
    {
        let sel = await promptList("What next?",['exit','view','add','update','remove']);
        switch (sel.str)
        {
            case 'exit': 
                dbQuery.closeMySQL(); 
                exit = true;
                break;
            case 'view':
                sel = await promptList("View?",['*','departments','departments & roles','employees','managers']);
                switch (sel.str)
                {
                    case '*':
                        queryObj.idCols = [];
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        if (res.length) {
                            console.table(res);
                        }
                        break;
                    case 'departments':
                        res = await dbQuery.dbQuery('selectDept',queryObj);
                        if (res.length) {
                            console.table(res);
                        }
                        break;    
                    case 'departments & roles':
                        res = await dbQuery.dbQuery('selectDept');
                        let deptList = res.map((elt) => {return(elt.dept_name)});
                        deptList.unshift("*");
                        sel = await promptList("Departments",deptList);
                        queryObj.idVals = [];
                        if (sel.str != "*") {
                            deptList.shift();
                            match = deptList.findIndex((elt) => {return(elt == sel.str);});
                            queryObj.idVals.push(deptList[match]);
                        }
                        res = await dbQuery.dbQuery('selectRoles',queryObj);
                        if (res.length) {
                            console.table(res);
                        }
                        break;
                    case 'employees':
                        queryObj.idCols = [];
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        let empList = res.map((elt) => {return (`${elt.emp_lastname}, ${elt.emp_firstname}`)});
                        sel = await promptList("Selection?",empList);
                        var namesArr = sel.str.split(',');
                        queryObj.idCols[0] = 'emp_lastname' ; queryObj.idVals[0] = namesArr[0].trim();
                        queryObj.idCols[1] = 'emp_firstname'; queryObj.idVals[1] = namesArr[1].trim();
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        if (res.length) {
                            console.table(res);
                        }
                        break;    
                    case 'managers':
                        queryObj.idCols[0] = 'emp_manager'; queryObj.idVals[0] = 1;
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        let mgrList = res.map((elt) => {return elt.emp_lastname});
                        sel = await promptList("Manager Name?",mgrList);
                        match = mgrList.findIndex((elt) => {return(elt == sel.str);});
                        queryObj.idCols[0] = 'emp_mgr_id'; queryObj.idVals[0] = res[match].emp_id;
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        if (res.length) {
                            console.table(res);
                        }
                        break;
                }
                break;
            case 'add':
                let dB = await promptList("Which would you like to add?",['department','role','employee', 'abort add']);
                switch (dB.str)
                {
                    case 'department':
                        queryObj.table = 'departments';
                        sel = await promptString("Department Name?");
                        queryObj.setCols[0]  = 'dept_name'; queryObj.setVals[0]  = sel.str;
                        await dbQuery.dbQuery('insert',queryObj);
                        break;
                    case 'role':
                        queryObj.table = 'roles';
                        queryObj.setCols[0] = 'role_title'; 
                        sel = await promptString("Job title?");
                        queryObj.setVals[0] = sel.str;
                        queryObj.setCols[1] = 'role_salary'; 
                        sel = await promptString("Annual salary?");
                        queryObj.setVals[1] = sel.str;
                        queryObj.setCols[2] = 'role_manager'; 
                        sel = await promptBinary("Manager?");
                        queryObj.setVals[2] = sel.yesNo? 1:0;
                        let res = await dbQuery.dbQuery('selectDept');
                        let deptList = res.map((elt) => {return elt.dept_name});
                        sel = await promptList("Department?",deptList);
                        match = deptList.findIndex((elt) => {return(elt == sel.str);})
                        queryObj.setCols[3]  = 'dept_id'; 
                        queryObj.setVals[3]  = res[match].dept_id;
                        await dbQuery.dbQuery('insert',queryObj);
                        break;
                    case 'employee':
                        queryObj.table = 'employees';
                        queryObj.setCols[0]  = 'emp_lastname' ; 
                        sel = await promptString("Last Name?");
                        queryObj.setVals[0]  = sel.str;
                        queryObj.setCols[1]  = 'emp_firstname'; 
                        sel = await promptString("First Name?");
                        queryObj.setVals[1]  = sel.str;
                        queryObj.idVals = [];
                        let result = await dbQuery.dbQuery('selectRoles',queryObj);
                        console.log(result);
                        let roleList = result.map((elt) => {return elt.role_title});
                        sel = await promptList("Job Title?",roleList);
                        match = roleList.findIndex((elt) => {return(elt == sel.str);})
                        queryObj.setCols[2]  = 'role_id'      ; queryObj.setVals[2] = result[match].role_id;
                        queryObj.setCols[3]  = 'emp_manager'  ; queryObj.setVals[3] = result[match].role_manager;
                        queryObj.idCols[0]   = 'emp_manager'  ; queryObj.idVals[0] = 1;
                        result = await dbQuery.dbQuery('selectEmployees',queryObj);
                        let mgrList = result.map((elt) => {return elt.emp_lastname});
                        sel = await promptList("Manager Name?",mgrList);
                        match = mgrList.findIndex((elt) => {return(elt == sel.str);});
                        queryObj.setCols[4]  = 'emp_mgr_id'   ; queryObj.setVals[4]  = result[match].emp_id;
                        await dbQuery.dbQuery('insert',queryObj);
                        break;
                    default:
                        break;    
                }
            default: break;    
        }
    }

    dbQuery.closeMySQL();
}
