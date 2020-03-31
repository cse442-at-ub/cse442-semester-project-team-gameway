const pool = require('./pool');
const bcrypt = require('bcrypt');

function User() {}

User.prototype = {
    find : function (user = null, callback) {

        // if user = number return feild = id, else user = string then field = username
        if(user) {
            var field = Number.isInteger(user) ? 'ID' : 'Username';
        }

        let sql = `SELECT * FROM User WHERE ${field} = ?`;

        pool.query(sql, user, function(err, result) {
            if(err) throw err;
            if(result.length) {
                callback(result[0]);
            }
            else {
                callback(null);
            }
        });
    },

    create : function (body, callback) {
        let pw = body.Password;
        bcrypt.hash(pw, 10, function(err, hash) {
            body.Password = hash;

            var data = [];
            for(const prop in body) {
                if (body.hasOwnProperty(prop)) {
                    data.push(body[prop]);
                }
            }

            let sql = `INSERT INTO User(Username, Password, Email) VALUES (?, ?, ?)`;

            pool.query(sql, data, function (err, result) {
                if(err) throw err;
                callback(result.insertId);
            });
        });
    },

    login : function (username, password, callback) {
        this.find(username, function (user) {
            if(user) {
                bcrypt.compare(password, user.Password, function(err, result) {
                    if(result) {
                        callback(user);
                        return;
                    }
                    callback(null);
                });
            }
        });
    }
};

module.exports = User;