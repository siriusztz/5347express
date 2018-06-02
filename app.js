var createError = require('http-errors');
var express = require('express');
var path = require('path');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var cors = require('cors');
// var cookieParser = require('cookie-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');  //修改模板文件的后缀名为html
app.engine('.html', ejs.__express);

//log setup
app.use(logger('dev'));

//设置session
app.use(session({
    name: 'sessionTest',    //session的名字叫sessionTest,id叫loginUser,value为我存的对象
    secret: 'usyd',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 1200*1000  // 有效期，单位是毫秒
    }
}));

//connect database
mongoose.connect('mongodb://localhost:27017/test', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("连接成功");
    }
});

//因为在前端过滤了，所以后端暂时不用
// app.use(function (req, res, next) {
//     if (!req.session.loginUser) {
//         if (req.url === '/user/signin' || req.url === '/user/signup') {
//             next();/*请求为登陆或者注册则不需要校验session*/
//         }
//         else {
//             res.status(401).json({ result: false, content: 'user login erro' });
//         }
//     } else {
//         next();
//     };
// })


//两种跨域方法
// app.use(cors({
//     origin: ['http://localhost:8080'],
//     methods: ['GET', 'POST'],
// }));
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,OPTIONS")
    res.header("Access-Control-Allow-Headers", "Content-Type,Access-Token");
    if (req.method == "OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else next();
});

//解析body,且必须写在router前面
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routers 
app.use('/', indexRouter);
app.use('/user', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// 错误层中间件
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;