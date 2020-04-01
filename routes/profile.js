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
                        let search = "SELECT * FROM `Match` WHERE ";
                        for(let x = 0; x < joint.length; x++){
                            search = search.concat("ID = ", joint[x].MatchID);
                            if(x+1 !== joint.length){
                                search = search.concat(" OR ");
                            }
                        }
                        console.log(search);
                        pool.query(search, (err, results) => {
                            let matches = [];
                            for(let x=0; x < results.length; x++){
                                let new_date = results[x].Date.toLocaleDateString();
                                console.log (new_date);
                                matches.push({
                                    ID: results[x].ID,
                                    Game: results[x].Game,
                                    Date: new_date
                                });
                            }
                            res.render('profile', {opp: req.session.opp, user: user, profile: profile[0], achievements: list, user_match: joint, matches: matches});
                        });
                    });
                });
            }
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;