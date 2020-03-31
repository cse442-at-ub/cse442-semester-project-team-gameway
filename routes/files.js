const express = require('express');
path = require('path');
const router = express.Router();

router.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, '../favicon.ico'));
});
router.get('/app.js', function (req, res) {
    res.sendFile(path.join(__dirname, '../app.js'));
});

module.exports = router;