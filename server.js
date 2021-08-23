/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const http = require("http");
const next = require("next");
const socketio = require("socket.io");
const { getAsync } = require("./lib/redis");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

let port = 3000;

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);
  const io = new socketio.Server();
  io.attach(server);

  let socket = null;

  io.on("connection", async (clientSocket) => {
    // Set running tasks on connected
    const data = await getAsync("running_tasks");
    const tasks = JSON.parse(data);

    socket = clientSocket;
    clientSocket.emit("running_tasks", { tasks });
  });

  app.all("*", (req, res) => {
    // Pass io to each request
    req.io = socket;

    return nextHandler(req, res);
  });

  server.listen(port, (err) => {
    if (err) {
      throw new Error(err);
    }
    console.log(`Server listening on port: ${port}`);
  });
});
