
const mysql = require("mysql");
const util = require('util');

// module.exports = function openMySQL(database, host = 'localhost', port = 3306, username = 'root', password = 'root') {
const pool = mysql.createPool( {
    connectionLimit: 10,
    host: 'localhost',
    // port: 3306,
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

// module.exports = function closeMySQL() {connection.end();}
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
                queryStr = `select * from ${queryObj.table} where `;
                for (let i = 0; i < queryObj.setCols.length; i++) {
                    queryStr += `${queryObj.setCols[i]}="${queryObj.setVals[i]}" `;
                    queryStr += (i < queryObj.setCols.length-1)? 'and ' : '';
                }
                res = await pool.query(queryStr);
                if (res.length == 0) {
                    queryStr = `insert into ${queryObj.table} (${queryObj.setCols.join(',')}) values ("${queryObj.setVals.join('\",\"')}")`;
                    console.log(queryStr);
                    res = await pool.query(queryStr);
                }
                break;
            // READ    
            case 'selectDept':
                res = await pool.query(`select * from departments `);
                // if (res.length) {
                //    console.table(res);
                // }
                return(res);
                break;
            case 'selectRoles':
                queryStr = 
                    `select * from (
                        select
                            dept_name, role_id, role_title, role_salary, role_manager
                        from departments inner join roles using (dept_id) `;
                if (queryObj.idVals.length) {
                    queryStr += `where dept_name = "${queryObj.idVals[0]}"`;
                }
                queryStr += ` order by dept_name) all_data;`;
                res = await pool.query(queryStr);
                // if (res.length) {
                //     console.table(res);
                // }
                return(res);
                break;
            case 'selectEmployees':
                queryStr = 
                    `select * from (
                        select
                            dept_name, emp_lastname, emp_firstname, role_title, role_salary, emp_id, emp_manager, role_id, emp_mgr_id
                        from
                            departments inner join roles using (dept_id) inner join employees using (role_id) `;
                if (queryObj.idCols.length) {
                    queryStr += `where `;
                    for (let i = 0; i < queryObj.idCols.length; i++) {
                        queryStr += `${queryObj.idCols[i]}="${queryObj.idVals[i]}" `;
                        queryStr += (i < queryObj.idCols.length-1)? 'and ' : '';
                    }
                }
                queryStr += ` order by dept_name, role_salary desc, emp_lastname) all_data;`;
                res = await pool.query(queryStr);
                // if (res.length) {
                //     console.table(res);
                // }
                return(res);
                break;
            // UPDATE
            case 'update':
                queryStr = `select * from ${queryObj.table} `;
                whereStr = `where `;
                for (let i = 0; i < queryObj.idCols.length; i++) {
                    whereStr += `${queryObj.idCols[i]}="${queryObj.idVals[i]}" `;
                    whereStr += (i < queryObj.idCols.length-1)? 'and ' : '';
                }
                res = await pool.query(queryStr+whereStr);
                if (res.length) {
                    queryStr = `update ${queryObj.table} set `;
                    for (let i = 0; i < queryObj.setCols.length; i++) {
                        queryStr += `${queryObj.setCols[i]}="${queryObj.setVals[i]}"`;
                        queryStr += (i < queryObj.setCols.length-1)? ', ':' ';
                    }
                    res = await pool.query(queryStr+whereStr);
                }
                else {
                    summary = 'update failed, record not found.'
                }
                break;
            // DELETE    
            case 'delete':
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