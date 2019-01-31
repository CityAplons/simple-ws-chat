let express = require('express');
let router = express.Router();
const db = require("../models");

router.param('id', function (req, res, next, id) {
  console.log('Set router.param for :userId');
  db.User.findByPk(id)
    .then(user => {
      if (!user) res.sendStatus(404);
      else {
        //if(req.session.user && req.cookies.SSID && req.session.user.username == user.username){
          req.user = user;
          next();
        //} else res.sendStatus(404);
      }
    })
    .catch(next);
});

router.get('/user/:id', function (req, res) {
  console.log("Get user by id");
  res.json({username:req.user.username});
});

router.put('/user/:id/friendRequest', function(req, res, next) {
  if (req.body.requesteeId != req.user.id) {
    console.log('Send friend request');
    req.user.addRequestees(req.body.requesteeId)
      .then(result => res.status(201).send(result))
      .catch(next);
  } else {
    res.status(400).send('Cannot friend yourself');
  }
});

router.put('/user/:id/cancelFriendRequest', function(req, res, next) {
  db.friendRequests.destroy(
    {where:
      {
        "requesteeId": req.body.requesteeId,
        "requesterId": req.user.id
      }
    }).then(result => res.sendStatus(200))
});

router.put('/user/:id/acceptFriendRequest', function(req, res, next) {
  if (req.body.requesterId != req.user.id) {
    console.log(`${req.user.username} accepted new friend`);
    req.user.addFriends(req.body.requesterId)
      .then(result => res.status(201).send(result))
      .then(db.User.findByPk(req.body.requesterId).then( user => {
        user.addFriends(req.user.id);
      }))
      .then( function() {
        db.friendRequests.destroy(
          {where:
            {
              "requesteeId": req.user.id,
              "requesterId": req.body.requesterId
            }
          });
      })
    .catch(next);
  }
});

router.get('/user/:id/friends', function(req, res, next) {
  req.user.getFriends({
    attributes: ['id', 'username', 'createdAt']
  }).then(result => res.status(200).send(result));
});

router.put('/user/:id/unfriend', function(req, res, next) {
  if (req.body.friendId != "") {
    console.log(`${req.user.username} deleted a friend`);
    req.user.removeFriends(req.body.friendId)
    .then(db.User.findByPk(req.body.friendId).then( user => {
      user.removeFriends(req.user.id);
    }))
    .then(result => res.sendStatus(200))
    .catch(next);
  }
});

router.get('/user/:id/friendRequestReceived', function(req, res, next) {
  req.user.getRequesters({
    attributes: ['id', 'username', 'createdAt']
  }).then(result => res.status(200).send(result));
});

router.get('/user/:id/friendRequestSent', function(req, res, next) {
  req.user.getRequestees({
    attributes: ['id', 'username', 'createdAt']
  }).then(result => res.status(200).send(result));
});

module.exports = router;
