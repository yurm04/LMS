var Log = require('../models/Log');

module.exports.getLogs = function(req, res) {
  Log.find( function(err, logs) {
    if (err)
      return res.json({ type : false, data : err });
    if (logs.length === 0)
      return res.json({ type : false, data : 'No logs found' });

    res.json({
      type : true,
      data :logs
    });
  });
};

module.exports.getCourseLogs = function(req, res) {
  var id = req.params.id;

  Log.find({ courseId : id }, function(err, logs){
    if (err)
      return res.json({ type : false, data : err });

    if (logs.length === 0)
      return res.json({ type : false, data : 'No logse found' });

    res.json({
      type : true,
      data : logs
    });
  });

};