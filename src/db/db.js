const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`Database Connected Successfully `);
    } catch (e) {
        console.error("Databse connection error : ", e);
    }
}

module.exports = connectDB;