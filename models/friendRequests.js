"use strict";

module.exports = function(sequelize, DataTypes) {
  let friendRequests = sequelize.define('friendRequests', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  })

  return friendRequests;
};
