var mongoose = require('../module/module');
var moment = require('moment')
var async = require("async");
var fs = require('fs');
var path = require('path');

var Revision = mongoose.model('Revision');
var Editor = mongoose.model('Editor')
var Article = mongoose.model('Article')

//post 录入 作者
module.exports.inputEditor = function (req, res, next) {
    //读两个注册用户的文件
    Editor.findOne({ 'name': 'Zzyzx11' }, function (err, editor) {
        if (err) throw err;
        if (!editor) {
            fs.readFile(path.join(__dirname, "../public/Dataset/Admin.txt"), 'utf8', function (err, data) {
                if (err) console.log(err);

                var nameArr = data.split('\n')
                for (var i = 0; i < nameArr.length; i++) {
                    var editor = new Editor({
                        name: nameArr[i],
                        category: 'admin'
                    });
                    // 插入数据 
                    editor.save(function (err) {
                        if (err != null) {
                            console.log(err)
                            res.send('input error')
                        }
                    })
                }
            });
        }
    });
   
    Editor.findOne({ 'name': 'AttributionBot' }, function (err, editor) {
        if (err) throw err;
        if (!editor) {
            fs.readFile(path.join(__dirname, "../public/Dataset/Bot.txt"), 'utf8', function (err, data) {
                if (err) console.log(err);
                var nameArr = data.split('\n')
                for (var i = 0; i < nameArr.length; i++) {
                    var editor = new Editor({
                        name: nameArr[i],
                        category: 'bot'
                    });
                    // 插入数据 
                    editor.save(function (err) {
                        if (err != null) {
                            console.log(err)
                            res.send('input error')
                        }
                    })
                }
                res.send('successful')
            });
        } else {
            res.send('inputing editor has been done')
        }
    });

}

//post 录入修改
module.exports.inputRevision = function (req, res, next) {
    console.log(moment().format())
    filepath = path.join(__dirname, "../public/Dataset/revisions")

    files = fs.readdirSync(filepath);

    async.eachLimit(files, 4, function (filename, callback) {

        fs.readFile(path.join(filepath, filename), 'utf8', function (err, data) {
            if (err) console.log(err);
            var test = JSON.parse(data);

            console.log(test.length)
            console.log(filename + ',begin,' + moment().format())

            async.eachSeries(test, function (value, callback) {
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
                        // 插入revision数据 
                        var year = moment(value.timestamp).year()
                        var revision = new Revision({
                            title: value.title,
                            timestamp: value.timestamp,
                            user: value.user,
                            year: year,
                            editCla: categ,
                        });
                        revision.save(function (err) {
                            if (err != null) {
                                callback(err)
                                res.send('one failed!')
                            } else {
                                callback()
                            }
                        })
                    });
            }, function (err) {
                if (err) console.log(err.message);
                console.log(filename + ',finished,' + moment().format())
                callback()  //第一层的callback
            });
        })

    }, function (err) {
        if (err) console.log(err.message);
    })

    res.send('successful')
}

//录入文章
module.exports.inputArticle = function (req, res, next) {
    filepath = path.join(__dirname, "../public/Dataset/revisions")
    files = fs.readdirSync(filepath);

    for (var i = 0; i < files.length; i++) {
        var n = files[i].replace(".json", "")
        var article = new Article({
            name: n,
        });
        article.save(function (err) {
            if (err != null) {
                res.send('one failed!')
            }
        });
    }

    res.send("num" + files.length)
}