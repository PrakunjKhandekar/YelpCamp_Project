const express = require('express');
const router = express.Router();
const catchAsync = require('../Utillity/catchAsync');
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({storage});

// get - home page 
// post - sending data of newly added campground
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
    

// new campground page
router.get('/new',isLoggedIn,campgrounds.renderNewForm);

// Show page for single campground
//Edit page
//delete campground
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground));


// Put Request for edit page
router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;