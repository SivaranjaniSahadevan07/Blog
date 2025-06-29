const mongoose = require('mongoose')

const connectDB = ()=>{
    mongoose.connect(process.env.MONGODB_URL)
        .then(()=> console.log("MongoDB connection success!!!"))
        .catch((err)=> console.error(err.message))
}

module.exports = connectDB