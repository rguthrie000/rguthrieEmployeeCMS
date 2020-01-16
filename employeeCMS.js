// Employee CMS, UCF-ORL-FSF HW 12
// rguthrie, 20200114

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

// temp variables, here to simplify scope considerations
let res;
let sel;
let match;
let deptList;
let roleList;
let mgrList;
let empList;

//*****************
//*   Functions   *
//*****************

// headerScreen() is the endpoint of the response handling for all database queries.
function headerScreen() {
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
    headerScreen();

    let exit = false;
    while (!exit)
    {
        sel = await promptList("What next?",['exit','view','add','update','remove']);
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
                        if (res.length) {console.table(res);}
                        break;
                    case 'departments':
                        res = await dbQuery.dbQuery('selectDept',queryObj);
                        if (res.length) {console.table(res);}
                        break;    
                    case 'departments & roles':
                        queryObj.idVals = [];
                        res = await dbQuery.dbQuery('selectDept');
                        deptList = res.map((elt) => {return(elt.dept_name)});
                        deptList.unshift("*");
                        sel = await promptList("Departments",deptList);
                        if (sel.str != "*") {
                            deptList.shift();
                            match = deptList.findIndex((elt) => {return(elt == sel.str);});
                            queryObj.idVals.push(deptList[match]);
                        }
                        res = await dbQuery.dbQuery('selectRoles',queryObj);
                        if (res.length) {console.table(res);}
                        break;
                    case 'employees':
                        queryObj.idCols = [];
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        empList = res.map((elt) => {return (`${elt.emp_lastname}, ${elt.emp_firstname}`)});
                        sel = await promptList("Selection?",empList);
                        let namesArr = sel.str.split(',');
                        queryObj.idCols[0] = 'emp_lastname' ; queryObj.idVals[0] = namesArr[0].trim();
                        queryObj.idCols[1] = 'emp_firstname'; queryObj.idVals[1] = namesArr[1].trim();
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        if (res.length) {console.table(res);}
                        break;    
                    case 'managers':
                        queryObj.idCols[0] = 'emp_manager'; queryObj.idVals[0] = 1;
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        mgrList = res.map((elt) => {return elt.emp_lastname});
                        sel = await promptList("Manager Name?",mgrList);
                        match = mgrList.findIndex((elt) => {return(elt == sel.str);});
                        queryObj.idCols[0] = 'emp_mgr_id'; queryObj.idVals[0] = res[match].emp_id;
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        if (res.length) {console.table(res);}
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
                        res = await dbQuery.dbQuery('selectDept');
                        deptList = res.map((elt) => {return elt.dept_name});
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
                        result = await dbQuery.dbQuery('selectRoles',queryObj);
                        roleList = result.map((elt) => {return elt.role_title});
                        sel = await promptList("Job Title?",roleList);
                        match = roleList.findIndex((elt) => {return(elt == sel.str);})
                        queryObj.setCols[2]  = 'role_id'      ; queryObj.setVals[2] = result[match].role_id;
                        queryObj.setCols[3]  = 'emp_manager'  ; queryObj.setVals[3] = result[match].role_manager;
                        queryObj.idCols[0]   = 'emp_manager'  ; queryObj.idVals[0] = 1;
                        result = await dbQuery.dbQuery('selectEmployees',queryObj);
                        mgrList = result.map((elt) => {return elt.emp_lastname});
                        sel = await promptList("Manager Name?",mgrList);
                        match = mgrList.findIndex((elt) => {return(elt == sel.str);});
                        queryObj.setCols[4]  = 'emp_mgr_id'   ; queryObj.setVals[4]  = result[match].emp_id;
                        await dbQuery.dbQuery('insert',queryObj);
                        break;
                    default:
                        break;    
                }
                break;
            case 'update': 
                sel = await promptList(
`The database will cascade updates based on dependency relationships, so please proceed with caution.
 What would you like to update?`,['department','role','employee', 'abort add']);
                switch (sel.str)
                {
                    case 'department':
                        queryObj.table = 'departments';
                        let ans = await dbQuery.dbQuery('selectDept',queryObj);
                        let deptArr = ans.map((elt) => {return(elt.dept_name)});
                        sel = await promptList("Department Name?",deptArr);
                        queryObj.idCols[0] = "dept_name"; queryObj.idVals[0] = sel.str;
                        sel = await promptString("New department name? <name> | nc");
                        if (sel.str.toLowerCase() != 'nc') {
                            queryObj.setCols[0]  = 'dept_name'; 
                            queryObj.setVals[0]  = sel.str;
                            await dbQuery.dbQuery('update',queryObj);
                            console.log(`Updated ${queryObj.idVals[0]} to ${sel.str}`);
                        } else {
                            console.log(`No change to ${queryObj.idVals[0]}`);
                        }
                        break;
                    case 'role':
                        queryObj.table = 'roles';
                        queryObj.idVals = [];
                        res = await dbQuery.dbQuery('selectDept');
                        deptList = res.map((elt) => {return(elt.dept_name)});
                        deptIDList = res.map((elt) => {return(elt.dept_id)});
                        sel = await promptList("Departments",deptList);
                        match = deptList.findIndex((elt) => {return(elt == sel.str);});
                        let inDept = sel.str;
                        let inDeptID = res[match].dept_id;
                        queryObj.idVals[0] = deptList[match];
                        res = await dbQuery.dbQuery('selectRoles',queryObj);
                        if (res.length) {console.table(res);}
                        roleList = res.map((elt) => {return(elt.role_title)});
                        sel = await promptList("Role to change?",roleList);
                        match = roleList.findIndex((elt) => {return(elt == sel.str)});

                        let i = 0;
                        queryObj.setCols[0] = 'role_title'; 
                        queryObj.setVals[0] = res[match].role_title;
                        sel = await promptString(`New title (${res[match].role_title})? <title> | nc`);
                        if (sel.str.toLowerCase() != 'nc') {
                            i++;
                            queryObj.setVals[0] = sel.str;
                        }

                        queryObj.setCols[1] = 'role_salary'; 
                        queryObj.setVals[1] = res[match].role_salary;
                        sel = await promptString(`Annual salary (${res[match].role_salary})? <salary>| nc`);
                        if (sel.str.toLowerCase() != 'nc') {
                            i++;
                            queryObj.setVals[1] = sel.str;
                        }

                        queryObj.setCols[2] = 'role_manager'; 
                        queryObj.setVals[2] = res[match].role_manager;
                        sel = await promptBinary(`Toggle Manager status (${res[match].role_manager})? `);
                        if (sel.yesNo) {
                            i++;
                            queryObj.setVals[2] ^= 1;
                        }

                        queryObj.setCols[3] = 'dept_id';
                        queryObj.setVals[3] = inDeptID;
                        sel = await promptList(`Department (${deptList[match]})`,deptList);
                        if (sel != deptList[match]) {
                            i++;
                            match = deptList.findIndex((elt) => {return(elt == sel.str);});
                            queryObj.setVals[3] = deptIDList[match];
                        }

                        if (i) {
                            await dbQuery.dbQuery('update',queryObj);
                            console.log(`Updated with ${i} change${i==1? '':'s'}`)
                        } else {
                            console.log(`No change`)
                        }
                        break;
                    case 'employee':
                        queryObj.table = 'employees';
                        queryObj.idCols = [];
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        empList = res.map((elt) => {return (`${elt.emp_lastname}, ${elt.emp_firstname}`)});
                        sel = await promptList("Selection?",empList);
                        let namesArr = sel.str.split(',');
                        queryObj.idCols[0] = 'emp_lastname' ; queryObj.idVals[0] = namesArr[0].trim();
                        queryObj.idCols[1] = 'emp_firstname'; queryObj.idVals[1] = namesArr[1].trim();
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        let emp_mgr_id = res[0].emp_mgr_id;
                        let emp_manager = res[0].emp_manager;
                        let emp_role_id = res[0].role_id;

                        let j = 0;
                        queryObj.setCols[0] = 'emp_lastname'; 
                        queryObj.setVals[0] = namesArr[0];
                        sel = await promptString(`New Last Name (${namesArr[0]})? <lastname> | nc`);
                        if (sel.str.toLowerCase() != 'nc') {
                            j++;
                            queryObj.setVals[0] = sel.str;
                        }

                        queryObj.setCols[1] = 'emp_firstname'; 
                        queryObj.setVals[1] = namesArr[1];
                        sel = await promptString(`New First Name (${namesArr[1]})? <firstname>| nc`);
                        if (sel.str.toLowerCase() != 'nc') {
                            j++;
                            queryObj.setVals[1] = sel.str;
                        }

                        queryObj.setCols[2] = 'emp_mgr_id';
                        queryObj.setVals[2] = Number(emp_mgr_id);
                        sel = await promptString(`Manager ID (${emp_mgr_id}) <manager id> | nc`);
                        if (sel.str.toLowerCase() != 'nc') {
                            j++;
                            queryObj.setVals[2] = Number(sel.str);
                        }

                        queryObj.setCols[3] = 'emp_manager'; 
                        queryObj.setVals[3] = emp_manager;
                        sel = await promptBinary(`Toggle Manager status (${emp_manager})? `);
                        if (sel.yesNo) {
                            j++;
                            queryObj.setVals[3] ^= 1;
                        }

                        queryObj.setCols[4] = 'role_id';
                        queryObj.setVals[4] = Number(emp_role_id);
                        sel = await promptString(`New role_id (${emp_role_id}) <role id> | nc`);
                        if (sel.str.toLowerCase() != nc) {
                            j++;
                            queryObj.setVals[4] = Number(sel.str);
                        }

                        if (j) {
                            await dbQuery.dbQuery('update',queryObj);
                            console.log(`Updated with ${j} change${j==1? '':'s'}`)
                        } else {
                            console.log(`No change`)
                        }
                        break;
                    default:
                        break;    
                }
                break;
            case 'remove':
                sel = await promptList(
`The database will cascade deletions based on dependency relationships, so please proceed with caution.
 What would you like to remove?`,['Abort Delete','department','role','employee']);
                switch (sel.str)
                {
                    case 'department':
                        queryObj.table = 'departments';
                        res = await dbQuery.dbQuery('selectDept',queryObj);
                        deptList = res.map((elt) => {return(elt.dept_name)});
                        deptList.unshift('Abort Delete');
                        sel = await promptList("Department Name?",deptList);
                        if (sel.str != 'Abort Delete') {
                            match = deptList.findIndex((elt) => {return(elt == sel.str)}) - 1;
                            queryObj.idCols[0] = 'dept_id';
                            queryObj.idVals[0] = res[match].dept_id;
                            await dbQuery.dbQuery('delete',queryObj);
                            console.log(`Deleted department ${sel.str}.`);
                        } else {
                            console.log('Delete aborted.');
                        }
                        break;
                    case 'role':
                        queryObj.table = 'departments';
                        res = await dbQuery.dbQuery('selectDept',queryObj);
                        deptList = res.map((elt) => {return(elt.dept_name)});
                        deptList.unshift('Abort Delete');
                        sel = await promptList("Department Name?",deptList);
                        if (sel.str != 'Abort Delete') {
                            match = deptList.findIndex((elt) => {return(elt == sel.str)}) - 1;
                            queryObj.idVals[0] = deptList[match];
                            res = await dbQuery.dbQuery('selectRoles',queryObj);
                            if (res.length) {console.table(res);}
                            roleList = res.map((elt) => {return(elt.role_title)});
                            roleList.unshift('Abort Delete');
                            sel = await promptList("Role to delete?",roleList);
                            if (sel.str != 'Abort Delete')  {
                                match = roleList.findIndex((elt) => {return(elt == sel.str)}) - 1;
                                queryObj.table = 'roles';
                                queryObj.idCols[0] = 'role_id';
                                queryObj.idVals[0] = res[match].role_id;
                                await dbQuery.dbQuery('delete',queryObj);
                                console.log(`Deleted role ${sel.str}.`);
                            } else {
                                console.log('Delete aborted.');
                            }
                        }
                        break;
                    case 'employee':
                        queryObj.table = 'employees';
                        queryObj.idCols = [];
                        res = await dbQuery.dbQuery('selectEmployees',queryObj);
                        empList = res.map((elt) => {return (`${elt.emp_lastname}, ${elt.emp_firstname}`)});
                        empList.unshift('Abort Delete');
                        sel = await promptList("Selection?",empList);
                        if (sel.str != 'Abort Delete') {
                            match = empList.findIndex((elt) => {return(elt == sel.str)}) - 1;
                            queryObj.idCols[0] = 'emp_id';
                            queryObj.idVals[0] = res[match].emp_id;
                            console.log(queryObj);
                            await dbQuery.dbQuery('delete',queryObj);
                            console.log(`Deleted employee ${sel.str}.`);
                        } else {
                                console.log('Delete aborted.');
                        }
                        break;
                    default:
                        console.log("Delete aborted. No harm, no foul.");
                        break;    
                }
                break;    
            default: break;    
        }
    }

    dbQuery.closeMySQL();
}
