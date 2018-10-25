"use strict";

module.exports = function(sequelize, DataTypes) {
  var History = sequelize.define('History', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary and auto incremented key of the table"
    },
    username: {
      field: "user",
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Sender"
    },
    message: {
      field: "message",
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Message text"
    }
  },
  {
    timestamps: true,
    underscored: true,
    freezeTableName:true,
    tableName:'history',
    classMethods:{
      associate:function(models){
        History.belongsTo(models.Chats, { foreignKey:'chat_id', foreignKeyConstraint:true} );
      }
    }
  });

  return History;
};
