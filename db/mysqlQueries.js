// mySQL internal API, tailored for the Employee Database

const mysql = require("mysql");
const util = require('util');

// using a pool of connections
const pool = mysql.createPool( {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employee_db'
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }
    if (connection) connection.release();
})  

function closeMySQL() {pool.end();}

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

// for reference, this is what a queryObj looks like.  see ClassLib.js
// queryObj = {
//      table: '',
//      idCols:  [],    // array of column name strings
//      idVals:  [],    // array of values to match, corresponds to idCols.
//      setCols: [],    // array of column name strings
//      setVals: []     // array of values to set, corresponds to setCols.
// 
async function dbQuery(cmd,queryObj) {
    let summary = '';
    let queryStr = '';
    let whereStr = '';
    try {
        switch (cmd)
        {
            // CREATE
            case 'insert':
                // make sure the record isn't already in the table.
                queryStr = `select * from ${queryObj.table} where `;
                for (let i = 0; i < queryObj.setCols.length; i++) {
                    queryStr += `${queryObj.setCols[i]}="${queryObj.setVals[i]}" `;
                    queryStr += (i < queryObj.setCols.length-1)? 'and ' : '';
                }
                res = await pool.query(queryStr);
                if (res.length == 0) {
                    // no match in the table, so perform the add via an 'insert' mySQL command
                    queryStr = `insert into ${queryObj.table} (${queryObj.setCols.join(',')}) values ("${queryObj.setVals.join('\",\"')}")`;
                    console.log(queryStr);
                    res = await pool.query(queryStr);
                }
                break;
            // READ    
            case 'selectDept':
                // no variables are needed to get a list of departments
                res = await pool.query(`select * from departments `);
                return(res);
                break;
            case 'sumDept':
                // get the list of departments
                res = await pool.query(`select * from departments `);
                let sumArr =[];
                // then for each department, use the triple-join table to sum salaries of all department employees
                for (let i = 0; i < res.length; i++) {
                    queryStr = 
                    `select * from (
                        select
                            dept_id, dept_name, sum(role_salary) totalSalary
                        from
                            departments inner join roles using (dept_id) inner join employees using (role_id)
                        where dept_name = "${res[i].dept_name}") all_data;`;
                    let sumObj = await pool.query(queryStr);
                    // tailor an object from the response
                    let rowObj = {dept_id: sumObj[0].dept_id, dept_name: sumObj[0].dept_name, totalSalary: sumObj[0].totalSalary};
                    // and push it to make an array of objects
                    sumArr.push(rowObj);
                }
                // sumArr now has the form of a multi-line query response
                return(sumArr);
                break;    
            case 'selectRoles':
                // roles are associated with departments, so we use selection from a join of departments and roles.
                queryStr = 
                    `select * from (
                        select
                            dept_name, role_id, role_title, role_salary, role_manager
                        from departments inner join roles using (dept_id) `;
                // then if specified, narrow to roles in one department                        
                if (queryObj.idVals.length) {
                    queryStr += `where dept_name = "${queryObj.idVals[0]}"`;
                }
                // throw some order onto this chaos!
                queryStr += ` order by dept_name) all_data;`;
                // and make the query
                res = await pool.query(queryStr);
                return(res);
                break;
            case 'selectEmployees':
                // use the famous triple join of departments - roles - employees
                queryStr = 
                    `select * from (
                        select
                            dept_name, emp_lastname, emp_firstname, role_title, role_salary, emp_id, emp_manager, role_id, emp_mgr_id
                        from
                            departments inner join roles using (dept_id) inner join employees using (role_id) `;

                // with row filtering if requested            
                if (queryObj.idCols.length) {
                    queryStr += `where `;
                    for (let i = 0; i < queryObj.idCols.length; i++) {
                        queryStr += `${queryObj.idCols[i]}="${queryObj.idVals[i]}" `;
                        queryStr += (i < queryObj.idCols.length-1)? 'and ' : '';
                    }
                }
                // and ordering
                queryStr += ` order by dept_name, role_salary desc, emp_lastname) all_data;`;
                // now go get 'em!
                res = await pool.query(queryStr);
                return(res);
                break;
            // UPDATE
            case 'update':
                // like for add, update is interested in whether the record is already in the table
                queryStr = `select * from ${queryObj.table} `;
                whereStr = `where `;
                for (let i = 0; i < queryObj.idCols.length; i++) {
                    whereStr += `${queryObj.idCols[i]}="${queryObj.idVals[i]}" `;
                    whereStr += (i < queryObj.idCols.length-1)? 'and ' : '';
                }
                res = await pool.query(queryStr+whereStr);
                if (res.length) {
                    // but in this case, we want to get one or more matches
                    queryStr = `update ${queryObj.table} set `;
                    // update uses idCols and idVals to filter for rows,
                    // and setCols and setVals for update information.
                    for (let i = 0; i < queryObj.setCols.length; i++) {
                        queryStr += `${queryObj.setCols[i]}="${queryObj.setVals[i]}"`;
                        queryStr += (i < queryObj.setCols.length-1)? ', ':' ';
                    }
                    // zap the matching rows
                    res = await pool.query(queryStr+whereStr);
                }
                else {
                    summary = 'update failed, record not found.'
                }
                break;
            // DELETE    
            case 'delete':
                // delete everything in the table which matches the filter criteria.
                queryStr = `delete from ${queryObj.table} where `;
                for (let i = 0; i < queryObj.idCols.length; i++) {
                    queryStr += `${queryObj.idCols[i]}="${queryObj.idVals[i]}" `;
                    queryStr += (i < queryObj.idCols.length-1)? 'and ' : '';
                }
                console.log(queryStr);
                res = await pool.query(queryStr);
                break;
        }
    }
    catch(err) {
        throw err;
    }    
  return(summary)  
}

// make the function visible
exports.dbQuery    = dbQuery;
exports.closeMySQL = closeMySQL;