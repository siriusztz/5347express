var mongoose = require('mongoose');

/** 创建Schema、创建Model **/
var Revision = new mongoose.Schema({
    title: String,
    timestamp: String,
    user: String,
    //年份
    year:String,
    //分类
    editCla:String,
});
mongoose.model('Revision', Revision)

//编辑的用户
var Editor = new mongoose.Schema({
    name:String,
    category:String,
});
mongoose.model('Editor', Editor)

//用户
var User = new mongoose.Schema({
    firstname:String,
    lastname:String,
    username: String,
    password: String,
    email: String,
});
mongoose.model('User', User)

//文章
var Article =new mongoose.Schema({
    name:String,
});
mongoose.model('Article', Article)

module.exports = mongoose;