if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express =require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const ExpressError = require('./Utillity/ExpressError');
const methodOverride = require('method-override'); 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser : true,

    //depricated option by default true
    // useCreateIndex : true,
    
    useUnifiedTopology : true 
    // useFindAndModify:false
})


const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("databse connected");
});
const app = express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith:'_'
}));


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl:dbUrl,
    touchAfter:24 * 60 * 60,
    crypto:{
        secret
    }
});

store.on("error",function(e){
    console.log("Session store error",e);
})

const sesssionConfig = {
    store,
    name:'session',
    secret,
    resave:false,
    saveUnitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expries:Date.now()+ 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sesssionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    "https://api.maptiler.com/", // add this
];


const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives:{
            defaultSrc:[],
            connectSrc:["'self'", ...connectSrcUrls],
            scriptSrc:["'unsafe-inline'" , "'self'", ...scriptSrcUrls],
            styleSrc:["'self'" , "'unsafe-inline'", ...styleSrcUrls],
            workerSrc:["'self'" , "blob:"],
            objectSrc:[],
            imgSrc:[
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddty06kva/",
                "https://images.unsplash.com",
                "https://api.maptiler.com/"
            ],
            fontSrc:["'self'",...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);


// Home Page
app.get('/',(req,res)=>{
   res.render('home')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not found',404));
})

// Basic error handler Middleware
app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`serving on port ${port}`);
})