const express = require('express');
const router = express.Router({mergeParams: true });
const catchAsync = require('../Utillity/catchAsync');
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/',isLoggedIn,validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId',isReviewAuthor,isLoggedIn,catchAsync(reviews.deleteReview))

module.exports = router;