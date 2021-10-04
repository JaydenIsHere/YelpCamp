//this file is self containd, we building the data out here and app.js can access them from here

const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {descriptors,places} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelpCamp', { useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",() =>{
console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];//we pass the array to the function then it will randomly pick up the places and description

const seedDB = async () =>{//test here can connect to mongoDB
    await Campground.deleteMany({})//delete everything
    for(let i = 0;i <200;i++)
    {
      const price = Math.floor(Math.random()*20 +10)//(must be in the loop)
      const random1000 = Math.floor(Math.random() *1000);//ramdomly pick up city(must be in the loop)
        const camp =  new Campground ({
          author:"6148615a60fc7f9bb7a9823e",//set all of these campground of this ID
          location :`${cities[random1000].city},${cities[random1000].state}`,
          title:`${sample(descriptors)} ${sample(places)}`,
          description:' Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi cupiditate, quibusdam delectus dicta recusandae nihil saepe. Ratione ut quisquam nulla a quis harum rerum fugit! Enim hic alias esse minima!',
          price:`${price}`,//shorthand price:price
          geometry: {
            type: "Point",
            coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
            ]
        },
            images: [
                {
                  url: 'https://res.cloudinary.com/dg4qomfkb/image/upload/v1632578774/YelpCamp/pjbtztxbt0kosk6ruxvd.jpg',
                  filename: 'YelpCamp/pjbtztxbt0kosk6ruxvd',              
                },
                {
                  url: 'https://res.cloudinary.com/dg4qomfkb/image/upload/v1632578775/YelpCamp/dwc3dwqdoljmubldizpi.jpg',
                  filename: 'YelpCamp/dwc3dwqdoljmubldizpi',        
                },
                {
                  url: 'https://res.cloudinary.com/dg4qomfkb/image/upload/v1632578775/YelpCamp/klq1nqf8yzasog29rdpj.jpg',
                  filename: 'YelpCamp/klq1nqf8yzasog29rdpj',
                }
              ]
        })//set city with state 
        await camp.save();
    }
}
seedDB()
.then(() =>{
    mongoose.connection.close();//close the connection
})
