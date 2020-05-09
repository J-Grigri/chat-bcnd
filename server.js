require('dotenv').config()
const http = require('http');
const socketio = require("socket.io")
const app = require('./app');
const mongoose = require('mongoose')

mongoose.connect(process.env.DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log("successfully connected to database")).catch(err => console.log(err))

const server = http.createServer(app);//node server
const io = socketio(server)//create websocket server

const Filter = require("bad-words")
const filter = new Filter()

const Room = require('./src/models/room')
const Server = require('./src/utils/server')

io.on("connection", async (socket) => {//connection between the server and client(single connection)

    socket.on("login", async (userName, res) => {
        try {
            const user = await Server.login(userName, socket.id)
            console.log(userName)
            return res({ ok: true, data: user })
        } catch (er) {
            return res({ ok: false, error: er.message })
        }
    })

    socket.on("joinRoom", async (rId) => {
        //1. check user and return instance
        const server = await Server.checkUser(socket.id)

        //2. update db when user joins
        await server.joinRoom(rId)

        //3. update the current room to client
        socket.emit('selectedRoom', server.user.room)
        // there u go, no more error.Thanks. I have one issue since yesterday. the rooms do not show up

        //4. subscribe to channel
        socket.join(rId)

        //5.welcome msg
        socket.emit("messages", {
            name: "System",
            text: `Welcome to ${server.user.room.name} room ${server.user.name}`
        })
        // 6. send notification to everyone
        socket.to(rId).broadcast.emit("messages", {
            name: "System",
            text: `${server.user.name} joined the room`
        })
        // 7. update rooms globally
        io.emit("rooms", await Room.find())

        //LOGOUT
        socket.on("leaveRoom", async (_,cb) => {
            try{
                // check user and return instance
                const server = await Server.checkUser(socket.id)
    
                //update datbase when user leave a room:User.room, room.members
                await server.leaveRoom()
    
                //notify the other clients in that room
                console.log(server.user.rId)
                socket.to(server.user.rId).broadcast.emit("messages", {
                    name: "System",
                    text: `${server.user.name} has left the room`
                })
                //unsubscibe from channel
                socket.leave(server.user.rId)

                //update rooms globally
                io.emit("rooms", await Room.find())

            } catch (err){
                return cb({ok:false, error:err.message})
            }
        })
    })
    socket.emit("rooms", await Room.find())

    //message comes from frontend chat obj
    socket.on("sendMessage", async (msg, cb) => {
        try{
            const server = await Server.checkUser(socket.id)
            if (filter.isProfane(msg.text)) {
                return cb("Profanity is not allowed")
            }
            
            const chat = await server.chat(msg)
            
            io.to(server.user.room._id.toString())
            
            .emit("messages", {
                name: server.user.name, 
                text: chat.text, 
                room: chat.room
            }) 
        } catch (err){
            return cb({ok:false, message: err.message})
        }
    });

    socket.on("disconnect", async () => {
       
        try {
            const server = await Server.checkUser(socket.id)

            io.to(server.user.room).emit("messages", {
                name: "System",
                text: `${server.user.name} has disconnected`
            })
            await server.leaveRoom()
            io.emit("rooms", await Room.find({}))
        } catch (err) {
            console.log(err.message)
        }
    })
});


server.listen(process.env.PORT, () => {
    console.log("server listening on port " + process.env.PORT)
});