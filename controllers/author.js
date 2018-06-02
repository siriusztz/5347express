var mongoose = require('../module/module');
var moment = require('moment')
var async = require("async");

var Revision = mongoose.model('Revision');
var Editor = mongoose.model('Editor')

//select用户
module.exports.selectAuthor = function (req, res, next) {
    var name = req.query.name
    console.log(name)
    var list = new Array
    //正则，忽略大小写
    Editor.find({ 'name': { $regex: name, $options: 'i' } })
        .exec(function (err, data) {
            for (var i = 0; i < data.length; i++) {
                list[i] = data[i].name
            }
            console.log(list.length)
            res.send(list)
        });
}

//某个作者的修改
module.exports.revisionByAuthor = function (req, res, next) {
    var name = req.params.name
    console.log(name)
    Revision.aggregate(
        [
            { $match: { "user": name } },
            { $group: { _id: "$title", timestamps: { $push: "$timestamp" }, titleNum: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ],
        function (err, data) {
            if (err) console.log(err)
            res.send(data)
        }
    )
}