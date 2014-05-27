var config = require('./config');
//var static = require('node-static');
var express = require('express');
//var bodyParser = require('body-parser');
var http = require('http');
var parseApp = require('./parseApp');

var app = express();
app.use(express.json());
//app.use(bodyParser());
//app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
//app.use('/', express.static(__dirname + '/public'));
var server = http.createServer(app).listen(config.port);
//app.listen(config.port);
console.log('started on '+config.port);

// ROUTES

var io = require('socket.io').listen(server);


io.configure(function(){

    io.set('authorization',function(handshakeData,callback){

        //console.dir(handshakeData);
        //console.log('sid '+handshakeData.sessionID);
        var subscription_token = handshakeData.query.subscription_token;
        parseApp.authorizeConnection(subscription_token,callback);


    });
});


io.sockets.on('connection', function (socket) {

    socket.on('message',function(data){
        handleClientMessage(data,socket);
    });

});

function handleClientMessage(rawData,socket){
    //var sessionid = socket.socket.sessionid;
    //console.dir(socket);

    console.log('rawData '+rawData);
    console.log('sid '+socket.id);

    var data = JSON.parse(rawData);
    if(data){
        if(data.method == "subscribe"){
            createUserSubscription(data,socket);
        }

    }
}

function createUserSubscription(data,socket){
    parseApp.subscribeUser(
      data.user,
      data.subscription_token,
      socket.id,
      function(subscribed){

          data.subscribed = subscribed;
          var m = "SUBSCRIPTION:"+(subscribed?"SUCCESS":"FAILED");
          socket.emit("message",m);

      }
    );
}

// ROUTES

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.post('/send',function(req,res){

    console.log("sending...");

    //socket.emit('message', "this is a test");

    req.socket.emit('message','test');

    //console.dir(req);
    res.send('OK');
});





