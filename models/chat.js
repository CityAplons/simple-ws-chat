"use strict";

module.exports = function(sequelize, DataTypes) {
  let Chats = sequelize.define("Chats", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary and auto incremented key of the table"
    },
    name: {
      field: "chat_name",
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Chat Name"
    }
  }, {
    underscored: true,
    freezeTableName:true,
    tableName:'chats',
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Chats.hasMany(models.history);
      }
    },
    instanceMethods: {
      //
    }
  });

  return Chats;
};
