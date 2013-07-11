Streams.app_control.apps.fish_models = {
  name : 'Fish Population Models',
  order: 5,
  previousRunData: [],
  existingRunId: null,
	  existingStepId: null,
	  exists: false,
  
  getRuns: function(){
		var runs = $.post('/users/script/runs', {'scriptname': "population", 'basin_id':Streams.app_control.apps.basin.basinId});
		var check = setInterval(function(){
			//console.log(runs);
			if(runs.readyState == 4){
				clearInterval(check);
				var parse = Output.runInformation.parseResponse(runs.responseText);
				Streams.app_control.apps.fish_models.populateRunList(parse);
				return runs;
				
			}
		}, 2000)
		return null;
	},
	
	populateRunList:function(rundata){
		$("#fish-models-app .runTypeSelect .selectRun option[value!='Select a Completed Run']").each(function(){
			$(this).remove();
		})
		var selectorList = $("#fish-models-app .runTypeSelect .selectRun");
		for(var i = 0;i < rundata.length;i++){
			var settings = "http://" + document.location.host + '/' + rundata[i];
			$.getJSON(settings, function(data){
				if(data.basin_id == Streams.app_control.apps.basin.basinId){
				var option = $("<option runId="+ data.runID + " stepId=" + data.stepID  + ">" + data.alias + "</option>")
				$(option).rundata = data;				
				$(selectorList).append(option);
				}
			})
		}
		
		Streams.app_control.apps.fish_models.previousRunData = rundata;
		
		selectorList.change(function(){
			if($("#weather-models-app .runTypeSelect .selectRun option:selected").html() == "Create New Run"){
				Streams.app_control.apps.fish_models.exists = false;
				Streams.app_control.apps.fish_models.enableInputs();
			} else {
				Streams.app_control.apps.fish_models.disableInputs();
				//Streams.app_control.apps.weather_models.editSettings($("#weather-models-app .runTypeSelect .selectRun option:selected"));
			}
		});
	},

	refreshInput:function(){
		var selectorList = $("#fish-models-app .runTypeSelect .selectRun");
		$(selectorList).val("Create New Run");
		Streams.app_control.apps.fish_models.exists = false;
		Streams.app_control.apps.fish_models.enableInputs();
	},
  
  disableInputs:function(){
	  	var model = $('div#fish-models-app.application .styledSelect select');
	
	  	var view              = $('#fish-models-app');
	  	var runButton         = view.find('#run');
	
	   	runButton.button('option', 'disabled', true);
	
	  	var inputs = $('#fish-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', true);
	  	}
	  	
	  	$(model).prop("disabled", true)
	  	
	  	
	    //var stockingslider1 = view.find('.stockingslider1');
	   // var stockingNumber = view.find('.stockingNumber');
	    var countslider1 = view.find('.countslider1');
	    var countNumber = view.find('.countNumber');
		  	countslider1.slider({
	      		max    : 100,
		        min     : 0,
		        range   : 'min',
		        value   : 50,
		        animate : 'fast',
	     		 disabled:true,
	     		 slide   : function (event, ui) {
	     		 	countNumber.text(ui.value);
	     		 }
	    });
	    
	    /*
	    stockingslider1.slider({
	      		max    : 100,
		        min     : 0,
		        range   : 'min',
		        value   : 50,
		        animate : 'fast',
	     		 disabled:true,
	     		 slide   : function (event, ui) {
	     		 	stockingNumber.text(ui.value);
	     		 }
	    });
	    */
    
    	var runInputs = $('#fish-models-app .runModel');
		$(runInputs).css('display', 'none');
    
	  },
	  
	  enableInputs:function(){
	  	var model = $('div#fish-models-app.application .styledSelect select');
	
	  	var view              = $('#fish-models-app');
	  	var runButton         = view.find('#run');
	
	   	runButton.button('option', 'disabled', false);
	
	  	var inputs = $('#fish-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', false);
	  	}
	  	Streams.app_control.apps.fish_models.existingStepId = null;
	  	 //var stockingslider1 = view.find('.stockingslider1');
	    //var stockingNumber = view.find('.stockingNumber');
	    var countslider1 = view.find('.countslider1');
	    var countNumber = view.find('.countNumber');
		  	$(model).prop("disabled", false)
		  	countslider1.slider({
	      		max    : 100,
		        min     : 0,
		        range   : 'min',
		        value   : 50,
		        animate : 'fast',
	     		 disabled:false,
	     		 slide   : function (event, ui) {
	     		 	countNumber.text(ui.value);
	     		 }
	     		 
	     		 					  		

    });
    
    /*
    stockingslider1.slider({
      		max    : 100,
	        min     : 0,
	        range   : 'min',
	        value   : 50,
	        animate : 'fast',
     		 disabled:false,
     		 slide   : function (event, ui) {
     		 	stockingNumber.text(ui.value);
     		 }
    });
    */
    
    var runInputs = $('#fish-models-app .runModel');
		$(runInputs).css('display', 'block');
    
  },
  
  
  init : function () {
    // Nothing in context yet!
    var context = { };
    var template = Handlebars.templates['fish-models'];
    var view=$('#fish-models-app');
    $(view).addClass("application");
    
    var model = $('div#fish-models-app.application .styledSelect select');

    var createnew				  = view.find('.createnew');
createnew.button();
$(createnew).bind('click', function(){
	Streams.app_control.apps.fish_models.exists = false;
				Streams.app_control.apps.fish_models.enableInputs();
})
    var stockingslider1 = view.find('.stockingslider1');
    var stockingNumber = view.find('.stockingNumber');
    var countslider1 = view.find('.countslider1');
    var countNumber = view.find('.countNumber');
    
    /*
    var runData = Streams.app_control.apps.fish_models.getRuns();

    var runInterval = setInterval(function(){
    	
    	if(runData != null){
    		clearInterval(runInterval);
    		console.log(runData)
    	}
    }, 1000)
    */
    
    var runbutton = view.find('#run');
    
    runbutton.button({disabled:false});
    
    
    countslider1.slider({
      		max    : 100,
	        min     : 0,
	        range   : 'min',
	        value   : 50,
	        animate : 'fast',
     		 disabled:false,
     		 slide   : function (event, ui) {
     		 	countNumber.text(ui.value);
     		 }
    });
    
    /*
    stockingslider1.slider({
      		max    : 100,
	        min     : 0,
	        range   : 'min',
	        value   : 50,
	        animate : 'fast',
     		 disabled:false,
     		 slide   : function (event, ui) {
     		 	stockingNumber.text(ui.value);
     		 }
    });
    
    */
    
    model.change(function(){
		console.log($(this).val())
		console.log($('div#fish-models-app.application ' + '#' + $(this).val()));
		
		//console.log($('div#fish-models-app.application .app_content .app'));
		var appContent = $('div#fish-models-app.application .app_content .app');
		console.log(appContent);
		for(var i=0;i<appContent.length;i++){
			console.log(appContent[i])
			if($(appContent[i]).hasClass("app")){
				console.log("I GOT IT")
				$(appContent[i]).removeClass("active")
			}
		}
		
		$('div#fish-models-app.application ' + '#' + $(this).val()).addClass("active")
	})
    
    
    this.view = view;
    
    var that = this;

    $(runbutton).bind('click', function(){
    	that.run();
    	return false;
    });
    

  },
  
  run : function () {
  	
  	
    var model = $('div#fish-models-app.application .styledSelect select.selectRun');
    
  	//Passed Variables
  	var scriptName = $(model).val();
	var stocking_stage = $("#" + scriptName + " select.selectRun" ).val();
	console.log(stocking_stage)
	var stocking_count = $("#" + scriptName + " .countNumber" ).html();	//Get Basin ID and ALIAS
  	var basin_id = Streams.app_control.apps.basin.basin.id;
  	var run_alias = $('div#fish-models-app.application .runModel .runInput').val();
  	var existing_run_id = Streams.app_control.apps.fish_models.existingRunId;
  	var existing_step_id = Streams.app_control.apps.fish_models.existingStepId;
  	var exists = Streams.app_control.apps.fish_models.exists;
  	
  	//if Basin Alias is null, create a name for them
  	if(run_alias == "" || run_alias == " Enter a run name"){
  		run_alias = Math.ceil(Math.random()*100000);
  	}
  	var prec_ClimateInformation = Streams.app_control.apps.weather_models.getClimateInformation();
  	var prec_LandInformation = Streams.app_control.apps.land_use_models.getLandInformation();
  	var prev_FlowInformation = Streams.app_control.apps.environmental_models.getFlowInformation();
	var prev_TempInformation = Streams.app_control.apps.stream_flow_models.getStreamTempInformation();

  	//Create sending Object
  	var population = {	flag:true,
  					scriptName:scriptName,
  					basin_id:basin_id,
  					stocking_stage:stocking_stage,
  					stocking_count:stocking_count,
  					run_alias:run_alias,
  					preceding: {
						climate_dir:"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
						land_dir:"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",
						flow_dir:"/home/node.js/users/testuser1/flow/" + prev_FlowInformation.existing_step_id + "/",
						streamtemp_dir:"/home/node.js/users/testuser1/streamtemp/" + prev_TempInformation.existing_step_id + "/",
						},
  					};
  	
 	
 	

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
				"flow_dir":"/home/node.js/users/testuser1/flow/" + prev_FlowInformation.existing_step_id + "/",
				"streamtemp_dir":"/home/node.js/users/testuser1/streamtemp/" + prev_TempInformation.existing_step_id + "/",
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
				"flow_dir":"/home/node.js/users/testuser1/flow/" + prev_FlowInformation.existing_step_id + "/",
				"streamtemp_dir":"/home/node.js/users/testuser1/streamtemp/" + prev_TempInformation.existing_step_id + "/",

			},
			"existing_run_id":prec_LandInformation.existing_run_id,
			"existing_step_id":prec_LandInformation.existing_step_id,
			"exists":prec_LandInformation.exists,
		},
		
		"flow": {
			"step": "flow",
			"scriptName":prev_FlowInformation.scriptName,
			"alias":prev_FlowInformation.run_alias,
			"preceding": {
				"climate_dir":"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
				"land_dir":"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",
				"flow_dir":"/home/node.js/users/testuser1/flow/" + prev_FlowInformation.existing_step_id + "/",
				"streamtemp_dir":"/home/node.js/users/testuser1/streamtemp/" + prev_TempInformation.existing_step_id + "/",

			},
			"alias":prev_FlowInformation.run_alias,
			"existing_run_id":prev_FlowInformation.existing_run_id,
			"existing_step_id":prev_FlowInformation.existing_step_id,
			"exists":prev_FlowInformation.exists,
		},
		
		"streamtemp": {
			"step": "streamtemp",
			"scriptName":"StreamTemperatureModel",
			"alias":prev_TempInformation.run_alias,
			"preceding": {
				"climate_dir":"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
				"land_dir":"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",
				"flow_dir":"/home/node.js/users/testuser1/flow/" + prev_FlowInformation.existing_step_id + "/",
				"streamtemp_dir":"/home/node.js/users/testuser1/streamtemp/" + prev_TempInformation.existing_step_id + "/",

			},
		},
		
		"population": {
			"step":"population",
			"scriptName":population.scriptName,
			"alias":population.run_alias,
			"stocking_count":population.stocking_count,
			"stocking_stage":population.stocking_stage,
			"preceding": {
				"climate_dir":"/home/node.js/users/testuser1/climate/" + prec_ClimateInformation.existing_step_id + "/",
				"land_dir":"/home/node.js/users/testuser1/land/" + prec_LandInformation.existing_step_id + "/",
				"flow_dir":"/home/node.js/users/testuser1/flow/" + prev_FlowInformation.existing_step_id + "/",
				"streamtemp_dir":"/home/node.js/users/testuser1/streamtemp/" + prev_TempInformation.existing_step_id + "/",
			},
		}
		
		}});
		console.log(population);
		Status.addQueue(population);
	
		
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
					var selectorList = $("#fish-models-app .runTypeSelect .selectRun");
					var option = $("<option runId=" + output.runID + " stepId=" + output.stepID + ">" + population.run_alias + "</option>")
					$(option).rundata = population;
					$(selectorList).append(option);
					console.log(option);
					Streams.app_control.apps.fish_models.existingStepId = output.stepID;
					});
				/*
				Streams.app_control.addThumbnail(output[0].runID);
				Streams.app_control.apps.weather_models.getResults(output);				
				Status.clearQueueObject(output[0].alias);
				*/
				
			}
		},1000)
  		
  	  	  		Streams.app_control.apps.fish_models.disableInputs();

  	
  	console.log("RUNNING LAND USE MODEL")
  	enableButton("inputButton");
  	enableButton("outputButton");
  	enableButton("graphButton");
  	
  	
  },
};
