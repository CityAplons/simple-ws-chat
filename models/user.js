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
          isUser: function ( value ) {
            if ( !/[A-Za-z0-9]+/g.test(value) ) {
              throw new Error('Username validation error!')
            }
          },
          notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isPassword: function ( value ) {
            if ( !/[A-Za-z0-9!?#$%@^&*_+-`~]+/g.test(value) ) {
              throw new Error('Password validation error!')
            }
          },
          notEmpty: true
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
