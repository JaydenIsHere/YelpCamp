
const User = require('../models/user')
const Campground = require('../models/campground');//for user deletion
const Review = require('../models/review');//for user deletion
const async = require('async')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
//-------------------Register-------------------
module.exports.renderRegisterForm = (req,res) =>{
    res.render('users/register')
    }

module.exports.createUser = async (req,res,next) =>{
        try{ 
        const {username,password,email} = req.body
        const user = new User({username,email}) 
        const newUser =  await User.register(user,password)//from passport, including save()
       req.login(newUser, err =>{//req.login is from passport
        if(err) return next(err)//if have error pass it to error handler
        req.flash('success','Welcome to YelpCamp!!');
        res.redirect('/campground')
        
    })  
    }
    catch(e){
    req.flash('error',e.message)
    res.redirect('/register')
    }
 }
//--------------------Login------------------
module.exports.renderLoginForm = (req,res) =>{
        res.render('users/login')
    }

module.exports.loginUser =  (req,res) =>{//passport help you do compare
    req.flash('success','Welcome back to YelpCamp')
    const redirectUrl = req.session.returnTo || '/campground' //either back to wherever they were or back to index campground
    delete req.session.returnTo;//delete the session after redirect the user 
    res.redirect(redirectUrl)

    }
//-------------------logout------------------
module.exports.logoutUser = (req,res) =>{
        req.logout();
        req.flash('success','You are logged off, Good Bye')
        res.redirect('/campground')
        }

//---------------reset password------------
module.exports.renderResetForm =(req,res) =>{
    res.render('users/resetpw')
}
//--------------forgot password generate email-----------
module.exports.generateEmail = (req,res,next) =>{
async.waterfall([
    function(done){
        crypto.randomBytes(20,function(err,buf){
            var token = buf.toString('hex');
            done(err,token);
        });
    },
    function(token,done){
   User.findOne({email: req.body.email},function (err,user){
if(!user){
    req.flash('error','No account with that email address exsits');
    return res.redirect('/forgot');
}
    user.resetPasswordToken = token;//reset password equals to token
    user.resetPasswordExpires = Date.now() + 3600000 //1 hour
  
    user.save(function(err){
done(err,token,user)
    });
   });
},
function(token,user,done){//we sending email
   var smtpTransport = nodemailer.createTransport({//nodemailer allow us to send mail
        service:'Gmail',
        auth:{
            user:'mrwebsite0621@gmail.com',
            pass:process.env.GMAILPW
        }
    });
    var mailOption ={//this is the email what user is going to see
        to:user.email,
        from:'mrwebsite0621@gmail.com',
        subject:'Node.js Password Reset',
        text:'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/user/resetpassword/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    smtpTransport.sendMail(mailOption,function(err){//send a actual email
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
    });
}
],function(err){
    if(err)return next(err);
    res.redirect('/forgot');
});
}
//------------Show the rest form to user----------
module.exports.renderResetForm = async (req, res) => {
    const thisUser = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }) 
    if (!thisUser) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('users/resetpw', {token: req.params.token});
    };

    //-----------user reset the password on the reset form---------
 module.exports.resetPassword = (req, res) =>{
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {//password must be same with confirm password
            
            user.setPassword(req.body.password, function(err) {
                //setPassword is from passport
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  //once we save the reset password we no longer need that token
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('/forgot');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({//inform user completed reset
          service: 'Gmail', 
          auth: {
            user: 'mrwebsite0621@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'mrwebsite0621@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campground');
    });
  };
//-------------reset pw for logged in user--------
module.exports.renderResetPwForm = async (req,res) =>{
  const thisUser = await User.findById(req.user._id) 
  if (!thisUser) {
      req.flash('error', 'No user found');
      return res.redirect(`/user/${req.user._id}`)
    }
    res.render('users/pwreset', {thisUser});
}

module.exports.loggedInResetPw = async (req,res) =>{

 const user =  await User.findById(req.params.id)
  if(req.body.password === req.body.confirm) {//password must be same with confirm password
            
    user.setPassword(req.body.password, function(err) {
        //setPassword is from passport
      user.save();
      req.login(user, err =>{//req.login is from passport
        if(err) return next(err)//if have error pass it to error handler
        req.flash('success','You have changed the password !!');
        res.redirect(`/user/${req.user._id}`)
    })  
    })
  } else {
      req.flash("error", "Passwords do not match.");
      return res.redirect(`/user/${req.user._id}`)
  }
}
//--------------------create and read user profile--------
module.exports.userProfile = async (req,res) =>{
    const thisUser = await User.findById(req.params.id)
  const campgrounds = await Campground.find().where('author').equals(thisUser._id)//from campground to find specific user same as current one
    res.render('users/profile',{thisUser,campgrounds})
}

//------------upload profile image-----------------
module.exports.userUploadImg = async(req,res) =>{
  const thisUser = await User.findById(req.params.id)
    const imgs = req.files.map(f => ({url: f.path , filename: f.filename}));//req.file is an array object and store in variable
    thisUser.image.push(...imgs);//spread that array get data only 
    await thisUser.save();
   req.flash('success','Successful upload profile image')//embed flash info
   res.redirect(`/user/${thisUser._id}`)
}
//----------------update Profile----------------------
module.exports.renderUpdateForm =async(req,res) =>{
    const thisUser = await User.findById(req.user._id)
if(!thisUser){
    req.flash('error','The user cannot be found')//embed the error flash message 
    return res.redirect('/campground')
}
    res.render('users/update',{thisUser})
}

module.exports.profileUpdate = async (req,res) => {
  try{
const {username,email} = req.body
const updatedUser = await User.findByIdAndUpdate(req.user._id,{$set:{username:username,email:email}});
req.session.passport.user = username;
req.flash('amend',`Successful amend the user`)//embed flash info
res.redirect(`/user/${req.user._id}`)
  }   catch(e){
    req.flash('error',e.message)
    res.redirect(`/user/${req.user._id}`)
    }
}


//--------------deleteUser----------------
module.exports.deleteUser = async (req,res) =>{

   await User.findByIdAndDelete(req.user._id)
   const deleteCamp =  await Campground.find().where('author').equals(req.user._id)//from campground to find specific user same as current one
   await Campground.findByIdAndDelete(deleteCamp)
    const deleteReview = await Review.find().where('author').equals(req.user._id)
   await Review.findByIdAndDelete(deleteReview)
    req.flash('warning','You have deleted your account, Good Bye')
    res.redirect('/campground')
}