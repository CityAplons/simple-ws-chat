"use strict";

module.exports = function(sequelize, DataTypes) {
let User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary and auto incremented key of the table"
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

User.prototype.validPassword = function (password) {
  if(password == this.password) return true;
  else return false;
};

return User;
};
