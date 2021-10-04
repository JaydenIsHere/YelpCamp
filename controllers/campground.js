const Campground = require('../models/campground');

const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })



//--------------Read data on page-----------------
module.exports.index = async (req,res) =>{
    const campgrounds = await Campground.find({})
    res.render('camp/index',{campgrounds})
    }
//-------------Create a new campground------------------
module.exports.renderNewForm =(req,res) =>{
        res.render('camp/new')  
    }

module.exports.createCampground = async (req,res,next) =>{
   const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1,
    }).send()
    const campground = await new Campground(req.body.campground);
    if(!geoData.body.features.length)
    {
      req.flash('error','No location found !!')//embed flash info
      return res.redirect(`/campground/new`)
    }
    campground.geometry = geoData.body.features[0].geometry//from geogoding API
    campground.images = req.files.map(f => ({url:f.path , filename: f.filename}));//loop over the file object (multer middleware) to get path and filename and store in the campground.images(model)
    campground.author = req.user._id;//this means save the current login user ID to campground.author(model)
    await campground.save();//save to Mongo
    console.log(campground)
    req.flash('success','Successful create new campground')//embed flash info
    res.redirect(`/campground/${campground._id}`)
}
//---------------Create ID for each campgound------------
module.exports.detailPage = async (req,res) => {
    const campgrounds = await Campground.findById(req.params.id).populate(
        {path:'reviews',
        populate:{
        path:'author'
        }
    }).populate('author');//populate child model data  
    if(!campgrounds)
    {
        req.flash('error','The campground cannot be found')//embed the error flash message 
        return res.redirect('/campground')
    }
    res.render('camp/detail',{campgrounds})
}
//-----------------update campground------------------------
module.exports.renderUpdateForm = async (req,res) =>{
    const {id} = req.params;
    const campgrounds = await Campground.findById(id)//find that route id match to _id in database
    if(!campgrounds)
    {
        req.flash('error','The campground cannot be found')//embed the error flash message 
        return res.redirect('/campground')
    }
    res.render('camp/edit',{ campgrounds })
}

module.exports.updateCampground = async (req,res) =>{
    const {id} =req.params;//I want to access that particular ids
    const campgrounds = await Campground.findByIdAndUpdate(id,{...req.body.campground});//find that route id match to _id in database
    const imgs = req.files.map(f => ({url: f.path , filename: f.filename}));//req.file is an array object and store in variable
    campgrounds.images.push(...imgs);//spread that array get data only
   await campgrounds.save();
   if(req.body.deleteImage)
   {
       for(let filename of req.body.deleteImage){//loop over array
           await cloudinary.uploader.destroy(filename);
       }
      await  campgrounds.updateOne({$pull:{images:{filename:{$in:req.body.deleteImage}}}})//define specific path to delete image in mongo
    
   }
    req.flash('amend',`Successful amend the ${campgrounds.title} campground`)//embed flash info
    res.redirect(`/campground/${campgrounds._id}`)
}

//-----------------delete campground------------------------
module.exports.deleteCampground = async (req ,res) =>{
    const {id} =req.params;//I want to access that particular id
    await Campground.findByIdAndDelete(id);
    req.flash('warning','You have deleted campgound')//embed flash info
    res.redirect(`/campground`);
}
