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
    //Send message to db;
    db.History.create({
       message: msg,
       chat_id: req.params.socket_id,
       user_id: req.session.user.id
     }, {
       include: [ db.Chats ],
       include: [ db.User ]
     });
  });

  //Clear chatroom on client disconnect
  w.on('close', function close() {
    let index = room.clients.indexOf(w);
    if (index > -1) room.clients.splice(index, 1);
    if (chatrooms[id].clients.length == 0)  {
      delete chatrooms[id];
    }
  });

});

db.History.addHook('afterCreate', 'pushHistory', ( message, options ) => {
  //Get nested user
  db.User.findOne({
    where: {
      "id": message.user_id
    },
    attributes: ['id', 'username']
  }).then( response => {
    //Set answer
    let ans = {
      id: message.id,
      created_at: message.created_at,
      message: message.message,
      username: response.username,
      user_id: response.id
    }
    //Send message to user in chats
    if(chatrooms[message.chat_id]){
      chatrooms[message.chat_id].clients.forEach(function (client) {
          client.send(JSON.stringify(ans));
      });
    }
  })
});

module.exports = router;
