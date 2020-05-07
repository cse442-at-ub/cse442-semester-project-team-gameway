const express = require('express');
const pool = require('../../core/pool');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
router.use(express.static(path.join(__dirname, 'client')));

// Show Chat
function showChat() {
    $("#chatBox").show();
}

// Close Chat
function hideChat() {
    $("#chatBox").hide();
}

// Get Chat Messages
router.post('/_get_messages/:username', function (req, res) {
    console.log("hello");
    let user = req.session.user;

    if (user) {
        let path = req['path'];
        let friendName = path.split('/')[2];

        let sql = "SELECT * FROM User WHERE Username = ?";

        pool.query(dbName, (err, result) => {
            if(err) throw err;
        });

        pool.query(sql, friendName, (err, friend) => {
            if(err) throw err;
            if(friend){
                let sql = "SELECT * FROM ChatMessage WHERE (SenderID = ? AND ReceiverID = ?) OR (ReceiverID = ? AND SenderID = ?)";

                pool.query(dbName, (err, result) => {
                    if(err) throw err;
                });

                pool.query(sql, [user.ID, friend.ID, friend.ID, user.ID], (err, messages) => {
                    res.json(messages);
                });
            }
            else{
                res.redirect('/');
            }
        });
    }
    else {
        res.redirect('/');
    }
});

module.exports = router;