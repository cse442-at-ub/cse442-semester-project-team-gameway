<!--Constants-->
const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
const { check, validationResult, matchedData } = require('express-validator');
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

<!--Database Connection-->
var db = mysql.createConnection({
    host: "tethys.cse.buffalo.edu",
    user: "plrobert",
    password: "50227586",
    multipleStatements: true
});

<!--Connecting To Database-->
db.connect((err) =>{
    if(err) throw err;
});

<!--Setting View Engine-->
app.set('view engine', 'ejs');

<!--Start Of Database Functions-->
<!--Get All Users-->
app.get('/_get_users', (req, res) => {
    let initial = dbName;
    let sql = "SELECT * FROM `User`";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    db.query(sql, (err, results) => {
        if(err) throw err;
        res.send('Users Fetched...');
    });
});

<!--Insert New User-->
app.get('/_input_user', (req, res) => {
    let initial = dbName;

    let newUser = {
        ID: 10,
        Username: 'Preston',
        Password: '123',
        Email: 'roberts.preston123@gmail.com',
        DateCreated: new Date(),
        AvatarID: 0,
        Coins: 0,
        Cash: 0,
        GamesPlayed: 0,
        GamesWon: 0,
        Level: 1,
        Xp: 0,
        Rank: 'None',
        RankPoints: 0,
        HighestRank: 'None'
    };

    let sql = "INSERT INTO User SET ?";

    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    let query = db.query(sql, newUser, (err, result) => {
        if(err) throw err;
        res.send("User Added")
    })
});

<!--Get All Game Rooms-->
app.get('/room-list', (req, res) => {
    let initial = dbName;
    let sql = "SELECT *  FROM `GameRoom` WHERE `isStarted` = 0 AND `isOver` = 0";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    db.query(sql, (err, results) => {
        if(err) throw err;
        res.render('room-list', {results: results});
    });
});

<!--Create Room Page-->
app.get('/create', (req, res) => {
    res.render('create-room');
});

<!--Insert New Game Room-->
app.post('/_create_room', urlencodedParser, (req, res) => {
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
        CurrentGame: 'none',
        isStarted: 0,
        isOver: 0,
    };

    let sql = "INSERT INTO GameRoom SET ?";

    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    let query = db.query(sql, newRoom, (err, result) => {
        if(err) throw err;
    });

    sql = "SELECT * FROM GameRoom WHERE HostID = ? ORDER  BY ID DESC LIMIT 1";

    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = db.query(sql, hostID, (err, result) => {
        if(err) throw err;
        var roomID = result[0]['ID'];

        <!--Hard Coded User-->
        let UserToRoomConnection = {
            UserID: 10,
            GameRoomID: roomID,
            Score: 0
        };

        sql = "INSERT INTO UserToRoom SET ?";

        db.query(initial, (err, none) => {
            if(err) throw err;
        });

        let query = db.query(sql, UserToRoomConnection, (err, none) => {
            if(err) throw err;
        });

        res.redirect('/game/' + result[0]['ID']);
    });
});

<!--Game Room Page-->
app.get('/game/:id', (req, res) => {
    let path = req['path'];
    let roomID = path.split('/')[2];

    let sql = "SELECT * FROM UserToRoom WHERE GameRoomID = ?";

    db.query(dbName, (err, result) => {
        if(err) throw err;
    });

    let query = db.query(sql, roomID, (err, results) => {
        let players = "";
        for(let i = 0; i < results.length; i++) {
            players += ("SELECT * FROM User WHERE ID = " + results[i]['UserID'] + ';');
        }

        db.query(players, (err, players) => {
            let myPlayers = players;
            db.query('SELECT * FROM GameRoom WHERE ID = ?;', roomID, (err, result) => {
                if (err) throw err;
                res.render('game-room', {room: result, players: myPlayers});
            });
        });
    });
});

<!--End Of Database Functions-->

<!--Start Page Routing-->
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.get('/favicon.ico', function (req, res) {
    res.sendFile(__dirname + '/favicon.ico');
});
app.get('/app.js', function (req, res) {
    res.sendFile(__dirname + '/app.js');
});
app.get('/home', function (req, res) {
    res.sendFile(__dirname + '/client/home.html');
});
app.get('/profile', function (req, res) {
    res.sendFile(__dirname + '/client/profile.html');
});
app.get('/rank', function (req, res) {
    res.sendFile(__dirname + '/client/rank.html');
});
app.get('/store', function (req, res) {
    res.sendFile(__dirname + '/client/store.html');
});
app.get('/css/mainstyle.css', function (req, res) {
    res.sendFile(__dirname + '/client/css/mainstyle.css');
});
app.get('/css/room-list.css', function (req, res) {
    res.sendFile(__dirname + '/client/css/room-list.css');
});
app.get('/css/sidebar.css', function (req, res) {
    res.sendFile(__dirname + '/client/css/sidebar.css');
});
app.get('/css/game-room.css', function (req, res) {
    res.sendFile(__dirname + '/client/css/game-room.css');
});
app.get('/js/notifications.js', function (req, res) {
    res.sendFile(__dirname + '/client/js/notifications.js');
});
app.get('/js/chatbox.js', function (req, res) {
    res.sendFile(__dirname + '/client/js/chatbox.js');
});
<!--End Page Routing-->

<!--START WEBSITE-->
app.listen('3000', () => {
    console.log('Server Started on Port 3000')
});
<!--End Of Website-->

<!--Reset Database-->
app.get('/reset_db', (req, res) => {
    let initial = dbName;

    let sql = "DELETE FROM BlockedUsers";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM ChatMessage";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM Friendship";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM GameRoom";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM User";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM UserToRoom";
    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    res.send("Database Cleared")
});
