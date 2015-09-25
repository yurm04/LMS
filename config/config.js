// config.js ==========================

var config = {};

config.db = {};
config.web = {};

// web config
config.web.port = process.env.PORT || '8080';
config.web.ip = '127.0.0.1';

// db config credentials
config.db.name = 'lms';
config.db.url = 'mongodb://' + config.web.ip + '/' + config.db.name;

// export
module.exports = config;