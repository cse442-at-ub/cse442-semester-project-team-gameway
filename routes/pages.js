const express = require('express');
const pool = require('../core/pool');
const path = require('path');
const User = require('../core/user');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
router.use(express.static(path.join(__dirname, 'client')));

const user = new User();

// Login/Registration Portal
router.get('/', function (req, res) {
    let user = req.session.user;
    if(user) {
        res.redirect('/home');
        return;
    }
    res.render('index');
});

// Login Request
router.post('/login', function (req, res) {
    user.login(req.body.username, req.body.password, function (result) {
        if(result) {
            req.session.user = result;
            req.session.opp = 1;
            res.redirect('/home');
        }
        else {
            res.send('Username/Password Incorrect!');
        }
    });
});

// Register Request
router.post('/register', function (req, res) {
    let userInput = {
        Username: req.body.username,
        Password: req.body.password,
        Email: req.body.email
    };

    user.create(userInput, function(lastID){
        if(lastID) {
            user.find(lastID, function (result) {
                req.session.user = result;
                req.session.opp = 0;
                res.redirect('/home');
            });
        }
        else {
            console.log('Error creating a new user...');
        }
    });
});

// Logout Route
router.get('/logout', (req, res, next) => {
    let user = req.session.user;
    if(user) {
        req.session.destroy(function() {
            // Update Database Online Status
            var onlineStatus = 0;
            var sql = 'UPDATE User SET OnlineStatus = ? WHERE Username = ?';
            pool.query(sql,[onlineStatus, user.Username], function(err, result) {
                if(err) throw err;
            });
            res.redirect('/');
        });
    }
});

// Homepage Route
router.get('/home', function (req, res) {
    let user = req.session.user;

    if(user) {
        let sql = "SELECT * FROM Friendship WHERE UserID1 = ? OR UserID2 = ?";

        pool.query(dbName, (err, result) => {
            if(err) throw err;
        });

        pool.query(sql, [user['ID'], user['ID']], (err, relationships) => {
            let friendIDs = [];
            for(let x = 0; x < relationships.length; x++){
                if(relationships[x]['UserID1'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID1']) === false){
                    friendIDs.push(relationships[x]['UserID1'])
                }
                else if(relationships[x]['UserID2'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID2']) === false){
                    friendIDs.push(relationships[x]['UserID2'])
                }
            }

            if(friendIDs.length > 0) {
                let sql = "SELECT * FROM User WHERE ";
                for (let x = 0; x < friendIDs.length; x++) {
                    sql = sql.concat("ID = ", friendIDs[x]);
                    if (x + 1 !== friendIDs.length) {
                        sql = sql.concat(" OR ");
                    }
                }

                pool.query(sql, (err, friends) => {
                    res.render('home', {opp: req.session.opp, user: user, friends: friends});
                    return;
                });
            }
            else {
                res.render('home', {opp: req.session.opp, user: user, friends: []});
                return;
            }
        });

        return;
    }
    res.redirect('/');
});

// Rank Route
router.get('/rank', function (req, res) {
    let initial = dbName;
    let sql = "SELECT * FROM `User`";
    pool.query(initial, (err, sadfsdv) => {
        if(err) throw err;
    });

    pool.query(sql, (err, results) => {
        if (err) throw err;

        let user = req.session.user;

        if (user) {
            console.log(user);

            let sql = "SELECT * FROM Friendship WHERE UserID1 = ? OR UserID2 = ?";

            pool.query(dbName, (err, result) => {
                if (err) throw err;
            });

            pool.query(sql, [user['ID'], user['ID']], (err, relationships) => {
                let friendIDs = [];
                for (let x = 0; x < relationships.length; x++) {
                    if (relationships[x]['UserID1'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID1']) === false) {
                        friendIDs.push(relationships[x]['UserID1'])
                    } else if (relationships[x]['UserID2'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID2']) === false) {
                        friendIDs.push(relationships[x]['UserID2'])
                    }
                }

                if (friendIDs.length > 0) {
                    let sql = "SELECT * FROM User WHERE ";
                    for (let x = 0; x < friendIDs.length; x++) {
                        sql = sql.concat("ID = ", friendIDs[x]);
                        if (x + 1 !== friendIDs.length) {
                            sql = sql.concat(" OR ");
                        }
                    }

                    pool.query(sql, (err, friends) => {
                        console.log(friends);
                        res.render('rank', {results: results, opp: req.session.opp, user: user, friends: friends});
                        return;
                    });
                } else {
                    res.render('rank', {results: results, opp: req.session.opp, user: user, friends: []});
                    return;
                }
            });
            return;
        }
        res.redirect('/');
    });
});

// Store Route
router.get('/store', function (req, res) {
    let user = req.session.user;

    if(user) {
        console.log(user);

        let sql = "SELECT * FROM Friendship WHERE UserID1 = ? OR UserID2 = ?";

        pool.query(dbName, (err, result) => {
            if(err) throw err;
        });

        pool.query(sql, [user['ID'], user['ID']], (err, relationships) => {
            let friendIDs = [];
            for (let x = 0; x < relationships.length; x++) {
                if (relationships[x]['UserID1'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID1']) === false) {
                    friendIDs.push(relationships[x]['UserID1'])
                } else if (relationships[x]['UserID2'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID2']) === false) {
                    friendIDs.push(relationships[x]['UserID2'])
                }
            }

            if (friendIDs.length > 0) {
                let sql = "SELECT * FROM User WHERE ";
                for (let x = 0; x < friendIDs.length; x++) {
                    sql = sql.concat("ID = ", friendIDs[x]);
                    if (x + 1 !== friendIDs.length) {
                        sql = sql.concat(" OR ");
                    }
                }
                pool.query(sql, (err, friends) => {
                    console.log(friends);
                    res.render('store', {opp: req.session.opp, user: user, friends: friends});
                    return;
                });
            } else {
                res.render('store', {opp: req.session.opp, user: user, friends: []});
                return;
            }
        });
        return;
    }
    res.redirect('/');
});

// Create Room Route
router.get('/create-room', (req, res) => {
    let user = req.session.user;

    if(user) {
        console.log(user);

        let sql = "SELECT * FROM Friendship WHERE UserID1 = ? OR UserID2 = ?";

        pool.query(dbName, (err, result) => {
            if(err) throw err;
        });

        pool.query(sql, [user['ID'], user['ID']], (err, relationships) => {
            let friendIDs = [];
            for (let x = 0; x < relationships.length; x++) {
                if (relationships[x]['UserID1'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID1']) === false) {
                    friendIDs.push(relationships[x]['UserID1'])
                } else if (relationships[x]['UserID2'] !== user['ID'] && friendIDs.includes(relationships[x]['UserID2']) === false) {
                    friendIDs.push(relationships[x]['UserID2'])
                }
            }

            if (friendIDs.length > 0) {
                let sql = "SELECT * FROM User WHERE ";
                for (let x = 0; x < friendIDs.length; x++) {
                    sql = sql.concat("ID = ", friendIDs[x]);
                    if (x + 1 !== friendIDs.length) {
                        sql = sql.concat(" OR ");
                    }
                }
                pool.query(sql, (err, friends) => {
                    console.log(friends);
                    res.render('create-room', {opp: req.session.opp, user: user, friends: friends});
                    return;
                });
            } else {
                res.render('create-room', {opp: req.session.opp, user: user, friends: []});
                return;
            }
        });
        return;
    }
    res.redirect('/');
});

module.exports = router;