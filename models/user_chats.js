"use strict";

module.exports = function(sequelize, DataTypes) {
  let UserChats = sequelize.define('UserChats', {
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chat_id: {
      type: DataTypes.INTEGER,
      unique: 'chats_user'
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: 'chats_user',
      references: null
    }
  });

  UserChats.associate = function (models) {
    models.UserChats.hasMany(models.Chats, {
      foreignKey: 'chat_id',
      targetKey: 'id'
    });
    models.UserChats.hasMany(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });
  };


  return UserChats;
};
