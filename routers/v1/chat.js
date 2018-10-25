const express = require('express');

const router = express.Router();

router.post('/create_chat',  function (req, res, next) {
  return next();
});

router.ws('/chat', function(ws, req) {
  ws.on('connection', function() {
    ws.send(`Hello ${user}`);
  });

  ws.on('message', function(msg) {
    ws.send(msg);
  });

});
module.exports = router;
