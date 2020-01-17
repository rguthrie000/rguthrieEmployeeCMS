
// QueryObjects are used to abstract the mySQL interface by having a standard
// data structure for filter and update/add values. 
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

