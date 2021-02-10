if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express=require('express')
const mongoose=require('mongoose')
const path=require('path')
const methodOverride=require('method-override');
const ExpressError=require('./utils/ExpressError');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy = require('passport-local');
const User =require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet');
//const {MongoStore}=require('connect-mongo');
const MongoDBStore = require('connect-mongo')(session);
const app=express();

const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const userRoutes=require('./routes/users');

const dburl=process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dburl, {useNewUrlParser: true,useCreateIndex: true, useUnifiedTopology: true,useFindAndModify:false});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store=new MongoDBStore({
    url:dburl,
    secret,
    touchAfter: 24*60*60
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR",e);
})

const sessionConfig={
    store,
    name:'Session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
            httpOnly:true,
            //secure:true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge:1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duzgvbeyn/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);
app.use('/',userRoutes);

app.get('/',(req,res)=>{
    res.render('home');
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)err.message='Something Went Wrong!!!';
    res.status(statusCode).render('error',{err});
})

const port=process.env.PORT ||3000;

app.listen(port,()=>{
    console.log(`CONNECTED TO PORT ${port}!!`)
})