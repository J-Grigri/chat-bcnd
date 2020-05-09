const express = require('express');
const router = new express.Router();

const app = express();

app.use(router)
router.route("/").get((req, res) => {
    res.send("ok")
})

const Room = require('./src/models/room');
app.use(router)
router.route("/create-rooms").get(async (req, res) => {
    try {
        await Room.insertMany([
            {
                name: "Chrome",
                members: []
            },
            {
                name: "Safari",
                members: []
            },
            {
                name: "FireFox",
                members: []
            },
            {
                name: "Opera",
                members: []
            },
            {
                name: "Coccoc",
                members: []
            }, 
        ]);
        res.send("ok");
    } catch (err) {
        console.log(err.message);
    };
})

module.exports = app;