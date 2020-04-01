const express = require('express');
const pool = require('../core/pool');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
let roomPass = "";
let roomID = "";

<!--Display Room List-->
router.get('/room-list', (req, res) => {
    let initial = dbName;
    let sql = "SELECT *  FROM `GameRoom` WHERE `isStarted` = 0 AND `isOver` = 0";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    pool.query(sql, (err, results) => {
        if(err) throw err;
        // res.render('room-list', {results: results, opp:req.session.opp, name:user});

        let user = req.session.user;

        if(user) {
            res.render('room-list', {results: results, opp:req.session.opp, user:user});
            return;
        }
        res.redirect('/');
    });
});

<!--Insert New Game Room-->
router.post('/_create_room', urlencodedParser, (req, res) => {
    let isPrivate;
    let hostID = 0;

    if(req.body["private"] === 'on') {
        isPrivate = 1;
    }
    else {
        isPrivate = 0;
    }

    let initial = dbName;
    let newRoom = {
        HostID: hostID,
        RoomName: req.body["room-name"],
        IsPrivate: isPrivate,
        Password: req.body["password"],
        GameMode: req.body["game-mode"],
        PlayerCount: 1,
        PlayerCapacity: req.body["player-capacity"],
        CurrentGame: 'Dodge',
        isStarted: 0,
        isOver: 0,
    };

    let sql = "INSERT INTO GameRoom SET ?";

    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    let query = pool.query(sql, newRoom, (err, result) => {
        if(err) throw err;
    });

    sql = "SELECT * FROM GameRoom WHERE HostID = ? ORDER  BY ID DESC LIMIT 1";

    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = pool.query(sql, hostID, (err, result) => {
        if(err) throw err;
        let roomID = result[0]['ID'];

        <!--Hard Coded User-->
        let UserToRoomConnection = {
            UserID: 10,
            GameRoomID: roomID,
            Score: 0
        };

        sql = "INSERT INTO UserToRoom SET ?";

        pool.query(initial, (err, none) => {
            if(err) throw err;
        });

        let query = pool.query(sql, UserToRoomConnection, (err, none) => {
            if(err) throw err;
        });
        roomPass = req.body["password"];
        res.redirect('/game/' + result[0]['ID']);
    });
});

<!--Game Room Page-->
router.get('/game/:id', (req, res) => {
    let path = req['path'];
    roomID = path.split('/')[2];

    let sql = "SELECT * FROM UserToRoom WHERE GameRoomID = ?";

    pool.query(dbName, (err, result) => {
        if(err) throw err;
    });

    let query = pool.query(sql, roomID, (err, results) => {
        let players = "";
        for(let i = 0; i < results.length; i++) {
            players += ("SELECT * FROM User WHERE ID = " + results[i]['UserID'] + ';');
        }

        pool.query(players, (err, players) => {
            let myPlayers = players;
            pool.query('SELECT * FROM GameRoom WHERE ID = ?;', roomID, (err, result) => {
                if (err) throw err;
                let isFull = (result[0].PlayerCount === result[0].PlayerCapacity);
                let isPrivate = result[0].IsPrivate;
                let roomPassword = result[0].Password;
                console.log(isFull);
                console.log(isPrivate);
                if(!isPrivate && !isFull) {
                    res.render('game-room', {room: result, players: myPlayers});
                    console.log(roomPass);
                }
                else if(isPrivate && !isFull) {
                    console.log(roomPass);
                    console.log(roomPassword);
                    if(roomPass === roomPassword) {
                        console.log(roomPass + roomPassword);
                        res.render('game-room', {room: result, players: myPlayers});
                        roomPass = "";
                    }
                    else if (roomPass !== roomPassword) {
                        if(roomPass === "") {
                            res.close;
                        }
                        else {
                            res.render('error', {errorMsg: "You have entered the wrong password!"});
                            roomPass = "";
                        }
                    }
                }
                else if(isFull) {
                    res.render('error', {errorMsg: "The room is full!"});
                }
            });
        });
    });
});

<!--Room Password Input From User-->
router.post('/room-password', urlencodedParser, (req, res) => {
    let path = req['path'];
    roomPass = req.body["room-password"];
    res.redirect('/game/' + roomID);
});

module.exports = router;