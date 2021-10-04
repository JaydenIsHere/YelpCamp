
const Campground = require('../models/campground');
const Review = require('../models/review');

//-------------create new review-------
module.exports.createReview = async(req,res) =>{//push the request data to parents model
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
   review.author = req.user._id //for tracking anf verifying purpose by checking _id only
    campground.reviews.push(review)//as in there's another form for user to create new review that's we need to push into campground
    await review.save();
    await campground.save();
    req.flash('success','Congrat You created the new review !!!')
  res.redirect(`/campground/${campground._id}`)
}
//----------------delete review-----------------
module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
   await  Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})//pull from the reviews array and pull the data match reviewId
   await Review.findByIdAndDelete(reviewId)
   req.flash('warning','You have deleted review')//embed flash info

   res.redirect(`/campground/${id}`)
}