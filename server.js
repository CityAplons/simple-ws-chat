"use strict";

//ext libs
const chalk = require('chalk');

//express init
const express = require('express');
const session = require('express-session');
const app = express();
const ws = require('express-ws')(app);
const http = require("http").Server(app);
const port = 3000;

//db init
const db = require("./models/index");

//routes
const users = require('./routers/v1/user');
const chats = require('./routers/v1/chat');
app.use('/v1/', users);
app.use('/v1/', chats);

//Middleware
const bodyParser = require('body-parser');
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//server init
let server = app.listen(port, () => {
  console.log(chalk.yellow(`Server alive on port: ${port}\nServer PID: ${process.pid}\nUse "kill [pid]" to terminate server!`));
});

//exit code
process.on('SIGTERM', function () {
  server.close(() => {
    sequelize.close();
    console.log(chalk.red('Server gracefully stopped!'));
  });
  setTimeout( function () {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
   }, 30*1000);
});
