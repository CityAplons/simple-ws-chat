let express = require('express');
const ws = require('express-ws')
let router = express.Router();
let db = require("../models");
/*
  WS:
    +sendMessage
    +recieveMessage
*/

//WebSocket id
router.param('socket_id', function (req, res, next, id) {
  db.Chats.findByPk(id)
    .then(chat => {
      if (!chat) res.sendStatus(404);
      else {
        if(req.session.user && req.cookies.SSID){
          next();
        } else res.sendStatus(404);
      }
    })
    .catch(next);
});

//Array that contains chat ids with websockets instances
let chatrooms = {};

//webSocket
router.ws('/echo/:socket_id', function(w, req) {

  //Set chatroom
  let id = req.params.socket_id;
  let room = chatrooms[id] || {
    clients: []
  };
  room.clients.push(w);
  chatrooms[id] = room;

  w.on('message', function (msg) {
    db.History.create({
       message: msg,
       chat_id: id,
       user_id: req.session.user.id
     }, {
       include: [ db.Chats ],
       include: [ db.User ]
     }).then( response => {
       let ans = {
         id: response.id,
         created_at: response.created_at,
         message: response.message,
         username: req.session.user.username,
         user_id: response.user_id
       }
       room.clients.forEach(function (client) {
           client.send(JSON.stringify(ans));
       });
     })
  });

  //Clear chatroom on client disconnect
  w.on('close', function close() {
    const index = room.clients.indexOf(w);
    if (index > -1) room.clients.splice(index, 1);
    if (chatrooms[id].clients.length == 0)  {
      delete chatrooms[id];
    }
  });

});

module.exports = router;
