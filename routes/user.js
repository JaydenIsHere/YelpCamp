const express = require('express');
const {isLoggedIn} = require('../middleware')
const router = express.Router();
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/user')
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage ,
limits:{fileSize :500000}//filesize in bytes, in this case it's 500 kb
});



//-------------------Register-------------------
router.route('/register')
   .get(users.renderRegisterForm)
   .post(catchAsync(users.createUser))

//--------------------Login------------------
router.route('/login')
   .get(users.renderLoginForm)
   .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.loginUser)

//------------------------logout------------
router.get('/logout',users.logoutUser)
//--------------forgot email form------------
router.post('/forgot',users.generateEmail)
//----------reset password---------
router.get('/resetpassword/:token',users.renderResetForm)
router.post('/resetpassword/:token',users.resetPassword)
//----------reset password for logged in user---------
router.get('/:id/passwordreset',isLoggedIn,users.renderResetPwForm)
router.put('/:id/passwordreset',isLoggedIn,users.loggedInResetPw)


//---------------user profile-------------
router.get('/:id',isLoggedIn,catchAsync(users.userProfile))
//----------------upload photo--------
router.post('/:id',upload.array('profile'),users.userUploadImg)
//-------------update profile---------
router.get('/:id/update',isLoggedIn,users.renderUpdateForm)
router.put('/:id',catchAsync(users.profileUpdate))


//----------------------delete accout----------------
router.delete('/:id',isLoggedIn,catchAsync(users.deleteUser))

module.exports = router;