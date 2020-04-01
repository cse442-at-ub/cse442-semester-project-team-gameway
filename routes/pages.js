const express = require('express');
const pool = require('../core/pool');
const path = require('path');
const User = require('../core/user');
const router = express.Router();

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
        console.log(user);
        res.render('home', {opp:req.session.opp, user:user});
        return;
    }
    res.redirect('/');
});

// Rank Route
router.get('/rank', function (req, res) {
    let user = req.session.user;

    if(user) {
        res.render('rank', {opp:req.session.opp, user:user});
        return;
    }
    res.redirect('/');
});

// Store Route
router.get('/store', function (req, res) {
    let user = req.session.user;

    if(user) {
        res.render('store', {opp:req.session.opp, user:user});
        return;
    }
    res.redirect('/');
});

// Create Room Route
router.get('/create-room', (req, res) => {
    let user = req.session.user;

    if(user) {
        res.render('create-room', {opp:req.session.opp, user:user});
        return;
    }
    res.redirect('/');
});

module.exports = router;