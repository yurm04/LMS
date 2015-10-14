var mongoose = require('mongoose'),
    User = require('../models/Message'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
  toId : mongoose.Schema.Types.ObjectId,
  fromId : mongoose.Schema.Types.ObjectId,
  toName : {type : String},
  fromName : {type : String},
  message : { type : String, required : true }
});

module.exports = mongoose.model('Message', messageSchema);