var mongoose = require('../module/module');
var fs = require('fs');
var path = require('path');
var User = mongoose.model('User');

//post user sign up注册
module.exports.userSignup = function (req, res, next) {
    var student = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: req.body.password,
        email: req.body.password
    });
    // 插入数据 
    student.save(function (err) {
        console.log('save status:', err ? 'failed' : 'success');
        if (err == null) {
            res.send('seccussful!')
        } else {
            res.sendStatus(400)
        }
    })
}

//post user sign in
module.exports.userSignin = function (req, res, next) {
    var username = req.body.username
    var password = req.body.password
    User.findOne({ 'username': username, 'password': password }, function (err, data) {
        //如果有这个人
        if (err) {
            console.log('query error' + err)
            res.sendStatus(404)
            throw err;
        }
        if (data) {
            console.log("登陆成功" + data.username)
            req.session.loginUser = { 'userName': data.name };
            res.json({ session: data.name });
        } else {
            console.log('no such user exist')
            res.status(404).send("no such user exist")
        }
    });
}

module.exports.userSignout = function (req, res, next) {
    delete req.session.loginUser
    res.send("user logout successfully")
}