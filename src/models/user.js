const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        toLowerCase: true
        
    },
    token: String,
    room: {
        type: mongoose.Schema.ObjectId,
        ref:"Room",
    }
})
module.exports = mongoose.model("User", schema)