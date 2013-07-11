var http         = require('http'),
    express      = require('express'),
    routes       = require('./routes'),
    user_routes  = require('./routes/users'),
    mexec_routes = require('./routes/mexec'),
    basin_routes = require('./routes/basin_routes'),
    db_routes	 = require('./routes/database'),
    out_routes   = require('./routes/output'),
    notify       = require('./lib/notify'),
    reach        = require('./lib/reach'),
    models       = require('./lib/models'),
    database	 = require('./lib/database'),
    config       = require('./lib/config'),
    output		 = require('./lib/output'),
    mongodb		 = require('mongodb');

// Load the application configuration file:
//var streamsConfig = require('./streams.json');

// Display config file for debugging purposes:
console.log('Streams Configuration:');
console.log(config.server);

/*
var server = new mongodb.Server("127.0.0.1", 27017, {});
new mongodb.Db('users', server, {}).open(function(error, client){
	if(error) throw error;
	console.log("CONNECTED")
	var collection = new mongodb.Collection(client, 'users');
	
	/*
	collection.update({name:"arosner"}, {$set:{name:"bletcher"}}, {safe:true}, function(err){
		if(err) console.warn(err.message);
		else console.log("SUCCESS");
	});
	
	collection.find({"username":"testuser1"}, {limit:10}).toArray(function(err, docs){
		console.log(docs);
		var docStr = JSON.stringify(docs);
		
		//console.log(JSON.parse(JSON.stringify(docs)));
		var json = JSON.parse(docStr);
		console.log(json[0])
		
		//var runs = json[0].runs;
		//console.log(runs);
		//console.log(JSON.parse(docs));
	})
});

*/


var app = module.exports = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  console.log(__dirname);
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({ secret : 'streams' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(config.server.BasinsDir));
  app.use(express.static(config.server.UsersDir));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get ('/'          , routes.front);
app.get ('/login'     , routes.login);
app.post('/login-user', routes.login_user);
app.get ('/streams'   , routes.main);
app.get ('/about'   , routes.about);
app.get ('/documentation'   , routes.documentation);

// Routes for users:
app.get('/users/:username/runs', user_routes.getRuns);
app.post('/runs-database', routes.getRunDatabase);
app.post('/basin-test', routes.posttext); //TODO: REMOVE THIS
app.post('/addTreeToUser', user_routes.addTreeToUser);

//app.post('/user/getreefrompre',user_routes.getRunTree);
app.post('/users/script/runs',user_routes.getRunsOfAScript);
app.post('/users/script/run/result',user_routes.getRunResult);
//Routes for run Tree
app.post('/basin/user/gettreefrombasin',user_routes.getTreeFromBasin);

// Routes for mexec:
app.post('/execute-step', mexec_routes.startExecution);

app.post('/mexec', mexec_routes.exec);
app.post('/mexec/status', mexec_routes.check);
app.post('/get-run-parents', mexec_routes.getRunParents);
app.post('/get-run-children', mexec_routes.getRunChildren);

// Routes for basin:
app.get('/basin/predef'   , basin_routes.preDefinedBasins);
app.get('/basin/info/:id' , basin_routes.basinInfo);
app.get('/basin/user/list', basin_routes.userBasinList);
app.post('/basin/user/delineate', basin_routes.delineateBasin);
app.post('/basin/user/set-alias', basin_routes.addBasin_IDAlias);

//Routes for database
app.get('/database/open', db_routes.openDatabase);
app.get('/database', db_routes.getDatabase);
app.post('/database/get-update', db_routes.getUpdate);
app.get('/database/user', db_routes.checkUser);
app.post('/database/user-time', db_routes.updateUserTime);
app.post('/database/get-missed-runs', db_routes.getMissedRuns);
app.get('/database/all-runs', db_routes.getAllRuns);
//Routes for run Tree
//app.post('/basin/user/gettreefrombasin',user_routes.getTreeFromBasin);

//Graph Outputs
app.post('/output/request-graph', out_routes.requestGraph);

// Create the HTTP server:
var server = http.createServer(app);

server.listen(config.server.port);
console.log("Express server listening on port %d in %s mode",
            config.server.port, app.settings.env);

notify.listen(server);
models.setStandby();
database.openDatabase();
