var mongoose = require('../module/module');
var moment = require('moment')
var async = require("async");

var Revision = mongoose.model('Revision');
var Editor = mongoose.model('Editor')

//统计修改量的排序
module.exports.reviseNumRank = function (req, res, next) {
    Revision.aggregate(
        [
            { $group: { _id: "$title", totalRes: { $sum: 1 } } },
            { $sort: { totalRes: 1 } }
        ],
        function (err, data) {
            if (err) console.log(err)
            res.send(data)
        }
    )
}

//统计被多人修改的文章
module.exports.reviseUserRank = function (req, res, next) {
    Revision.aggregate(
        [
            { $match: { editCla: "regular" } },
            { $group: { _id: { title: "$title", user: "$user" } } },
            { $group: { _id: "$_id.title", totallUser: { $sum: 1 } } },
            { $sort: { totallUser: 1 } }
        ],
        function (err, data) {
            if (err) console.log(err)
            res.send(data)
        }
    )
}

//根据创建历史排序·
module.exports.historyRank = function (req, res, next) {
    Revision.aggregate(
        [
            { $group: { _id: "$title", timestamp: { $min: "$timestamp" } } },
            { $sort: { timestamp: -1 } }
        ],
        function (err, data) {
            if (err) console.log(err)
            res.send(data)
        }
    )
}

//两个chart需要的数据
module.exports.numBytimeByuser = function (req, res, next) {
    var a = moment()
    async.waterfall([
        function (callback) {
            callback(null, '2001')
        },
        //集合
        function (arg1, callback) {

            // console.log(arg1)
            var firstyear = arg1
            var thisyear = moment().year()
            //年份list
            var yearlist = [];

            for (var i = 0; i <= thisyear - firstyear; i++) {
                yearlist[i] = firstyear + i
            }

            Revision.aggregate(
                [
                    { $group: { _id: { year: "$year", editCla: "$editCla" }, totalRes: { $sum: 1 } } },
                    { $group: { _id: "$_id.year", users: { $push: { type: "$_id.editCla", total: "$totalRes" } } } },
                    { $sort: { _id: 1 } }
                ],
                function (err, data) {
                    if (err) console.log(err)
                    callback(null, data)
                }
            )

        }
    ], function (err, result) {
        if (err) console.log(err.message);
        res.send(result)
    });

}
