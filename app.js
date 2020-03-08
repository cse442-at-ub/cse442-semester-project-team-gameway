<!--Constants-->
const express = require('express');
const mysql = require('mysql');
const app = express();
const dbName = "USE cse442_542_2020_spring_teamc_db; ";

<!--Database Connection-->
var db = mysql.createConnection({
    host: "tethys.cse.buffalo.edu",
    user: "plrobert",
    password: "50227586"
});

<!--Connecting To Database-->
db.connect((err) =>{
    if(err) throw err;
    console.log('Connected to MYSQL Database')
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
        console.log(results);
        res.send('Users Fetched...');
    });
});

<!--Insert New User-->
app.get('/_input_user', (req, res) => {
    let initial = dbName;

    let newUser = {
        Username: '',
        Password: '',
        Email: '',
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
        console.log("User Created");
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
        console.log(results);
    });
});

<!--Insert New Game Room-->
app.get('/_create_room', (req, res) => {
    let roomName = document.getElementById("room-name").value;
    let isPrivate = document.getElementById("private").value;
    let password = document.getElementById("password").value;
    let gameMode = document.getElementById("game-mode").value;
    let playerCapacity = document.getElementById("player-capacity").value;
    let currentGame = 'none';

    let initial = dbName;

    let newRoom = {
        HostID: 0,
        RoomName: roomName,
        IsPrivate: isPrivate,
        Password: password,
        GameMode: gameMode,
        PlayerCount: 1,
        PlayerCapacity: playerCapacity,
        CurrentGame: currentGame,
        isStarted: 0,
        isOver: 0,
    };

    let sql = "INSERT INTO GameRoom SET ?";

    db.query(initial, (err, result) => {
        if(err) throw err;
    });

    let query = db.query(sql, newRoom, (err, result) => {
        if(err) throw err;
        console.log("Game Room Created");
        res.send("Game Room Added")
    })
});

<!--End Of Database Functions-->

<!--Start Page Routing-->
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
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
