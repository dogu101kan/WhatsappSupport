/** @format */

const { Server } = require("socket.io");
const { saveMessageForAPI } = require("../db");
const { MessageMedia } = require("whatsapp-web.js");
const { base64ToBuffer } = require("../base64");

let io;
let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = async (socketId) => {
    try {
        users = users.filter((user) => user.socketId !== socketId);
    } catch (error) {}
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

const emit = (name, message) => {
    io.emit(name, message);
};

function initializeSocket(httpServer, wpClient) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 1e8,
        pingTimeout: 60000,
    });

    io.on("connection", (socket) => {
        let client = wpClient.getClient();
        console.log("User connected.", socket.id);

        socket.on("addUser", (userId) => {
            try {
                addUser(userId, socket.id);
            } catch (error) {}
        });
        socket.on("disconnect", () => {
            removeUser(socket.id);
        });

        socket.on("new_message", async (data) => {
            try {
                if (data.hasMedia) {
                    const media = new MessageMedia(
                        data.file.mediaType,
                        data.file.media,
                        data.file.filename
                    );
                    client.sendMessage(`${data.selectedPhone}@c.us`, media, {
                        caption: data.message,
                    });
                } else {
                    client.sendMessage(
                        `${data.selectedPhone}@c.us`,
                        data.message
                    );
                }

                await saveMessageForAPI(data);
            } catch (e) {
                console.log(e);
            }
        });
    });
}

module.exports = {
    initializeSocket,
    emit,
};
