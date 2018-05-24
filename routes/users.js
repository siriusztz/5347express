var express = require('express');
var userControllers = require('../controllers/users');

var router = express.Router();

router.post('/signup', userControllers.userSignup)
router.post('/signin', userControllers.userSignin)
router.post('/signout', userControllers.userSignout)

module.exports = router;