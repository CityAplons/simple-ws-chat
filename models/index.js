"use strict";

let fs = require("fs");
const chalk = require('chalk');
let path = require("path");
let Sequelize = require("sequelize");
let env = process.env.NODE_ENV || "development";
let config = require(__dirname + '/../config/config.js')[env];
let db = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    let model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.sync()
//sequelize.sync({force:true})
    .then(() => console.log(chalk.yellow('Database was initializated successfully...')))
    .catch(error => console.log(chalk.red('This error occured while db init:', error)));

module.exports = db;
