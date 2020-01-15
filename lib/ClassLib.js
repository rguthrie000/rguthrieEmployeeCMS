
// module.exports = function closeMySQL() {connection.end();}
// queryObj = {
//      table: '',
//      idCols:  [],    // array of column name strings
//      idVals:  [],    // array of values to match, corresponds to idCols.
//      setCols: [],    // array of column name strings
//      setVals: []     // array of values to set, corresponds to setCols.
// 
class QueryObject {
    constructor(table) {
        this.table  = table;
        this.idCols = [];
        this.idVals = [];
        this.setCols = [];
        this.setVals = [];
    }
}
// export Employee
module.exports = QueryObject;

