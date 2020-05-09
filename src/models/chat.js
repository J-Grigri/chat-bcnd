const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    text: {
        type: String,
        trim: true,
        require: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: "Room",
    },
})
module.exports = mongoose.model("Chat", schema)