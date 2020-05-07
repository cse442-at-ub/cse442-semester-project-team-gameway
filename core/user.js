const pool = require('./pool');
const bcrypt = require('bcrypt');

function User() { }

User.prototype = {
    find: function (user = null, callback) {

        // if user = number return feild = id, else user = string then field = username
        if (user) {
            var field = Number.isInteger(user) ? 'ID' : 'Username';
        }

        let sql = `SELECT * FROM User WHERE ${field} = ?`;

        pool.query(sql, user, function (err, result) {
            if (err) throw err;
            if (result.length) {
                callback(result[0]);
            }
            else {
                callback(null);
            }
        });
    },

    create: function (body, callback) {
        let pw = body.Password;
        bcrypt.hash(pw, 10, function (err, hash) {
            body.Password = hash;

            var data = [];
            for (const prop in body) {
                if (body.hasOwnProperty(prop)) {
                    data.push(body[prop]);
                }
            }

            let sql = `INSERT INTO User(Username, Password, Email) VALUES (?, ?, ?)`;

            pool.query(sql, data, function (err, result) {
                if (err) throw err;

                // Update Database Online Status and Last Login
                var onlineStatus = 1;
                var today = new Date();
                var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date + ' ' + time;
                var rank = 'N/A';
                var avatar = Math.floor(Math.random() * 5);
                var level = 1;
                var sql = 'UPDATE User SET OnlineStatus = ?, LastLogin = ?, Rank = ?, HighestRank = ?, AvatarID = ?, Level = ? WHERE Username = ?';
                pool.query(sql, [onlineStatus, dateTime, rank, rank, avatar, level, data[0]], function (err, result) {
                    if (err) throw err;
                });

                callback(result.insertId);
            });
        });
    },

    login: function (username, password, callback) {
        this.find(username, function (user) {
            if (user) {
                bcrypt.compare(password, user.Password, function (err, result) {
                    if (result) {

                        // Update Database Online Status and Last Login
                        var onlineStatus = 1;
                        var today = new Date();
                        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        var dateTime = date + ' ' + time;
                        var sql = 'UPDATE User SET OnlineStatus = ?, LastLogin = ? WHERE Username = ?';
                        pool.query(sql, [onlineStatus, dateTime, user.Username], function (err, result) {
                            if (err) throw err;
                        });

                        callback(user);
                        return;
                    }
                    else {
                        callback(null);
                    }
                });
            }
        });
    }
};

module.exports = User;