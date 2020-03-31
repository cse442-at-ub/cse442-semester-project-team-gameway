const express = require('express');
const pool = require('../core/pool');
const router = express.Router();
const dbName = "USE cse442_542_2020_spring_teamc_db; ";

<!--Get All Users-->
router.get('/_get_users', (req, res) => {
    let initial = dbName;
    let sql = "SELECT * FROM `User`";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    pool.query(sql, (err, results) => {
        if(err) throw err;
        res.send('Users Fetched...');
    });
});

<!--Insert New User-->
router.get('/_input_user', (req, res) => {
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

    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    let query = pool.query(sql, newUser, (err, result) => {
        if(err) throw err;
        res.send("User Added")
    })
});

<!--Reset Database-->
router.get('/reset_db', (req, res) => {
    let initial = dbName;

    let sql = "DELETE FROM BlockedUsers";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    let query = pool.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM ChatMessage";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = pool.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM Friendship";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = pool.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM GameRoom";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = pool.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM User";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = pool.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM UserToRoom";
    pool.query(initial, (err, result) => {
        if(err) throw err;
    });

    query = pool.query(sql, (err, result) => {
        if(err) throw err;
        console.log("Table Deleted");
    });

    res.send("Database Cleared")
});

module.exports = router;