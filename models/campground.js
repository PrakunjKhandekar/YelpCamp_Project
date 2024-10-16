const mongoose = require('mongoose');
const Review = require('./reviews');
const { string } = require('joi');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url:String,
    filename:String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
})

const opts = {toJSON:{virtuals:true}};

const CampgroundSchema = new Schema({
    title : String,
    images : [ImageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price : Number,
    description : String,
    location : String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})
// Mongoose Middleware for deleting reviews along with campground

CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        // we have replaced remove method with deleteMany()
        await Review.deleteMany({
            _id:{
                $in : doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground',CampgroundSchema);