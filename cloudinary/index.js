
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
//here is for setting credential for cloudinary
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET,

});
//here is for setting how you going to store in the cloudinary
const storage = new CloudinaryStorage({
    cloudinary,//cloud and object
    params:{
        folder:'YelpCamp',//the folder in the cloudinary we should store in
        allowedFormats:['jpeg','png','jpg']
    }
   
});

module.exports ={
    cloudinary,
    storage
}