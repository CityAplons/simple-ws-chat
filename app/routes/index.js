const chatRoutes = require('./chat_routes');
module.exports = function(app) {
  chatRoutes(app);
};
