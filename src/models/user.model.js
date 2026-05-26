const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,

        default: Date.now
    },
    role: {
        type: String,
        enum: ['user', 'artist'],
        default: 'user'
    }
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;