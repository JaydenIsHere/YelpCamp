const mongoose = require('mongoose');
const {Schema} = mongoose;
//For the review 
const reviewSchema = new Schema({
 body:String,   
 rating:Number,
 author:{
type:Schema.Types.ObjectId,
ref:'User'//reference to a user instance.
//every user can make a review on each campground
 }
})
module.exports = mongoose.model('Review',reviewSchema)