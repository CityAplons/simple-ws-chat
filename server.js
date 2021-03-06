"use strict";

const chalk = require('chalk');
let fs = require("fs");

//express init
const app = require('express')();
const ws = require('express-ws')(app);
const session = require('express-session');
const serveStatic = require('serve-static');

app.set('port', process.env.PORT || 8080);

//db init
const db = require("./models");
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

//Middleware
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(serveStatic(`${__dirname}/views`));

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'SSID',
    secret: 'secretWordMaybe',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: ( 1000*3600*24*7 )
    }
}));

// this middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// this usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.SSID && !req.session.user) {
        res.clearCookie('SSID');
    }
    next();
});

app.post("/checkUser", (req, res) => {
  res.set('Content-Type', 'text/html');
  if(req.session.user && req.cookies.SSID){
    res.json({username: req.session.user.username, id: req.session.user.id });
  } else {
    res.send(null);
  }
});

// middleware function to check for logged-in users
let sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.SSID) {
        res.redirect('/chat');
    } else {
        next();
    }
};

// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/views/index.html');
    })
    .post((req, res) => {
       db.User.create({
            username: req.body.username,
            password: req.body.password
        })
        .then(user => {
            console.log(chalk.green(`New user ${req.body.username} online!`));
            req.session.user = user.dataValues;
            res.redirect('/chat');
        })
        .catch(error => {
            res.redirect(`/signup#${error.message}`);
        });
    });


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/views/index.html');
    })
    .post((req, res) => {
        let username = req.body.username,
            password = req.body.password;

        db.User.findOne({ where: { username: username } })
        .then(function (user) {
            if (!user) {
                res.redirect('/login#Wrong username or password');
            } else if (!user.validPassword(password)) {
                res.redirect('/login#Wrong username or password');
            } else {
                console.log(chalk.green(`User ${username} logged in!`));
                req.session.user = user.dataValues;
                res.redirect('/chat');
            }
        });
    });


// route for user's mainscreen
app.get('/chat', (req, res) => {
    if (req.session.user && req.cookies.SSID) {
        res.sendFile(__dirname + '/views/chat.html');
    } else {
        res.redirect('/login');
    }
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.SSID) {
        res.clearCookie('SSID');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

//User router
const user = require('./v1/user');
app.use('/v1/', user);

//Chat router
const chat = require('./v1/chat');
app.use('/v1/', chat);

//WS router
const webSocket = require('./v1/websocket');
app.use('/v1/', webSocket);

//server init
app.listen(app.get('port'), () => {
  console.log(chalk.yellow(`Server alive on port: ${app.get('port')}\nServer PID: ${process.pid}\nUse "kill [pid]" to terminate server!`));
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
