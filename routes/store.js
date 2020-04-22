const express = require('express');
const pool = require('../core/pool');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
router.use(express.static(path.join(__dirname, 'client')));

router.get('/purchase/:category/:id', function (req, res) {
    let user = req.session.user;

    if (user) {
        let userSQL = "SELECT * FROM User WHERE ID = ?";
        pool.query(userSQL, user.ID,(err, sessionUser) => {
            let category = req.params.category;
            let item_id = req.params.id;
            let user_id = sessionUser[0].ID;
            let user_coins = sessionUser[0].Coins;

            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;

            pool.query(dbName, (err, result) => {
                if(err) throw err;
            });

            let alreadyBought = "SELECT * FROM Purchases WHERE UserID = ? AND ItemID = ? AND ItemType = ?";
            pool.query(alreadyBought, [user_id, item_id, category], (err, bought) => {
                console.info(bought);
                category_table = category.charAt(0).toUpperCase() + category.slice(1);
                let sqlIcons = "SELECT * FROM " + category_table + " WHERE ItemID = ?";

                pool.query(sqlIcons, item_id, (err, icon) => {
                    if(err) throw err;
                    let icon_price = icon[0].Price;
                    if(bought.length > 0) {
                        res.render('error', { errorMsg: "You've already bought this item!" });
                    }
                    else if(user_coins < icon_price) {
                        res.render('error', { errorMsg: "You don't have enough coins broke boy!" });
                    }
                    else {
                        let transaction = {
                            UserID: user_id,
                            ItemID: item_id,
                            ItemType: category,
                            PurchaseDate: dateTime
                        };

                        sql = "INSERT INTO Purchases SET ?";

                        pool.query(sql, transaction, (err, none) => {
                            if(err) throw err;
                        });

                        console.log(user_coins);
                        user_coins -= icon_price;
                        console.log(user_coins, user_id);
                        sql = "UPDATE User SET Coins = ? WHERE ID = ?";
                        pool.query(sql, [user_coins, user_id], (err, none) => {
                            if(err) throw err;
                        });

                        res.send("Purchase Complete!");
                    }
                });
            });
        });
    }
    else {
        res.redirect('/');
    }
});

module.exports = router;