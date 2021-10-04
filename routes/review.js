const express = require('express')
const router = express.Router({mergeParams:true});

const {isLoggedIn,validateReview,isReviewAuthor} = require('../middleware')//destructuring to get that middleware function
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/review')

//-------------create new review-------
router.post('/', isLoggedIn,validateReview,catchAsync(reviews.createReview))

//-------------delete new review-------
router.delete('/:reviewId' ,isLoggedIn,isReviewAuthor,catchAsync (reviews.deleteReview))


module.exports = router;