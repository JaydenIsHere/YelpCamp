const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware')//destructuring to get that middleware function
const campgrounds = require('../controllers/campground')
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage ,
limits:{fileSize :500000}//filesize in bytes, in this case it's 500 kb
});


//--------------Read data on page-----------------
router.get('/',catchAsync(campgrounds.index));

//-------------Create a new campground------------------
router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.post('/' , isLoggedIn,upload.array('image'),validateCampground ,catchAsync (campgrounds.createCampground))

//---------------Create ID for each campgound------------
router.get('/:id',catchAsync(campgrounds.detailPage))


//-----------------update campground------------------------
router.get('/:id/edit' , isLoggedIn,isAuthor,catchAsync(campgrounds.renderUpdateForm))

router.put('/:id' , isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync (campgrounds.updateCampground))

//-----------------delete campground------------------------
router.delete('/:id',isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))

module.exports = router;