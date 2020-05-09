const mongoose  = require ('mongoose')

const schema = new mongoose.Schema({
    name:{
        type: String,
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        unique: true
    }]
})
module.exports = mongoose.model("Room", schema)