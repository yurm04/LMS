var Message = require('../models/Message');

// check to make sure all
var isValid = function(data) {
  if ( !data.toId || !data.fromId || !data.message ) {};
}

module.exports.getMessages = function(req, res) {
  var id = req.params.uid;

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

module.exports.getAllMessages = function(err, res) {
  Message.find( function(err, messages) {
    if (err)
      return res.json({ type : false, data : err });
    if (messages.length === 0 )
      return res.json({ type : false, data : 'No Messages' });

    res.json({
      type : true,
      data : messages
    })
  });
}

module.exports.postMessage = function(req, res) {
  var data = req.body.data;
  var message = new Message({
    toName : data.toName,
    fromName : data.fromName,
    message : data.message
  });

  message.save(function(err) {
    if (err)
      return res.json({ type : false, data : err });

    res.json({
      type : true,
      data : message
    });
  });

}