const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');//passport
const {cloudinary} = require('../cloudinary');
const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    image:
    [
    {
    url:String,
    filename:String
    }
],
resetPasswordToken:String,
resetPasswordExpires:Date
    // isAdmin:{type: Boolean, deFault:false}//only for admin if you need
    // reviews:[
    //     {
    //         type:Schema.Types.ObjectId,
    //         ref:'Review'//refer to Review model(important)
    //     }
    // ],campgrounds:[
    //     {
    //         type:Schema.Types.ObjectId,
    //         ref:'Campground'//refer to Campground model(important)
    //     }
    // ]
});
userSchema.plugin(passportLocalMongoose)


userSchema.post('findOneAndDelete' , async function(users){
  if(users.image)
{  
    for(const user of users.image)
    {
        await cloudinary.uploader.destroy(user.filename);
    }
}
})

module.exports = mongoose.model('User',userSchema)
