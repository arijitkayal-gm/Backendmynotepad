const mongoose = require('mongoose');

const mongoURI = "mongodb://127.0.0.1:27017/mynotepad";

const connectToMongo = () => {
    mongoose.connect(mongoURI).then(()=>{console.log("Connection  successful")}).catch((err)=>{console.log("Connection not successful")})
}


module.exports= connectToMongo;