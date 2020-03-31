const util = require('util');
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'tethys.cse.buffalo.edu',
    user: 'plrobert',
    password: '50227586',
    database: 'cse442_542_2020_spring_teamc_db'
});

pool.getConnection((err, connection) => {
    if(err){
        console.log(err);
        console.error("Error occurred within database...")
    }
    if(connection){
        connection.release();
    }
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;