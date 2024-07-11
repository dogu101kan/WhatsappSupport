const express = require("express");
let cors = require("cors");
const customErrorHandler = require("./middlewares/errors/customErrorHandler");
const wpClient = require("./helpers/client");

const path = require("path");
const routers = require("./routers/index");

require("dotenv").config({
  path: "./config/env/config.env",
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("client1", wpClient.initialize("client1"));

app.use("/api", routers);
const PORT = process.env.PORT || 3000;


const http = require("http");
const socket = require("./helpers/socket/index");
const server = http.createServer(app);

socket.initializeSocket(server, wpClient);


app.use(customErrorHandler);
server.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

module.exports = server;