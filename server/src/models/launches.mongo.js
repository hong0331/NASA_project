/**
 * dataframe for launches 
 */


const mongoose= require('mongoose');

// define a schema 
const launchesSchema= new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    }, 
    launchDate:{
        type:Date,
        required: true,
    },
    rocket: {
        type: String,
        required: true,
    }, 
    mission: {
        type: String,
        required: true,
    }, 
    target: {
        type:String,
    }, 
    upcoming: {
        type: Boolean,
        required: true,
    }, 
    success: {
        type: Boolean,
        required: true,
    }, 
    customers: [String], 
});



// create a model called launch and export 
module.exports= mongoose.model('Launch',launchesSchema); 
