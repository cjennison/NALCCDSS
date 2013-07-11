Streams.app_control.apps.environmental_models = {
  name : 'Environmental and Streamflow Models',
  order: 3,
  previousRunData: [],
  existingRunId: null,
  existingStepId: null,
  exists: false,
  parsed:false,

  getRuns: function(){
		var runs = $.post('/users/script/runs', {'scriptname': "flow", 'basin_id':Streams.app_control.apps.basin.basinId}).done(function(){
			var parse = Output.runInformation.parseResponse(runs.responseText);
				Streams.app_control.apps.environmental_models.populateRunList(parse);
				
				return runs;
		});
		
		return null;
	},

	populateRunList:function(rundata){
		$("#environmental-models-app .runTypeSelect .selectRun option[value!='Select a Completed Run']").each(function(){
			$(this).remove();
		})
		var selectorList = $("#environmental-models-app .runTypeSelect .selectRun");
		if(selectorList.length == 0){
			var option = $("<option disabled='true'>No Existing Runs Found</option>")
		}
		console.log("WHAT")
		var arr = rundata;
					var results = [];
					var idsSeen = {}, idSeenValue = {};
					for (var i = 0, len = arr.length, id; i < len; ++i) {
					    id = arr[i].stepID;
					    if (idsSeen[id] !== idSeenValue) {
					        results.push(arr[i]);
					        idsSeen[id] = idSeenValue;
					    }
					}
										
					rundata = results;

		for(var i = 0;i < rundata.length;i++){
			var settings = "http://" + document.location.host + '/' + rundata[i];
			$.getJSON(settings, function(data){
				console.log(data);
				if(data.basin_id == Streams.app_control.apps.basin.basinId){
					var option = $("<option runId=" + data.runID + " stepId=" + data.stepID + " basin_id=" + data.basin_id + " scriptName=" + data.scriptName + ">" + data.alias + "</option>")
					$(option).rundata = data;
					$(selectorList).append(option);
				}
			})
		}

		Streams.app_control.apps.environmental_models.previousRunData = rundata;
		selectorList.change(function(){
			if($("#environmental-models-app .runTypeSelect .selectRun option:selected").html() == "Create New Run"){
				Streams.app_control.apps.environmental_models.exists = false;
				Streams.app_control.apps.environmental_models.enableInputs();
			} else {
				Streams.app_control.apps.environmental_models.editSettings($("#environmental-models-app .runTypeSelect .selectRun option:selected"));
			}
		});


	},

	editSettings:function(options,jquery){
		var data;
		var pre_thumblist = [];
		console.log(options);
		Streams.app_control.apps.environmental_models.exists = true;
		if(jquery == false){
			data = options;
			
			Streams.app_control.apps.environmental_models.existingRunId = data.runID;
			Streams.app_control.apps.environmental_models.existingStepId = data.stepID;
			
			var selectorList = $("#environmental-models-app .runTypeSelect .selectRun");
			$(selectorList).val(data.alias);
			//$(selectorList).selectmenu('refresh');
		} else {
			data = $(options).getAttributes();
			console.log("--------------------------------")
			console.log(data);
			pre_thumblist.push({
					
						url:Streams.user + "/flow/" + data.stepid + "/"
					})
			Streams.app_control.apps.environmental_models.existingRunId = data.runid;
			Streams.app_control.apps.environmental_models.existingStepId = data.stepid;
		}

		var model = $('div#environmental-models-app.application .styledSelect select');

	  	/**
	  	 * STAGE ONE
	  	 * Change Script Name and Window
	  	 */
	  	$(model).val(data.scriptname);

	  	var appContent = $('div#environmental-models-app.application .app_content .app');
		for(var i=0;i<appContent.length;i++){
			if($(appContent[i]).hasClass("active")){
				$(appContent[i]).removeClass("active")
			}
		}

		$('div#environmental-models-app.application ' + '#' + $(model).val()).addClass("active")


	  	/**
	  	 * STAGE TWO
	  	 * Change Script Values
	  	 */
	  	//$("div#environmental-models-app.application .app_content #emissions select").val(data.scenario);
		
		console.log("SETTING DATA: " + data.runid)
	 	if(jquery == undefined){
	 		console.log(data.stepid)
		  	var previousRunSetter = $.post('/get-run-parents', {stepId: data.stepid, step:"flow"}).done(function(){
		  		console.log(previousRunSetter);
		  		var data = JSON.parse(previousRunSetter.responseText);
		  		console.log(data);
		  		
		  		Streams.app_control.apps.weather_models.editSettings(data.message[1], false);
		  		Streams.app_control.apps.land_use_models.editSettings(data.message[0], false);
				for(var i = 0;i < data.message.length;i++){
					var item = data.message[i];
					pre_thumblist.push({
						url:item.user + "/" + item.step + "/" + item.stepID + "/"
					})
				}
				
				
				Streams.app_control.addThumbnail(pre_thumblist.reverse());
		  	})
		  	var dependantRunSetter = $.post('/get-run-children', {stepId:data.stepid, step:"flow"}).done(function(){
		  			console.log(dependantRunSetter);
		  			var data = JSON.parse(dependantRunSetter.responseText);
		  			console.log(data);
		  			Streams.app_control.apps.stream_flow_models.populateRunList(data.streamtemp);
		  			Streams.app_control.apps.fish_models.populateRunList(data.population);
	
		  		})
		  }

	  	//DISABLE INPUTS
  		Streams.app_control.apps.environmental_models.disableInputs();

	},
	
	refreshInput:function(){
		var selectorList = $("#environmental-models-app .runTypeSelect .selectRun");
		$(selectorList).val("Create New Run");
		Streams.app_control.apps.environmental_models.exists = false;
		Streams.app_control.apps.environmental_models.enableInputs();
	},

	disableInputs:function(){
	  	var model = $('div#environmental-models-app.application .styledSelect select');

	  	var view              = $('#environmental-models-app');
	  	var runButton         = view.find('#run');

	   	runButton.button('option', 'disabled', true);

	  	var inputs = $('#environmental-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', true);
	  	}

	  	$(model).prop("disabled", true)
	  	
	  	var runInputs = $('#environmental-models-app .runModel');
		$(runInputs).css('display', 'none');
	  },

	  enableInputs:function(){
	  	var model = $('div#environmental-models-app.application .styledSelect select');

	  	var view              = $('#environmental-models-app');
	  	var runButton         = view.find('#run');

	   	runButton.button('option', 'disabled', false);

	  	var inputs = $('#environmental-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', false);
	  	}

	  	$(model).prop("disabled", false);
	  	var runInputs = $('#environmental-models-app .runModel');
		$(runInputs).css('display', 'block');
		Streams.app_control.apps.stream_flow_models.refreshInput();
	  	Streams.app_control.apps.fish_models.refreshInput();
	  	Streams.app_control.apps.environmental_models.existingStepId = null;
		
	  },

  init : function () {
    //// Initialize View ////

   var view = $('#environmental-models-app');
   console.log(view);
   $(view).addClass("application");
var createnew				  = view.find('.createnew');
createnew.button();

$(createnew).bind('click', function(){
	Streams.app_control.apps.environmental_models.exists = false;
				Streams.app_control.apps.environmental_models.enableInputs();
})
       /*
       var runData = Streams.app_control.apps.environmental_models.getRuns();

    var runInterval = setInterval(function(){

    	if(runData != null){
    		clearInterval(runInterval);
    		console.log(runData)
    	}
    }, 1000)
    */
     var that = this;
    var runbutton = view.find('#run');

    runbutton.button();

    $(runbutton).bind('click', function(){
    	that.run();
    	return false;
    });


    this.view = view;

// var view = $('<div id="environmental-models-app">');
  //  view.html('environmental models app.');

  },


  run : function () {


  	var model = $('div#environment-models-app.application .styledSelect select');

  	//Passed Variables
  	var scriptName = $(model).val();

	//Get Basin ID and ALIAS
  	var basin_id = Streams.app_control.apps.basin.basin.id;
  	var run_alias = $('div#environment-models-app.application .runModel .runInput').val();
	var existing_run_id = Streams.app_control.apps.environmental_models.existingRunId;
  	var existing_step_id = Streams.app_control.apps.environmental_models.existingStepId;
  	var exists = Streams.app_control.apps.environmental_models.exists;
  	//if Basin Alias is null, create a name for them
  	if(run_alias == "" || run_alias == " Enter a run name" || run_alias == undefined){
  		run_alias = Math.ceil(Math.random()*100000);
  	}
var prec_ClimateInformation = Streams.app_control.apps.weather_models.getClimateInformation();
  	var prec_LandInformation = Streams.app_control.apps.land_use_models.getLandInformation();

  	//Create sending Object
  	var flow = {	flag:true,
  					scriptName:"abcde_regionalization",
  					basin_id:basin_id,
  					run_alias:run_alias,
  					preceding: {
						climate_dir:"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
						land_dir:"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",
		
					},
  					existing_run_id:existing_run_id,
  					existing_step_id:existing_step_id,
  					exists:exists};

 	console.log(flow.run_alias)
 	
  	console.log(prec_ClimateInformation);

	var serverResponse = $.post('/execute-step', {"webInfo": {
		"climate": {
			"step": "climate",
			"flag": prec_ClimateInformation.flag,
			"alias": prec_ClimateInformation.run_alias,
			"scriptName": prec_ClimateInformation.scriptName,
			"basin_id": prec_ClimateInformation.basin_id,
			"preceding": {
				"climate_dir":"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
				"land_dir":"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",

			},
			"precip_mean_y1": prec_ClimateInformation.precip_mean_y1,
			"precip_mean_yn": prec_ClimateInformation.precip_mean_yn,
			"precip_var_y1": prec_ClimateInformation.precip_var_y1,
			"precip_var_yn": prec_ClimateInformation.precip_var_yn,
			"temp_mean_y1": prec_ClimateInformation.temp_mean_y1,
			"temp_mean_yn": prec_ClimateInformation.temp_mean_yn,
			"n_years": prec_ClimateInformation.n_years,
			"existing_run_id":prec_ClimateInformation.existing_run_id,
			"existing_step_id":prec_ClimateInformation.existing_step_id,
			"exists":prec_ClimateInformation.exists,

			"wet_threshold":0
		},

		"land": {
			"step": "land",
			"scriptName":prec_LandInformation.scriptName,
			"scenario":prec_LandInformation.scenario,
			"alias":prec_LandInformation.run_alias,
			"preceding": {
				"climate_dir":"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
				"land_dir":"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",

			},
			"existing_run_id":prec_LandInformation.existing_run_id,
			"existing_step_id":prec_LandInformation.existing_step_id,
			"exists":prec_LandInformation.exists,
		},

		"flow": {
			"step": "flow",
			"scriptName":"abcde_regionalization",
			"preceding": {
				"climate_dir":"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
				"land_dir":"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",

			},
			"alias":flow.run_alias,
			"existing_run_id":flow.existing_run_id,
			"existing_step_id":flow.existing_step_id,
			"exists":exists,
		}

		}});

		Status.addQueue(flow);

		console.log(flow);
		var checkRespo = setTimeout(function(){
			if(serverResponse.readyState == 4){
				console.log(serverResponse)
				clearInterval(checkRespo);
				var output = Output.runInformation.parseResponse(serverResponse.responseText);
				console.log(output)
				
				var runStatus = $.post('/mexec/status', {"runID":output.stepID}).done(function(data) { 
					console.log(data) 
					console.log(runStatus);
					
				    runStatus.runID = output.stepID;
					runStatus.alias = output.alias;
					runStatus.canExec = true;
					Status.runningProcesses.push(runStatus);
					console.log("Pushing Stuff")
					var selectorList = $("#environment-models-app .runTypeSelect .selectRun");
					var option = $("<option runId=" + output.runID + " stepId=" + output.stepID + " basin_id=" + flow.basin_id + " scriptName=" + flow.scriptName + ">" + flow.run_alias + "</option>")
					$(option).rundata = flow;
					$(selectorList).append(option);
					console.log(option);
					Streams.app_control.apps.environmental_models.existingStepId = output.stepID;
				});
				/*
				Streams.app_control.addThumbnail(output[0].runID);
				Streams.app_control.apps.weather_models.getResults(output);
				Status.clearQueueObject(output[0].alias);
				*/

			}
		},1000)

  	  		Streams.app_control.apps.environmental_models.disableInputs();


  	console.log("RUNNING FLOW MODEL")
  	enableButton("inputButton");
  	enableButton("outputButton");
  	enableButton("graphButton");
  	
  	
  },

   getFlowInformation:function(){
  	var model = $('div#environment-models-app.application .styledSelect select');

  	//Passed Variables
  	var scriptName = $(model).val();

	//Get Basin ID and ALIAS
  	var basin_id = Streams.app_control.apps.basin.basin.id;
  	var run_alias = $('div#environment-models-app.application .runModel .runInput').val();
	
	var existing_run_id = Streams.app_control.apps.environmental_models.existingRunId;
  	var existing_step_id = Streams.app_control.apps.environmental_models.existingStepId;
  	var exists = Streams.app_control.apps.environmental_models.exists;
  	//if Basin Alias is null, create a name for them
  	if(run_alias == "" || run_alias == " Enter a run name"){
  		run_alias = Math.ceil(Math.random()*100000);
  	}

  	//Create sending Object
  	var flow = {	flag:true,
  					scriptName:"abcde_regionalization",
  					basin_id:basin_id,
  					run_alias:run_alias,
  					existing_run_id:existing_run_id,
  					existing_step_id:existing_step_id,
  					exists:exists};
  	return flow;
  	}
  }
