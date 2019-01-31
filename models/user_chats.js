"use strict";

module.exports = function(sequelize, DataTypes) {
  let UserChats = sequelize.define('user_chats', {

  });

  UserChats.associate = function (models) {
    models.User.belongsToMany(models.Chats, { through: UserChats });
    models.Chats.belongsToMany(models.User, { through: UserChats });
  };

  return UserChats;
};
