// assignment.js ======================
var Assignment = require('../models/Assignment');

var isValid = function(assignment) {
  if (!assignment.title || !assignment.descriptions || !assignment.courseId)
    return false;

  return true;
};

module.exports.postAssignment = function(req, res) {
  console.log(req);
  var assignment = {
    title : req.body.title,
    descriptions : req.body.descriptions,
    courseId : req.body.courseId
  };
  if (!isValid())
    return res.json({ type : false, data : 'Missing required Fields' });

  if (req.files) {
    console.log(res.files);
  }

};

module.exports.getAssignments = function(req, res) {
  Assignment.find( function(err, foundAssignments) {
    if (err)
      return res.json({ type : false, data : err });
    if (foundAssignments.length === 0)
      return res.json({ type : false, data : 'No Assignments Found' });

    res.json({
      type : true,
      data : false
    });
  });
};