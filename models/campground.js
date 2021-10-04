const mongoose = require('mongoose');
const Schema = mongoose.Schema;//shortcut.we're actually going to be referencing Mongoose, that schema quite a bit.Once we get to relationships, we'll do things like this Momgoose dot schema, dot types, dot something
const Review= require('./review')
const opts = { toJSON: { virtuals: true } };
const ImageSchema = new Schema({
    url:String,
    filename:String
});
ImageSchema.virtual('thumbnail').get(function (){//virtual is from mongoose function,give us a new property
    return this.url.replace('/upload','/upload/w_200');
});

const campGroundSchema = new Schema({
    title:String,
    images:[ImageSchema],
    geometry:{
        type: {
            type: String, 
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    },
    price:Number,
    description:String,
    location:String,
    author:{
         type:Schema.Types.ObjectId,
         ref:'User'//refer to User model(important)
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'//refer to Review model(important)
        }
    ]
 
},opts);
campGroundSchema.virtual('properties.popUpMarkup').get(function (){//virtual is from mongoose function,give us a new property
    return ` <strong><a href="/campground/${this._id}">${this.title}</a> </strong>
    <p>${this.description.substring(0,25)}...</p>`
},);


//when I delete a campground this middleware will then delete all the related reviews  
campGroundSchema.post('findOneAndDelete' , async function(doc){//This is query middleware
    //In the route if used the removed method or delete many, well, that is not going to trigger this middleware.
    if(doc){//
await Review.deleteMany({
    _id:{//in the particular -id
       $in:doc.reviews
    }
})
    }
})
module.exports = mongoose.model('Campground',campGroundSchema)//exports model