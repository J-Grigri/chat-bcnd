const User = require("../models/user");
const Room = require("../models/room");
const Chat = require("../models/chat");


class Server {
    constructor(user) { 
        this.user = user 
    };
    //check if userName excists in db, if not create a new user
    static async login(userName, socketId) {
        let user = await User.findOne({ name: userName.toLowerCase() })
        if (!user) {
            user = await User.create({ name: userName.toLowerCase(), token: socketId })
        };
        user.token = socketId
        await user.save()
        return user
    }
   
    static async checkUser(socketId) {
        const user = await User.findOne({ token: socketId })
        if (!user) throw new Error("User not found")
        return new Server(user)//instance
    }

    //add user to the members array
    async joinRoom(rId) {
        const room = await Room.findById(rId)
        if (!room.members.includes(this.user._id)) {
            room.members.push(this.user._id)
            await room.save()
        }
        this.user.room = rId;//rId is Object.id from mongoose
        await this.user.save();
        this.user.room = room; //make it into a room obj
    }
    async chat(msg) {
        const chat = await Chat.create({
            text: msg.text,
            user: this.user._id,
            room: this.user.room._id
        });
        return chat
        console.log(chat)
    }

    async leaveRoom() {
        let rId = this.user.room
        //find room from id
        const room = await Room.findById(rId)
        if(!room) throw new Error("room not found")
        //remove user id from array
        room.members.remove(this.user._id)
        await room.save()
        this.user.room = null;
        await this.user.save()
        //we will need this rId -->server.user.rId
        this.user.rId = rId
    }
}

module.exports = Server

//--> const server = new Server(id, name)