const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
 

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser : true,
    //depricated option by default true
    // useCreateIndex : true,
    useUnifiedTopology : true
})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("databse connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'6708184b4ca628e9f3698e4d',
            location :`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description : 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cum laborum nesciunt a culpa sit aperiam tempora fugit quo non optio. Maxime commodi, excepturi qui consequuntur quos nobis. Delectus, reiciendis obcaecati?',
            price,
            geometry: {
                type: 'Point',
                coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images:[
                {
                    url: 'https://res.cloudinary.com/ddty06kva/image/upload/v1728849839/YelpCamp/wzshy3of7p0lspzmnt3k.jpg',
                    filename: 'YelpCamp/wzshy3of7p0lspzmnt3k'
                },
                {
                    url: 'https://res.cloudinary.com/ddty06kva/image/upload/v1728849852/YelpCamp/jxurd4lok8qwl8ojbxcq.jpg',
                    filename: 'YelpCamp/jxurd4lok8qwl8ojbxcq'
                }
                
            ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
});