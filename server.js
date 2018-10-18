const express             = require('express');
const session             = require('express-session');
const chalk               = require('chalk');
const bodyParser          = require('body-parser');
const app                 = express();

const port                = 8080;

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routes
require('./app/routes')(app);

//server init
let server = app.listen(port, () => {
  console.log(chalk.yellow(`Server alive on port: ${port}\nServer PID: ${process.pid}\nUse "kill [pid]" to terminate server!`));
});

//exit code
process.on('SIGTERM', function () {
  server.close(() => {
    console.log(chalk.red('Server gracefully stopped!'));
  });
  setTimeout( function () {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
   }, 30*1000);
});
