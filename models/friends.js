"use strict";

module.exports = function(sequelize, DataTypes) {
  let Friends = sequelize.define('friends', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  });

  return Friends;
};
