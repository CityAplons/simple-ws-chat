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
    message: {
      field: "message",
      type: DataTypes.STRING(1500),
      allowNull: false,
      comment: "Message text"
    }
  },
  {
    timestamps: true,
    createdAt: sequelize.DATE,
    underscored: true,
    freezeTableName:true,
    tableName:'history',
  });

  History.associate = function (models) {
    models.History.belongsTo(models.Chats, {
      onDelete: "CASCADE",
      foreignKey:'chat_id',
      targetKey: 'id',
      foreignKeyConstraint:true
    });
    models.History.belongsTo(models.User, {
      foreignKey:'user_id',
      targetKey: 'id',
      foreignKeyConstraint:true
    });
  };

  return History;
};
