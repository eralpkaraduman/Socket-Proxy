var parseConfig = require('./config').parse;
var parseApp = exports;
var http = require('http');

parseApp.authorizeConnection = function(subscription_token,callback){
    console.log(parseConfig.app);
    callback(null,true);
};

parseApp.subscribeUser = function(user_id,subscription_token,socket_session_id,callback){

    var data = {
        user_id:user_id,
        subscription_token:subscription_token,
        socket_session_id:socket_session_id
    };

    var dataString = JSON.stringify(data);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
    };

    var options = {
        host:parseConfig.appName+".parseapp.com",
        path:"/"+parseApp.subscribeSessionEndpoint,
        port: 80,
        method:'POST',
        headers:headers
    };

    var req = http.request(options,function(res){
        res.setEncoding('utf-8');
        var responseString = '';
        res.on('data', function(data) {
            responseString += data;
        });
        res.on('end', function() {

            console.log('post response raw: '+responseString);

            var resultObject = null;

            try{
                resultObject = JSON.parse(responseString);
            }catch(e){}

            if(resultObject){

                if(resultObject.subscribed == true){

                    callback(true);

                }else{

                    callback(false);
                }

            }else{
                callback(false);
            }

        });
    });

    req.on('error', function(e) {
        callback(false);
    });

    req.write(dataString);
    req.end();


};

