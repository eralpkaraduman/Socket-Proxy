var parseConfig = require('./config').parse;
var parseApp = exports;

parseApp.authorizeConnection = function(subscription_token,callback){
    console.log(parseConfig.app);
    callback(null,true);
};

parseApp.subscribeUser = function(user_id,sibscription_token,socket_session_id,callback){
    callback(true);
};