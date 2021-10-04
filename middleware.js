const {campgroundSchema,reviewSchema} = require('./joiSchema.js');
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next) =>{//it's middleware function
    if(!req.isAuthenticated())
    {   
        req.flash('error','You must log in first')
        return res.redirect('/login')//must return otherwise below code still run
    }
    else{
        next()
    }
}

module.exports.validateCampground = (req,res,next) =>{//prevent someone use post men to submit invalid request
    const {error}= campgroundSchema.validate(req.body)//from JoiSchema and we only get error portion
 if(error)
 {
     const meg = error.details.map(el => el.message).join(',')//return message and join with , if there are more than one element
throw new ExpressError( meg  ,400)
 }else{
     next();
 }
}

module.exports.isAuthor = async (req,res,next) =>{
    const {id} =req.params;//I want to access that particular ids
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id))//req.user._id is show current logged in user
   {
       req.flash('error','You do not have permission to do that')
      return  res.redirect(`/campground/${id}`)
   }
   else{
       next()
   }
}

module.exports.validateReview =(req,res,next) =>{
    const {error} = reviewSchema.validate(req.body)
    if(error)
    {
        const meg = error.details.map(el => el.message).join(',')//return message and join with , if there are more than one element
   throw new ExpressError( meg  ,400)
    }else{
        next();
    }
}
// /campground/id/reviews/reviewId
module.exports.isReviewAuthor = async (req,res,next) =>{
    const {id,reviewId} =req.params;//I want to access that particular ids
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id))//req.user._id is show current logged in user
   {
       req.flash('error','You do not have permission to do that')
      return  res.redirect(`/campground/${id}`)
   }
   else{
       next()
   }
}



 