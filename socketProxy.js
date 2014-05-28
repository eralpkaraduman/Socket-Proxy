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

    //console.log('rawData '+rawData);
    //console.log('sid '+socket.id);

    var data = null;
    try{
        data = JSON.parse(rawData);
    }catch(e){};

    if(data!=null){
        if(data.method == "register_session"){
            registerSession(data,socket);
        }
    }


}

function registerSession(data,socket){
    parseApp.subscribeUser(
      data.user,
      data.subscription_token,
      socket.id,
      function(subscribed){

          //data.subscribed = subscribed;

          data.subscribed = subscribed;

          // no need to stringify data, socket handler parses it in unity

          //socket.emit("message",JSON.stringify(data));
          socket.emit("message",data);


      }
    );
}

// ROUTES

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.post('/send/:sessionId',function(req,res){


    var data = req.body;

    console.dir(data);

    var m = {
        method:"check_in_received",
        message:"dgsfdhj"
    };

    var socket = null;
    var sessionId = req.params.sessionId;

    try{
        socket = io.sockets.socket(sessionId);
    }catch(e){};

    if(socket){
        console.log("sending message...");
        socket.emit('message',m);

        res.send({sent:true});

    }else{
        res.send({sent:false,error:"invalid socket session id"});
    }


});





