// //Constants
// const express = require('express');
// const mysql = require('mysql');
// const app = express();
// const dbName = "USE cse442_542_2020_spring_teamc_db; ";
//
//
//
// //Database
//
// //Database Connection
// var db = mysql.createConnection({
//     host: "tethys.cse.buffalo.edu",
//     user: "plrobert",
//     password: "50227586"
// });
//
// //Connect to Database
// db.connect((err) =>{
//     if(err) throw err;
//     console.log('Connected to MYSQL Database')
// });
//
//
// //Database Functions
// //Get All Users
// app.get('/_get_users', (req, res) => {
//     let initial = dbName;
//     let sql = "SELECT * FROM `User`";
//     db.query(initial, (err, result) => {
//         if(err) throw err;
//     });
//
//     db.query(sql, (err, results) => {
//         if(err) throw err;
//         console.log(results);
//         res.send('Users Fetched...');
//     });
// });
//
// //Insert New User to Database, please actually give the parameters of the username values if you want to test it
// app.get('/_input_user', (req, res) => {
//     let initial = dbName;
//
//     let newUser = {
//         Username: '',
//         Password: '',
//         Email: '',
//         DateCreated: new Date(),
//         AvatarID: 0,
//         Coins: 0,
//         Cash: 0,
//         GamesPlayed: 0,
//         GamesWon: 0,
//         Level: 1,
//         Xp: 0,
//         Rank: 'None',
//         RankPoints: 0,
//         HighestRank: 'None'
//     };
//
//     let sql = "INSERT INTO User SET ?";
//
//     db.query(initial, (err, result) => {
//         if(err) throw err;
//     });
//
//     let query = db.query(sql, newUser, (err, result) => {
//         if(err) throw err;
//         console.log("User Created");
//         res.send("User Added")
//     })
// });
//
// //End Database
//
// //Website
//
// //Start Website
// app.listen('3000', () => {
//     console.log('Server Started on Port 3000')
// });
// //End Website

//Game
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/game-room.html');
});
app.use(express.static(__dirname + '/client'));

app.use('/img', express.static(__dirname + '/Images'));

serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};

var Entity = function(){
    var self = {
        x:250,
        y:250,
        spdX:0,
        spdY:0,
        id:"",
    }
    self.update = function(){
        self.updatePosition();
    }
    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
    }
    return self;
}

var Player = function(id){
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
    self.update = function(){
        self.updateSpd();
        super_update();

        if(self.pressingAttack){
            self.shootBullet(self.mouseAngle);
        }
    }
    self.shootBullet = function(angle){
        var b = Bullet(self.id,angle);
        b.x = self.x;
        b.y = self.y;
    }


    self.updateSpd = function(){
        if(self.pressingRight)
            self.spdX = self.maxSpd;
        else if(self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;

        if(self.pressingUp)
            self.spdY = -self.maxSpd;
        else if(self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;
    }

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            number:self.number,
            hp:self.hp,
            hpMax:self.hpMax,
            score:self.score,
        };
    }

    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
        }
    }

    Player.list[id] = self;

    initPack.player.push(self.getInitPack());
    return self;
}
Player.list = {};
Player.onConnect = function(socket){
    var player = Player(socket.id);
    socket.on('keyPress',function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        else if(data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });

    socket.emit('init',{
        selfId:socket.id,
        player:Player.getAllInitPack(),
        bullet:Bullet.getAllInitPack(),
    })
}

Player.getAllInitPack = function(){
    var players = [];
    for(var i in Player.list)
        players.push(Player.list[i].getInitPack());
    return players;
}


Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}
Player.update = function(){
    var pack = [];
    for(var i in Player.list){
        var player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePack());
    }
    return pack;
}


var Bullet = function(parent,angle){
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;
    self.parent = parent;
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        if(self.timer++ > 100)
            self.toRemove = true;
        super_update();

        for(var i in Player.list){
            var p = Player.list[i];
            if(self.getDistance(p) < 32 && self.parent !== p.id){
                p.hp -= 1;

                if(p.hp <= 0){

                    var shooter = Player.list[self.parent];
                    if(shooter){
                        shooter.score += 1;
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
    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        };
    }

    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        };
    }

    Bullet.list[self.id] = self;
    initPack.bullet.push(self.getInitPack());
    return self;
}
Bullet.list = {};

Bullet.update = function(){
    var pack = [];
    for(var i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove){
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id);
        } else
            pack.push(bullet.getUpdatePack());
    }
    return pack;
}

Bullet.getAllInitPack = function(){
    var bullets = [];
    for(var i in Bullet.list)
        bullets.push(Bullet.list[i].getInitPack());
    return bullets;
}


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    Player.onConnect(socket);

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });

});

var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};

setInterval(function(){
    var pack = {
        player:Player.update(),
        bullet:Bullet.update(),
    }

    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('init',initPack);
        socket.emit('update',pack);
        socket.emit('remove',removePack);
    }
    initPack.player = [];
    initPack.bullet = [];
    removePack.player = [];
    removePack.bullet = [];
},1000/25);


