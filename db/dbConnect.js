const mongoose = require("mongoose");
require('dotenv').config()


  // use mongoose to connect this app to our database on mongoDB using the DB_URL (connection string)
  const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false)
        mongoose.connect(process.env.DB_URL) 
        console.log('Mongo connected')
    } catch(error) {
        console.log(error)
        process.exit()
    }
}
module.exports = connectDB


// module.exports = connectDB;

// module.exports = dbConnect;
