var mongoose = require('../module/module');
var moment = require('moment')
var async = require("async");

var Revision = mongoose.model('Revision');
var Editor = mongoose.model('Editor')
var Article = mongoose.model('Article')

module.exports.selectArticle = function (req, res, next) {
    var name = ''
    if (req.query.name != undefined) {
        name = req.query.name
    }

    var list = new Array
    Article.find()
        .regex('name', '.*' + name + '.*')
        .sort({ 'name': 1 })
        .exec(function (err, data) {
            for (var i = 0; i < data.length; i++) {
                list[i] = data[i].name
            }
            console.log(list)
            res.send(list)
        });
}

module.exports.titleAndrevision = function (req, res, next) {
    name = req.params.name

    Revision.find({ 'title': name })
        .count()
        .exec(function (err, data) {
            if (err != null) console.log(err)
            res.send({ "num": data })
        })

}

module.exports.revisenumbyEditor = function (req, res, next) {
    var name = req.params.name
    Revision.aggregate(
        [
            { $match: { title: name } },
            { $group: { _id: '$user', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ],
        function (err, data) {
            if (err) {
                console.log(err)
                res.send("err" + err)
            } else {
                res.send(data)
            }
        }
    )
}


module.exports.numBytimeByuser = function (req, res, next) {

    var name = req.params.name
    var a = moment()
    var typeList = ["admin", "anon", "bot", "regular"]

    async.waterfall([
        //找到最小年
        function (callback) {
            callback(null, '2001')
        },
        function (arg1, callback) {
            var firstyear = arg1
            var thisyear = moment().year()
            //年份list
            var yearlist = [];

            for (var i = 0; i <= thisyear - firstyear; i++) {
                yearlist[i] = firstyear + i
            }

            Revision.aggregate(
                [
                    { $match: { title: name } },
                    { $group: { _id: { year: "$year", editCla: "$editCla" }, totalRes: { $sum: 1 } } },
                    { $group: { _id: "$_id.year", users: { $push: { type: "$_id.editCla", total: "$totalRes" } } } },
                    { $sort: { _id: 1 } }
                ],
                function (err, data) {
                    if (err) console.log(err)

                    for (var i = 0; i < data.length; i++) {

                        var users = {}
                        for (var j = 0; j < data[i].users.length; j++) {

                            users[data[i].users[j].type] = data[i].users[j].total
                        }
                        //将数组转换为json之后可以减少算法复杂度
                        for (var x = 0; x < 4; x++) {
                            if (!users.hasOwnProperty(typeList[x])) {
                                users[typeList[x]] = 0
                            }
                        }

                        delete data[i].users
                        data[i]['users'] = users
                    }

                    callback(null, data)
                }
            )

        }
    ], function (err, result) {
        if (err) console.log(err.message);

        console.log(result)

        var b = moment()
        console.log(b.diff(a))

        res.send(result)
        //res.send(200)
    });


}

module.exports.topFiveBytimeByuser = function (req, res, next) {
    var list = req.query
    var users = new Array
    for (var k in list) {
        //遍历对象，k即为key，obj[k]为当前k对应的
        users.push(list[k])
        //console.log(list[k]);
    }

    Revision.aggregate([
        { $match: { user: { "$in": users } } },
        { $group: { _id: '$year', 'total': { $sum: 1 } } },
        {$sort :{ _id: 1 }}
    ],
        function (err, data) {
            if (err) console.log(err)

            console.log(data)
            res.send(data)
        }
    )
}