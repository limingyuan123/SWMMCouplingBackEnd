const express = require('express');
const app = express();
const router = require('./router');
const config = require('./config/config')
const mongodb = require('./lib/mongodb')
let server = require('http').createServer(app);
let io = require('socket.io')(server);

app.get('/test',router.test);

app.post('/testUser', router.testUser);

//CORS跨域设置
app.all('*', function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "http://localhost:1708");
    res.header('Access-Control-Allow-Origin', '*') // 使用session时不能使用*，只能对具体的ip开放。
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
    else next();
});

let serve = app.listen(config.port,()=>{
    console.log(`app start success and it's post is ${config.port}`);
    console.log(`the serve address is ${serve.address().address} and the port is ${serve.address().port}`);
});