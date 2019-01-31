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
        allowNull: false,
        validate: {
          is: /[^A-Za-z0-9]+/g,
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /[^A-Za-z0-9!?#$%@^&*_+-`~]+/g,
        }
    }
});

User.associate = function (models) {
  models.User.hasMany(models.History, {
    foreignKey: 'user_id',
    sourceKey: 'id'
  });
  models.User.belongsToMany(models.User, { as: 'Friends', through: 'friends' });
  models.User.belongsToMany(models.User, { as: 'Requestees', through: 'friendRequests', foreignKey: 'requesterId', onDelete: 'CASCADE'});
  models.User.belongsToMany(models.User, { as: 'Requesters', through: 'friendRequests', foreignKey: 'requesteeId', onDelete: 'CASCADE'});
};

User.prototype.validPassword = function (password) {
  if(password == this.password) return true;
  else return false;
};

return User;
};
