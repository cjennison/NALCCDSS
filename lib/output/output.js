var config = require('../config');
var fs     = require('fs');
var mkdirp = require('mkdirp');
var uuid   = require('node-uuid');
var util   = require('util');
var mongodb= require('mongodb');
var database	 = require("../../lib/database");


function requestGraph(stepID, cb){
	var configuration = '';
	
	//Find the run in the database
	database.getRun(stepID, function(run){
		var returned_run = run[0];
		console.log(returned_run)		
		var config_url = config.server.ModelsDir + "/config/" + returned_run.step + "/graph.json"
		console.log(config_url);
		
		fs.readFile(config_url, 'utf8' ,function(err, data){
					if(err) throw err;
					
					
					configuration = JSON.parse(data);
					console.log(configuration)
					
					
					for(var i=0;i<configuration.graphTypes.length;i++){
						for(var j=0;j<configuration.graphTypes[i].series.length;j++){
						configuration.graphTypes[i].series[j].directory = returned_run.user + "/" + returned_run.step + "/" + returned_run.stepID + "/";
						}
					}
					
					
					
					
					cb(configuration)
				})
		
	});
	
	
	
}


exports.requestGraph = requestGraph;