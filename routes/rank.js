const express = require('express');
const pool = require('../core/pool');
const router = express.Router();
const dbName = "USE cse442_542_2020_spring_teamc_db; ";

 <!--Rank Page-->
router.get('/rank', (req, res) => {
    let initial = dbName;
    let sql = "SELECT * FROM `User`";
    pool.query(initial, (err, sadfsdv) => {
        if(err) throw err;
    });

    pool.query(sql, (err, results) => {
        if(err) throw err;

        let user = req.session.user;

        if(user) {
            res.render('rank', {results: results, opp:req.session.opp, user:user});
            return;
        }
        res.redirect('/');
    });
});

module.exports = router;