const express = require('express');
const pool = require('../core/pool');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
router.use(express.static(path.join(__dirname, 'client')));

let friend_ID = "";
let friend_status = "";
let user_ID = "";

<!--Insert New Friendship-->
router.post('/friend_request', urlencodedParser, (req, res) => {

    let initial = dbName;
    let username = req.session.user;
    let newFriend = req.body["friend"];

    let sql = "SELECT * FROM User WHERE Username = ?";

    pool.query(dbName, (err, result) => {
            if(err) throw err;
        });

    let query = pool.query(sql, newFriend , (err, result) => {
        if(err) throw err;

        if(result.length === 0){
            res.render('error', {errorMsg:'User Not Found'});
            return;
        }
            friend_ID = result[0]["ID"];
            friend_status = result[0]["Status"];
            user_ID = username.ID;

            let addedFriend = {
                UserID1: user_ID,
                UserID2: friend_ID,
                UserID2_Status: friend_status,
            };

            sql = "INSERT INTO Friendship SET ?";

            pool.query(initial, (err, none) => {
                if(err) throw err;
            });

            let query = pool.query(sql, addedFriend, (err, none) => {
                if(err) throw err;
            });

            res.redirect('/friend-added');

    });

});

<!--Display Friend's List-->
router.get('/friend-added', (req, res) => {

    let initial = dbName;
    let username = req.session.user;


    let sql = "SELECT * FROM 'Friendship' WHERE 'UserID1' = " + username.ID + ';';

    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    pool.query(sql, (err, results) => {

        if(err) throw err;

        if(username) {
            res.render('/friend-added', {friendList: results, username:username});
            return;
        }
        res.redirect('/');
    });
});

module.exports = router;