var users = require('../lib/users');
var fs     = require('fs');
var output = require('../lib/output');


exports.requestGraph = function(req, res){
	var username = req.session.user.name,
		stepID   = req.body.stepID;
		
	console.log("REQUESTING GRAPH")
		
	output.requestGraph(stepID, function(result){
		res.json({config:result});
	});
}
