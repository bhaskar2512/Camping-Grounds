const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 350; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const x=Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'601d3baf765ea0055491267f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit essecillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            price: x,
            geometry:{
                type:"Point",
                coordinates:[cities[random1000].longitude,cities[random1000].latitude]
            },
            images:[
                {
                    url:"https://res.cloudinary.com/duzgvbeyn/image/upload/v1612874609/YelpCamp/rgyn064jhblhmmvbqlbh.jpg" ,
                    filename:"YelpCamp/rgyn064jhblhmmvbqlbh"
                },
                {
                    url:"https://res.cloudinary.com/duzgvbeyn/image/upload/v1612874609/YelpCamp/rgyn064jhblhmmvbqlbh.jpg" ,
                    filename:"YelpCamp/rgyn064jhblhmmvbqlbh"
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})