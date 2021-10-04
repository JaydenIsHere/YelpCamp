
const User = require('../models/user')
const Campground = require('../models/campground');//for user deletion
const Review = require('../models/review');//for user deletion
//-------------------Register-------------------
module.exports.renderRegisterForm = (req,res) =>{
    res.render('users/register')
    }

module.exports.createUser = async (req,res) =>{
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
    } }
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