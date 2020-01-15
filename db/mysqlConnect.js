const mysql = require("mysql");

module.exports = function openMySQL(database, host = 'localhost', port = 3306, username = 'root', password = 'root') {
    let connection = mysql.createConnection({
        host: host,
        port: port,
        user: username,
        password: password,
        database: database
    });
    connection.connect((err) => {
        if (err) throw err; 
        // console.log(`connected. threadId: ${connection.threadId}\n`);
    });
    return(connection);
}
