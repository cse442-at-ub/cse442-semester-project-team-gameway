const express = require('express');
const pool = require('../core/pool');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
router.use(express.static(path.join(__dirname, 'client')));

// Profile Route
router.get('/profile/:username', function (req, res) {
    let user = req.session.user;

    if (user) {
        let userSQL = "SELECT * FROM User WHERE ID = ?";
        pool.query(userSQL, user.ID,(err, sessionUser) => {
            let path = req['path'];
            let username = path.split('/')[2];

            let sql = "SELECT * FROM User WHERE Username = ?";

            pool.query(dbName, (err, result) => {
                if(err) throw err;
            });

            pool.query(sql, username, (err, profile) => {
                if(err) throw err;
                if(profile.length === 0){
                    res.render('error', {errorMsg:'Profile Not Found'});
                    return;
                }
                else {
                    pool.query("SELECT * FROM UserToAchievement WHERE UserID = ?", profile[0].ID, (err, achievements) => {
                        let list = [];
                        for(let x = 0; x < achievements.length; x++){
                            list.push(achievements[x].Achievement);
                        }
                        pool.query("SELECT * FROM UserToMatch WHERE UserID = ? ORDER BY MatchID DESC LIMIT 0 , 5", profile[0].ID, (err, joint) => {
                            if(joint.length !== 0) {
                                let search = "SELECT * FROM `Match` WHERE ";
                                for (let x = 0; x < joint.length; x++) {
                                    search = search.concat("ID = ", joint[x].MatchID);
                                    if (x + 1 !== joint.length) {
                                        search = search.concat(" OR ");
                                    }
                                }
                                pool.query(search, (err, results) => {
                                    let matches = [];
                                    for(let x=0; x < results.length; x++){
                                        let new_date = results[x].Date.toLocaleDateString();
                                        matches.push({
                                            ID: results[x].ID,
                                            Game: results[x].Game,
                                            Date: new_date
                                        });
                                    }

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
                                                res.render('profile', {
                                                    opp: req.session.opp,
                                                    user: sessionUser[0],
                                                    profile: profile[0],
                                                    achievements: list,
                                                    user_match: joint,
                                                    matches: matches,
                                                    friends: friends
                                                });
                                                return;
                                            });
                                        } else {
                                            res.render('profile', {
                                                opp: req.session.opp,
                                                user: sessionUser[0],
                                                profile: profile[0],
                                                achievements: list,
                                                user_match: joint,
                                                matches: matches,
                                                friends: []
                                            });
                                            return;
                                        }
                                    });

                                });
                            }
                            else {
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
                                            res.render('profile', {opp: req.session.opp, user: sessionUser[0], profile: profile[0], achievements: list, user_match: [], matches: [], friends: friends});
                                            return;
                                        });
                                    } else {
                                        res.render('profile', {opp: req.session.opp, user: sessionUser[0], profile: profile[0], achievements: list, user_match: [], matches: [], friends: []});
                                        return;
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    }
    else {
        res.redirect('/');
    }

});

module.exports = router;