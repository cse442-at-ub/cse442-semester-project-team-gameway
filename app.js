//Constants
const express = require('express');
const mysql = require('mysql');
const app = express();
const dbName = "USE cse442_542_2020_spring_teamc_db; ";



//Database

//Database Connection
var db = mysql.createConnection({
    host: "tethys.cse.buffalo.edu",
    user: "plrobert",
    password: "50227586"
});

//Connect to Database
db.connect((err) =>{
    if(err) throw err;
    console.log('Connected to MYSQL Database')
});


//Database Functions
//Get All Users
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

//Insert New User to Database, please actually give the parameters of the username values if you want to test it
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

//End Database

//Website

//Start Website
app.listen('3000', () => {
    console.log('Server Started on Port 3000')
});
//End Website
