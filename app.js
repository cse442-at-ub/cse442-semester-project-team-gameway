// < !--Constants-->
const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const pageRouter = require('./routes/pages');
const fileRouter = require('./routes/files');
const gameRoomRouter = require('./routes/game-room');
const databaseRouter = require('./routes/database');
const profileRouter = require('./routes/profile');
const chatBoxRouter = require('./client/js/chatbox');
const rankRouter = require('./routes/rank');
const pool = require('./core/pool');
const app = express();
var serv = require('http').Server(app);
let io = require('socket.io')(serv);

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

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

// <!--Body Parser-->
app.use(urlencodedParser);

// <!--Setting View Engine-->
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// <!--Session-->
let sessionMiddleware = session({
    secret: 'login-session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 1000 * 30
    }
});
app.use(sessionMiddleware);

io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// <!--Start Routing-->
// Serve Static Files
app.use(express.static(path.join(__dirname, 'client')));
// Serve Pages
app.use(pageRouter);
// Serve Files
app.use(fileRouter);
// Serve Game Rooms
app.use(gameRoomRouter);
// Serve Database
app.use(databaseRouter);
// Serve Profile
app.use(profileRouter);
// Chat
app.use(chatBoxRouter);
// Serve Rank
// Error Handling
app.use((req, res, next) => {
    var err = new Error('Page not found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', { errorMsg: err.message });
});
// <!--End Routing-->

// Game

/* statistics */

/*  updateUserMatch adds current player's match history
    @user: the current Match associated with user (UserToMatch on the database)
*/
function updateUserMatch(userMatch) {
    userMatch.isWon = isWon;
    userMatch.GameLength = gameLength;
    userMatch.Coins = coins;
    userMatch.Xp = xp;
    userMatch.RankPoints = rankpoints;
}
/*  updateProfile update current player's profile
    @user: the current Match associated with user (UserToMatch on the database)
*/
function updateProfile(user) {
    user.Coins += coins;
    user.Xp += xp;
    user.RankPoints += rankpoints;
    user.GamesPlayed += 1;
    if (isWon) { user.GamesWon += 1; }
}

/* logistics */

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

var Player = function (id, user) {
    var self = Entity();
    self.id = id;
    self.username = user;
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
    var player = Player(socket.id, socket.request.session.user.Username);
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
                        gameOver(shooter.username);
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
};

Bullet.getAllInitPack = function () {
    var bullets = [];
    for (var i in Bullet.list)
        bullets.push(Bullet.list[i].getInitPack());
    return bullets;
};

const users = {};
io.sockets.on('connection', function (socket) {
    // console.info(`THE USERNAME: ${socket.request.session.user.Username} \n`);
    if (socket.request.session.user) {
        console.log(`SESSION.USER`);
        console.info(socket.request.session.user.Username);
        socket.emit('chat-message', 'Hello World');

        socket.on('new-user', name => {
            users[socket.id] = name;
            socket.broadcast.emit('user-connected', name);
        });

        socket.on('send-chat-message', message => {
            socket.broadcast.emit('chat-message', {message: message, username:users[socket.id]});
        });

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
    }

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


function gameOver(username) {
    for (let i in SOCKET_LIST) {

        let
            socket = SOCKET_LIST[i],
            sql = '',
            uData = socket.request.session.user,
            user = uData.Username,
            isWon = calcWon(user, username),
            coins = uData.Coins + calcCoins(20, isWon),
            gamesPlayed = uData.GamesPlayed + 1,
            gamesWon = uData.GamesWon + isWon,
            level = uData.Level + calcLvl(16),
            xp = uData.Xp + calcXp(16, isWon, uData.Xp),
            rankPoints = uData.RankPoints + 100,
            rank = calcRank(rankPoints),
            status = 'Online',
            userID = uData.ID;

        // UPDATE USER PROFILE
        sql = 'UPDATE User SET Coins = ?, GamesPlayed = ?, GamesWon = ?, Level = ?, Xp = ?, Rank = ?, RankPoints = ?, Status = ? WHERE Username = ?';
        pool.query(sql, [coins, gamesPlayed, gamesWon, level, xp, rank, rankPoints, status, user], function (err, result) { if (err) throw err; });

        // UPDATE USER GAME HISTORY MATCH
        sql = 'INSERT INTO UserToMatch SET UserID = ?, isWon = ?, Xp = ?, RankPoints = ?';
        pool.query(sql, [userID, isWon, coins, xp, rankPoints], function (err, result) { if (err) throw err; });

        socket.emit('gameOver', username);
    }

    //// CALCULATE STATISTICS (START) ////
    function calcWon(user, username) {
        if (username === user) { return 1; }
        else { return 0; }
    }
    function calcCoins(points, isWon) {
        if (isWon === 1) { points = points * 1.5; } // calculations for winner
        return points;
    }
    function calcLvl(points) {
        if (!calcXp(points) === points) { return 1; }
        else { return 0; }
    }
    function calcXp(points, isWon, userXP) {
        if (isWon === 1) { points = points * 1.5; } // calculations for winner
        if (100 <= userXP + points) { return userXP + points - 100; }
        else { return userXP + points; }
    }
    function calcRank(points) {
        if (50000 <= points) { return 'pro'; }
        else if (25000 <= points) { return 'elite'; }
        else if (10000 <= points) { return 'expert'; }
        else if (0o1000 <= points) { return 'novice'; }
        else { return 'none'; }
    }
    //// CALCULATE STATISTICS (END) ////
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
