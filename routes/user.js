const express = require('express');
const router = express.Router();
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/user')
//-------------------Register-------------------
router.route('/register')
   .get(users.renderRegisterForm)
   .post(catchAsync(users.createUser))

//--------------------Login------------------
router.route('/login')
   .get(users.renderLoginForm)
   .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.loginUser)

//------------------------logout------
router.get('/logout',users.logoutUser)

//----------------------delete accout----------------

module.exports = router;