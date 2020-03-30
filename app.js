// < !--Constants-->
const express = require('express');
const mysql = require('mysql');
const app = express();
var serv = require('http').Server(app);

const bodyParser = require('body-parser');
const { check, validationResult, matchedData } = require('express-validator');
const dbName = "USE cse442_542_2020_spring_teamc_db; ";
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
let roomPass = "";
let roomID = "";

// < !--START WEBSITE-- >
serv.listen('3000', () => {
    console.log('Server Started on Port 3000')
});
// < !--End Of Website-- >



// < !--Database Connection-- >
var db = mysql.createConnection({
    host: "tethys.cse.buffalo.edu",
    user: "plrobert",
    password: "50227586",
    multipleStatements: true
});



// < !--Connecting To Database-- >
db.connect((err) => {
    if (err) throw err;
});



// < !--Setting View Engine-- >
app.set('view engine', 'ejs');



// < !--Start Of Database Functions-- >
// < !--Get All Users-- >
app.get('/_get_users', (req, res) => {
    let initial = dbName;
    let sql = "SELECT * FROM `User`";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send('Users Fetched...');
    });
});



// < !--Insert New User-- >
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
        if (err) throw err;
    });

    let query = db.query(sql, newUser, (err, result) => {
        if (err) throw err;
        res.send("User Added")
    })
});



// < !--Get All Game Rooms-- >
app.get('/room-list', (req, res) => {
    let initial = dbName;
    let sql = "SELECT *  FROM `GameRoom` WHERE `isStarted` = 0 AND `isOver` = 0";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('room-list', { results: results });
    });
});



// < !--Create Room Page-- >
app.get('/create-room.ejs', (req, res) => {
    res.render('create-room');
});



// < !--Insert New Game Room-- >
app.post('/_create_room', urlencodedParser, (req, res) => {
    let isPrivate;
    let hostID = 0;

    if (req.body["private"] === 'on') {
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
        if (err) throw err;
    });

    let query = db.query(sql, newRoom, (err, result) => {
        if (err) throw err;
    });

    sql = "SELECT * FROM GameRoom WHERE HostID = ? ORDER  BY ID DESC LIMIT 1";

    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    query = db.query(sql, hostID, (err, result) => {
        if (err) throw err;
        let roomID = result[0]['ID'];

        // < !--Hard Coded User-- >
        let UserToRoomConnection = {
            UserID: 10,
            GameRoomID: roomID,
            Score: 0
        };

        sql = "INSERT INTO UserToRoom SET ?";

        db.query(initial, (err, none) => {
            if (err) throw err;
        });

        let query = db.query(sql, UserToRoomConnection, (err, none) => {
            if (err) throw err;
        });
        roomPass = req.body["password"];
        res.redirect('/game/' + result[0]['ID']);
    });
});



// < !--Game Room Page-- >
app.get('/game/:id', (req, res) => {
    let path = req['path'];
    roomID = path.split('/')[2];

    let sql = "SELECT * FROM UserToRoom WHERE GameRoomID = ?";

    db.query(dbName, (err, result) => {
        if (err) throw err;
    });

    let query = db.query(sql, roomID, (err, results) => {
        let players = "";
        for (let i = 0; i < results.length; i++) {
            players += ("SELECT * FROM User WHERE ID = " + results[i]['UserID'] + ';');
        }

        db.query(players, (err, players) => {
            let myPlayers = players;
            db.query('SELECT * FROM GameRoom WHERE ID = ?;', roomID, (err, result) => {
                if (err) throw err;
                let isFull = (result[0].PlayerCount === result[0].PlayerCapacity);
                let isPrivate = result[0].IsPrivate;
                let roomPassword = result[0].Password;
                console.log(isFull);
                console.log(isPrivate);
                if (!isPrivate && !isFull) {
                    res.render('game-room', { room: result, players: myPlayers });
                    console.log(roomPass);
                }
                else if (isPrivate && !isFull) {
                    console.log(roomPass);
                    console.log(roomPassword);
                    if (roomPass === roomPassword) {
                        console.log(roomPass + roomPassword);
                        res.render('game-room', { room: result, players: myPlayers });
                        roomPass = "";
                    }
                    else if (roomPass !== roomPassword) {
                        if (roomPass === "") {
                            res.close;
                        }
                        else {
                            res.render('error', { errorMsg: "You have entered the wrong password!" });
                            roomPass = "";
                        }
                    }
                }
                else if (isFull) {
                    res.render('error', { errorMsg: "The room is full!" });
                }
            });
        });
    });
});



// < !--Password Game Room-- >
app.post('/room-password', urlencodedParser, (req, res) => {
    let path = req['path'];
    roomPass = req.body["room-password"];
    res.redirect('/game/' + roomID);
});



// < !--Profile Page-- >
app.get('/profile/:username', (req, res) => {
    let path = req['path'];
    userID = path.split('/')[2];

    let sql = "SELECT Username FROM User";

    db.query(dbName, (err, result) => {
        if (err) throw err;
    });

    let query = db.query(sql, (err, results) => {

        console.log(`Result: ${results[0].Username}\nuserID: ${userID}`);
        console.info(results);

        let list = [];
        for (let i = 0; i < results.length; ++i) {
            list.push(results[i].Username);
        }

        if (search(userID, list) !== false) {
            db.query(`SELECT * FROM User WHERE Username = '${userID}';`, (err, result) => {
                console.info(result);
                res.render('profile', { results02: result });

            });
        }

        else {
            res.render('error', { errorMsg: "User does not exist." });
        }
    });
});



// < !-- Rank Page-- >
app.get('/rank', (req, res) => {
    let initial = dbName;
    let sql = "SELECT *  FROM User ORDER BY RankPoints, Username";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    db.query(sql, (err, results01) => {
        if (err) throw err;
        res.render('rank', { results01: results01 });
    });
});




// < !-- Search Functions-- >
// SEARCH FUNCTION && INFORMATION RETRIEVAL

/*  Search function 
    user (type string)      - select 
    database (type string)  - 
*/
function search(user, database) {
    let userinfo;

    console.log(database);

    if (database.includes(user)) {
        userinfo = database.indexOf(user);
        return userinfo;
    }
    return false;
}




// < !--End Of Database Functions-- >





// < !--Start Page Routing-- >

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

app.post('/home', function (req, res) {
    res.redirect('/home');
})

app.get('/profile', function (req, res) {
    res.sendFile(__dirname + '/client/profile.html');
});
app.get('/rank', function (req, res) {
    res.sendFile(__dirname + '/client/rank.html');
});
//
app.get('/game-room', function (req, res) {
    res.sendFile(__dirname + '/client/game-room.html');
});
//
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
app.get('/js/room-pass.js', function (req, res) {
    res.sendFile(__dirname + '/client/js/room-pass.js');
});
app.get('/js/script.js', function (req, res) {
    res.sendFile(__dirname + '/client/js/script.js');
});

app.use('/img', express.static(__dirname + '/client/img'));

// < !--End Page Routing-- >



//Game
var gameEnd = false;
var SOCKET_LIST = {};

var Entity = function () {
    var self = {
        x: 250,
        y: 250,
        spdX: 0,
        spdY: 0,
        id: "",
    }
    self.update = function () {
        self.updatePosition();
    }
    self.updatePosition = function () {
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.getDistance = function (pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
    }
    return self;
}

var Player = function (id) {
    var self = Entity();
    self.id = id;
    self.number = "" + Math.floor(10 * Math.random());
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.mouseAngle = 0;
    self.maxSpd = 10;
    self.hp = 10;
    self.hpMax = 10;
    self.score = 0;

    var super_update = self.update;
    self.update = function () {
        self.updateSpd();
        super_update();

        if (self.pressingAttack) {
            self.shootBullet(self.mouseAngle);
        }
    }
    self.shootBullet = function (angle) {
        var b = Bullet(self.id, angle);
        b.x = self.x;
        b.y = self.y;
    }


    self.updateSpd = function () {
        if (self.pressingRight)
            self.spdX = self.maxSpd;
        else if (self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;

        if (self.pressingUp)
            self.spdY = -self.maxSpd;
        else if (self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;
    }

    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            number: self.number,
            hp: self.hp,
            hpMax: self.hpMax,
            score: self.score,
        };
    }
    self.getUpdatePack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            hp: self.hp,
            score: self.score,
        }
    }
    Player.list[id] = self;

    initPack.player.push(self.getInitPack());
    return self;
}
Player.list = {};
Player.onConnect = function (socket) {
    var player = Player(socket.id);
    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.pressingLeft = data.state;
        else if (data.inputId === 'right')
            player.pressingRight = data.state;
        else if (data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;
        else if (data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if (data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });

    socket.emit('init', {
        selfId: socket.id,
        player: Player.getAllInitPack(),
        bullet: Bullet.getAllInitPack(),
    })
}
Player.getAllInitPack = function () {
    var players = [];
    for (var i in Player.list)
        players.push(Player.list[i].getInitPack());
    return players;
}
Player.onDisconnect = function (socket) {
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}
Player.update = function () {
    var pack = [];
    for (var i in Player.list) {
        var player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
}


var Bullet = function (parent, angle) {
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle / 180 * Math.PI) * 10;
    self.spdY = Math.sin(angle / 180 * Math.PI) * 10;
    self.parent = parent;
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function () {
        if (self.timer++ > 100)
            self.toRemove = true;
        super_update();

        for (var i in Player.list) {
            var p = Player.list[i];
            if (self.getDistance(p) < 32 && self.parent !== p.id) {
                p.hp -= 1;

                if (p.hp <= 0) {

                    var shooter = Player.list[self.parent];
                    if (shooter) {
                        shooter.score += 1;
                    }

                    if (shooter.score == 3) {
                        gameOver(shooter.id);
                        stopGame();
                        endGame();
                    }

                    self.toRemove == true;
                    p.hp = p.hpMax;
                    p.x = Math.random() * 500;
                    p.y = Math.random() * 500;


                }

                self.toRemove = true;
            }
        }
    }
    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
        };
    }

    self.getUpdatePack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
        };
    }

    Bullet.list[self.id] = self;
    initPack.bullet.push(self.getInitPack());
    return self;
}
Bullet.list = {};
Bullet.update = function () {
    var pack = [];
    for (var i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove) {
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id);
        } else
            pack.push(bullet.getUpdatePack());
    }
    return pack;
}
Bullet.getAllInitPack = function () {
    var bullets = [];
    for (var i in Bullet.list)
        bullets.push(Bullet.list[i].getInitPack());
    return bullets;
}


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    Player.onConnect(socket);

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('pauseTheGame', function () {
        startGame();
        console.log("Game has started.");
        console.log(gameEnd);
    });

});


var initPack = { player: [], bullet: [] };
var removePack = { player: [], bullet: [] };
setInterval(function () {
    if (gameEnd == true) {
        for (var i in Player.list) {
            Player.list[i].score = 0;
        }
        endGame();
    }

    var pack = {
        player: Player.update(),
        bullet: Bullet.update(),
    }

    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('init', initPack);
        socket.emit('update', pack);
        socket.emit('remove', removePack);
    }
    initPack.player = [];
    initPack.bullet = [];
    removePack.player = [];
    removePack.bullet = [];
}, 1000 / 25);


function gameOver(id) {
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('gameOver', id);
    }
}
function startGame() {
    gameEnd = false;
}
function stopGame() {
    gameEnd = true;
}
function endGame() {
    if (gameEnd == true) {
        setTimeout(function () { }, 1000 / 33);
    }
    console.log("Game has ended");
    console.log(gameEnd);
}


// < !--Reset Database-- >
app.get('/reset_db', (req, res) => {
    let initial = dbName;

    let sql = "DELETE FROM BlockedUsers";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM ChatMessage";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM Friendship";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM GameRoom";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM User";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Table Deleted");
    });

    sql = "DELETE FROM UserToRoom";
    db.query(initial, (err, result) => {
        if (err) throw err;
    });

    query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Table Deleted");
    });

    res.send("Database Cleared")
});