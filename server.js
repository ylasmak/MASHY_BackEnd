var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookie = require('cookie-parser');
var app = express();

app.use(bodyParser.json());
 
app.use(express.static(__dirname + '/public'));
//app.use(cookie.cookieParser());
app.use(session({secret: '1234567890QWERTY'}));
//Routes
app.use(require('./routes'));

 
//app.use("/user",require('./routes'));  //http://127.0.0.1:8000/user  http://127.0.0.1:8000/user/about
 //app.set('view engine', 'ejs');
 
var server = app.listen(8081, function () {
 
    var host = server.address().address
    var port = server.address().port
 
    console.log("Server started.. (listening at http://%s:%s)", host, port)
 
})