var mongoose = require('../module/module');
var moment = require('moment')
var async = require("async");
var request = require('request');
var util = require('util')

var Revision = mongoose.model('Revision');
var Editor = mongoose.model('Editor')
var Article = mongoose.model('Article')

//得到所有的文章的名字
module.exports.queryAllArticle = function (req, res, next) { 
    var list = new Array
    Article.find()
        .sort({ 'name': 1 })
        .exec(function (err, data) {
            for (var i = 0; i < data.length; i++) {
                list[i] = data[i].name
            }
            res.send(list)
        });
}

//select
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
            res.send(list)
        });
}

//查询是否有新的文章可以拉取，如果有存入数据，同时修改revision和editor两个collection
module.exports.queryIfnewArticle = function (req, res, next) {
    name = req.params.name
 
    Revision.findOne({ 'title': name, 'timestamp': { $gt: '2017-01-01T06:20:16Z' } }, { 'timestamp': 1, '_id': 0 })
        .sort({ timestamp: -1 })
        .exec(function (err, data) {
            var timequery = util.format("&rvstart=%s&rvend=%sZ", data.timestamp, moment().format('YYYY-MM-DDTHH:mm:ss'))
            var url = util.format("%s%s&titles=%s", 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=timestamp|user&format=json&rvdir=newer&rvlimit=max', timequery, name)

            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    var jsonRes = JSON.parse(body)
                    for (i in jsonRes.query.pages) {

                        if (jsonRes.query.pages[i].revisions.length > 1) {
                            var items = jsonRes.query.pages[i].revisions
                            items.shift()
                            async.eachSeries(items, function (value, callback) {

                                Editor.findOne()
                                    .where({ 'name': value.user })
                                    .exec(function (err, data) {
                                        var categ
                                        if (data != null) {
                                            categ = data.category
                                        } else {
                                            if (value.hasOwnProperty("anon")) {
                                                categ = 'anon'
                                            } else {
                                                categ = 'regular'
                                                var editor = new Editor({
                                                    name: value.user,
                                                    category: categ
                                                })
                                                editor.save(function (err) {
                                                    if (err != null) console.log("save editor err" + err)
                                                });
                                            }
                                        }

                                        var revision = new Revision({
                                            user: value.user,
                                            timestamp: value.timestamp,
                                            year: 2018,
                                            title: name,
                                            editCla: categ,
                                        })
                                        revision.save(function (err) {
                                            if (err != null) {
                                                callback(err)
                                                res.send('fitch new revision failed!')
                                            } else {
                                                callback()
                                            }
                                        })
                                    });

                            }, function (err) {
                                if (err) console.log(err.message);
                                console.log("fetch revision:"+ name+", num:"+ items.length)
                                //返回拉取的个数
                                res.send({ num: items.length })
                            });

                        } else {
                            res.send({ num: 1 })
                        }
                    }
                }
            })
        });
}

//查询titile和
module.exports.titleAndrevision = function (req, res, next) {
    name = req.params.name

    Revision.find({ 'title': name })
        .count()
        .exec(function (err, data) {
            if (err != null) console.log(err)
            res.send({ "num": data })
        })

}

//查询修改量前五的用户
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
        { $sort: { _id: 1 } }
    ],
        function (err, data) {
            if (err) console.log(err)

            console.log(data)
            res.send(data)
        }
    )
}