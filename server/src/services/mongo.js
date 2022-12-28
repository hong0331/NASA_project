const mongoose= require('mongoose');

const MONGO_URL= process.env.MONGO_URL;


mongoose.connection.once ('open',()=>{
    console.log("MongoDB connection ready! ")
});
mongoose.connection.once('error',()=>{
    console.error('err');
});

async function mongoConnect(){
    await mongoose.connect(MONGO_URL,{
        // userNewUrlParser: true,
        // useFindAndModify: false,
        // useCreateIndex: true, 
        // useUnifiedTopology: true,
       });
}

async function mongoDisconnect(){
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect,
};