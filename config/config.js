module.exports = {
  "development": {
    "database": "chat",
    "username": "worker",
    "password": "1235",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "operatorsAliases": false,
    "logging": false
  },
  "test": {
    "database": "chat",
    "username": "worker",
    "password": "1235",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "database": "chat",
    "username": "worker",
    "password": "1235",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false
  }
};
