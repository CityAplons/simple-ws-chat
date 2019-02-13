let express = require('express');
let ws = require('express-ws');
let router = express.Router();
let db = require("../models");

/*
  _getChatList
  _createChat
  _renameChat
  _removeChat
  _inviteChat
  _leaveChat
  _getUsers
  _loadMessages

  WS:
  +sendMessage
  +recieveMessage
*/

router.param('id', function (req, res, next, id) {
  db.Chats.findByPk(id)
    .then(chat => {
      if (!chat) res.sendStatus(404);
      else {
        if(req.session.user && req.cookies.SSID){
          req.chat = chat;
          next();
        } else res.sendStatus(404);
      }
    })
    .catch(next);
});

router.param('user_id', function (req, res, next, id) {
  db.User.findByPk(id)
    .then(user => {
      if (!user) res.sendStatus(404);
      else {
        if(req.session.user && req.cookies.SSID){
          req.user = user;
          next();
        } else res.sendStatus(404);
      }
    })
    .catch(next);
});

router.get('/:user_id/chat/', function (req, res) {
  req.user.getChats({
    attributes: ['id', 'name']
  }).then(result => res.status(200).send(result));
});

router.get('/chat/:id/getUsers', function (req, res) {
  req.chat.getUsers({
    attributes: ['id', 'username']
  }).then(result => res.status(200).send(result));
});

router.post('/:user_id/chat/createChat', function(req, res, next) {
  if (req.body.chatName != "" && req.session.user.id) {
    db.Chats.create({
         name: req.body.chatName
     })
     .then(chat => {
         console.log(`New chat ${req.body.chatName} created by ${req.user.id}!`);
         chat.addUser(req.user.id).then(result => res.status(200).send(result));
         db.History.create({
            message: `${req.user.username} created the "${req.body.chatName}" chat.`,
            chat_id: chat.id,
            user_id: req.user.id
          }, {
            include: [ db.Chats ],
            include: [ db.User ]
          })
     })
     .catch(error => {
         console.log(error);
     })
  }
});

router.put('/:user_id/chat/:id/renameChat', function(req, res, next) {
  if( req.body.name != "" ) {
    req.chat.update({
      name: req.body.name
    }).then(() => res.sendStatus(200));
  } else {
    res.sendStatus(500);
  }
});

router.put('/:user_id/chat/:id/removeChat', function(req, res, next) {
  db.History.destroy(
    {where:
      {
        "chat_id": req.chat.id
      }
    })
    .then( () => {
      db.Chats.destroy(
        {where:
          {
            "id": req.chat.id
          }
        })
    })
    .then(result => res.sendStatus(200))
});

router.put('/:user_id/chat/:id/inviteChat', function(req, res, next) {
  db.User.findOne({ where: { id: req.body.user_id } }).then(user => {
    req.chat.addUser( user.id )
    .then(chat => {
        db.History.create({
           message: `${req.user.username} invited ${user.username} to the chat. Welcome!`,
           chat_id: req.chat.id,
           user_id: req.user.id
         }, {
           include: [ db.Chats ],
           include: [ db.User ]
         })
    })
    .then(() => res.sendStatus(200));
  });
});

router.put('/:user_id/chat/:id/leaveChat', function(req, res, next) {
  req.chat.removeUser(req.user.id)
  .then(chat => {
      db.History.create({
         message: `${req.user.username} left the chat.`,
         chat_id: req.chat.id,
         user_id: req.user.id
       }, {
         include: [ db.Chats ],
         include: [ db.User ]
       })
  })
  .then(() => res.sendStatus(200));
});

router.post('/:user_id/chat/:id/loadMessages', function(req, res, next) {
  req.chat.getHistories({
    include: [{
      model: db.User,
      attributes: ['id', 'username']
    }]
  })
  .then( result => res.status(200).send(result));
});

module.exports = router;
