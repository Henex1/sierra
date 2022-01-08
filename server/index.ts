import express from "express";
import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";
import { SierraApiRequest } from "../lib/apiServer";
import { optionalEnv } from "../lib/env";
import { getTasks } from "../lib/runningTasks";
import * as log from "../lib/logging";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const port = optionalEnv("PORT", 3000);

nextApp.prepare().then(() => {
  const app = express();
  const server = createServer(app);
  const io = new Server();
  io.attach(server);

  let socket: Socket;

  io.on("connection", async (clientSocket: Socket) => {
    // Set running tasks on connected
    const tasks = await getTasks();

    socket = clientSocket;
    clientSocket.emit("running_tasks", { tasks });
  });

  app.all("*", (req: SierraApiRequest, res: any) => {
    // Pass io socket to each request
    req.io = socket;

    return nextHandler(req, res);
  });

  server.listen(port, () => {
    log.info(`Server initialized and listening on port: ${port}`);
  });
});
