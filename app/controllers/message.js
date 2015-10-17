var Message = require('../models/Message'),
    Log = require('../models/Log');

// check to make sure all
var isValid = function(data) {
  if ( !data.toId || !data.fromId || !data.message ) {}
};

module.exports.getMessages = function(req, res) {
  var id = req.params.uid;
  console.log(id);
  Message.find({ 'toId' :  id }, function(err, messages) {
    if (err)
      return res.json({ type : false, data : err });
    if (messages.length === 0 )
      return res.json({ type : false, data : 'No Messages' });

    res.json({
      type : true,
      data : messages
    });
  });
};

module.exports.getAllMessages = function(req, res) {
  Message.find( function(err, messages) {
    if (err)
      return res.json({ type : false, data : err });
    if (messages.length === 0 )
      return res.json({ type : false, data : 'No Messages' });

    res.json({
      type : true,
      data : messages
    });
  });
};

module.exports.postMessage = function(req, res) {
  var data = req.body.data;
  var message = new Message({
    toName : data.toName,
    fromName : data.fromName,
    message : data.message,
    toId : data.toId,
    fromId : data.fromId
  });

  message.save(function(err) {
    if (err)
      return res.json({ type : false, data : err });

    // log message sent
    var log = new Log({
      title : 'Message created',
      description : 'Message sent from ' + message.fromName + ' to ' + message.toName
    });

    log.save( function(err) {
      if (err)
        console.log('Could not log new message');
    });

    res.json({
      type : true,
      data : message
    });
  });
};