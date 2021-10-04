if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();//only for development 
}


const express = require('express');
const path = require('path');//path is Node.js native utility module.
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash')
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi');
const {campgroundSchema,reviewSchema} = require('./joiSchema.js');
const campgroundRoute = require('./routes/campground')
const reviewRoute = require('./routes/review')
const userRoute = require('./routes/user')
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize =require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoStore = require('connect-mongo');


// const db_Url = process.env.DB_URL;
const db_Url = process.env.DB_URL || 'mongodb://localhost:27017/yelpCamp';
mongoose.connect(db_Url, { useNewUrlParser: true, useUnifiedTopology: true})
const db =mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",() =>{
console.log("Database connected");
});

const mySecret = process.env.SECRET || 'thisismysecret';

const store = MongoStore.create({
    mongoUrl:db_Url,
    touchAfter:24*60*60,
    crypto:{
       secret: mySecret
    }   
})
store.on('error', function(e){//show store error
console.log('Session Store Error',e)
})
const app = express();
const sessionconfig ={//pass in some configuration object
    store:store,
    name:'session',
    secret:mySecret,
    resave:false,
    saveUninitialized:true,// make the session.DEPRECATION warnings go away.
    //Eventually we're going to make the store a mango store. But right now it's just going to be the memory store
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60* 24 * 7
    }
    }
    app.use(session(sessionconfig))
app.set('views',path.join(__dirname,'views'));//enable access the ejs app from anywhere, views is refers to views forder
app.set('view engine','ejs');//In order to access the ejs
  
app.use(express.urlencoded({ extended: true })) //auto parse the req.body 
app.use(methodOverride('_method'));//for allow to use delete and patch
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,'public')))
app.use(flash())
app.use(mongoSanitize({
    replaceWith: '_',
  }),)//express mongo sanitize

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dg4qomfkb/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT cloud name! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session());//must set after session
passport.use(new LocalStrategy(User.authenticate()))//store the authentication in our User model the name is 'authenticate'

passport.serializeUser(User.serializeUser())//store user in the session
passport.deserializeUser(User.deserializeUser())//get userID out of the session

app.use ((req,res,next) =>{//a middleware accept every requiest
   
if(!['/login','/'].includes(req.originalUrl))
{
    req.session.returnTo = req.originalUrl//redirect user to wherever they were
}
    res.locals.success = req.flash('success')//res.locals.success is a variable that created by us to be stored the req.flash('success')
    res.locals.amend =req.flash('amend')
    res.locals.warning =req.flash('warning')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user;//currentUser is a variable created by us,can be access on every request, req.user is from passport that it shows the register user inform
        next()
    })

app.use('/campground',campgroundRoute)//campground router
app.use('/campground/:id/reviews',reviewRoute)//review router
app.use('/',userRoute)

app.get('/' , (req, res) =>{
    res.render('home')
});


app.all('*',(req,res,next) =>{
 next(new ExpressError('Page not found',404));
})//tackle the async function error, by default the Express don't handle async

app.use((err,req,res,next) =>{//here is handle majority of error includeing when we throw the error
    const{statusCode = 500} = err;//we provided the backup error message
    if(!err.message) err.message = "Oh something went wrong";
    res.status(statusCode).render('error',{ err } );
})

const port = process.env.PORT || 3000
app.listen(port, () =>{
    console.log(`We are listen on port ${port}`)
})


