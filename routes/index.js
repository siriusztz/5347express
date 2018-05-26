var express = require('express');
// var userControllers = require('../controllers/users');
var indexControllers= require('../controllers/utils')
var overallControllers= require('../controllers/overall')
var indivController=require("../controllers/individual")
var authorControler=require("../controllers/author")
var router = express.Router();

// router.get('/', userControllers.getSingnupPage)
//导入
router.post('/editor',indexControllers.inputEditor)
router.post('/revision',indexControllers.inputRevision)
router.post('/inputArticle',indexControllers.inputArticle)

//overall
router.get('/overall/revisenumrank',overallControllers.reviseNumRank)     //每篇修改量的排序
router.get('/overall/reviseuserank',overallControllers.reviseUserRank)    //每篇文章唯一修改用户的数量排序
router.get("/overall/historyrank",overallControllers.historyRank)         //历史排序
router.get("/overall/statistic",overallControllers.numBytimeByuser)

//individual
router.get('/indiv/allarticle',indivController.queryAllArticle)  //得到所有titles
router.get('/indiv/select',indivController.selectArticle)
router.get('/indiv/wiki/:name',indivController.queryIfnewArticle)
router.get('/indiv/article/:name',indivController.titleAndrevision)    //前两个数据
router.get("/indiv/topfive/:name",indivController.revisenumbyEditor) //前五名的修改量
router.get("/indiv/statistic/:name",indivController.numBytimeByuser)     //两个图的数据
router.get("/indiv/topfivestatistic",indivController.topFiveBytimeByuser)  //最后一个图

//author
router.get("/author/select",authorControler.selectAuthor)
router.get("/author/revisions/:name",authorControler.revisionByAuthor)


module.exports = router;