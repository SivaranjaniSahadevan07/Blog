const mongoose = require('mongoose')

const connectDB = ()=>{
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.info('MongoDB connection established'))
        .catch((err)=> console.error(err.message))
}

module.exports = connectDB