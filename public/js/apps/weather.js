/** The Weather App.
 */
Streams.app_control.apps.weather_models = {
  name : 'Weather and Climate Models',
  order: 2,
  previousRunData: [],
  existingRunId: null,
  existingStepId: null,
  exists: false,
  setup:false,
  
	getRuns: function(){
		var runs = $.post('/users/script/runs', {'scriptname': "climate", 'basin_id':Streams.app_control.apps.basin.basinId});
		var check = setInterval(function(){
			console.log(runs);
			if(runs.readyState == 4){
				clearInterval(check);
				var parse = Output.runInformation.parseResponse(runs.responseText);
				Streams.app_control.apps.weather_models.populateRunList(parse);
				return runs;
			}
		}, 2000)
		return null;
	},
	
	populateRunList:function(rundata){
		if(Streams.app_control.apps.weather_models.setup == true){return;}
		Streams.app_control.apps.weather_models.setup = true;
		$("#weather-models-app .runTypeSelect .selectRun option[value!='Select a Completed Run']").each(function(){
			$(this).remove();
		})
		var selectorList = $("#weather-models-app .runTypeSelect .selectRun");
		if(selectorList.length == 0){
			var option = $("<option disabled='true'>No Existing Runs Found</option>")
		}
		
		console.log(rundata);
		
		for(var i = 0;i < rundata.length;i++){
			var settings = "http://" + document.location.host + '/' + rundata[i];
			$.getJSON(settings, function(data){
				console.log(data);
				if(data.basin_id == Streams.app_control.apps.basin.basinId){
					//console.log("STEP ID -------------------------------  ")
					//console.log(data.stepID);
					var option = $("<option runId=" + data.runID + " stepId=" + data.stepID + " basin_id=" + data.basin_id +" n_years=" + data.n_years + " scriptName=" + data.scriptName + " precip_mean_y1=" + data.precip_mean_y1 + " precip_mean_yn=" + data.precip_mean_yn + " precip_var_y1=" + data.precip_var_y1 +" precip_var_yn=" + data.precip_var_yn + " temp_mean_y1=" + data.temp_mean_y1 + " temp_mean_yn=" + data.temp_mean_yn + ">" + data.alias + "</option>")
					$(option).rundata = data;
					$(selectorList).append(option);
					//console.log("I MATCH")
				}
				if(i == rundata.length - 1){Streams.app_control.apps.weather_models.setup = false;}
				
			})
		}
		
		Streams.app_control.apps.weather_models.previousRunData = rundata;
		Streams.app_control.removeLoader();
		
		
		selectorList.change(function(){
			if($("#weather-models-app .runTypeSelect .selectRun option:selected").html() == "Create New Run"){
				Streams.app_control.apps.weather_models.enableInputs();
				Streams.app_control.apps.weather_models.exists = false;
				//Special for Weather. Regather all runs.
				console.log("RESET")
				Streams.app_control.refreshAllApps();

			} else {
				Streams.app_control.apps.weather_models.editSettings($("#weather-models-app .runTypeSelect .selectRun option:selected"));
			}
		});
		
	},
	
	editSettings:function(options, jquery){
		var data;
		console.log(options);
		var pre_thumblist = [];
	  	
		Streams.app_control.apps.weather_models.exists = true;
		if(jquery == false){
			data = options;
			
			Streams.app_control.apps.weather_models.existingRunId = data.runID;
			Streams.app_control.apps.weather_models.existingStepId = data.stepID;
			var selectorList = $("#weather-models-app .runTypeSelect .selectRun");
			$(selectorList).val(data.alias);
		} else {
			data = $(options).getAttributes();
			pre_thumblist.push({
		  		url:Streams.user + "/climate/" + data.stepid + "/"
		  	});
			Streams.app_control.apps.weather_models.existingRunId = data.runid;
			Streams.app_control.apps.weather_models.existingStepId = data.stepid;
		}
		console.log(data);
		
		
		var model = $('div#weather-models-app.application .styledSelect select');
  	
	  	/**
	  	 * STAGE ONE
	  	 * Change Script Name and Window 
	  	 */
	  	$(model).val(data.scriptname);
	  	var appContent = $('div#weather-models-app.application .app_content .app');
		for(var i=0;i<appContent.length;i++){
			if($(appContent[i]).hasClass("active")){
				$(appContent[i]).removeClass("active")
			}
		}
		
		$('div#weather-models-app.application ' + '#' + $(model).val()).addClass("active")
	  	
	  	
	  	/**
	  	 * STAGE TWO
	  	 * Change Script Values 
	  	 */
	  	
	  	inputGraph.populateInputs(data);
	  	
	  	$('#' + data.scriptname + ' ' + '#mean_1').val(data.precip_mean_y1);
	  	
	  	$('#' + data.scriptname + ' ' + '#mean_2').val(data.precip_mean_yn);
	  	$('#' + data.scriptname + ' ' + '#precip02-value').val(data.precip_var_y1);
	  	$('#' + data.scriptname + ' ' + '#mean_temp_1').val(data.temp_mean_y1);
	  	$('#' + data.scriptname + ' ' + '#mean_temp_2').val(data.temp_mean_yn);
	  	//var n_years = Streams.yearRange || 30;
	  	
	  	console.log("WEATHER SETTING DATA: " + data.runid)
	  	console.log(jquery);
	  	
	  	//Preload thumbnails
	  	
	  	
	  	Streams.app_control.addThumbnail(pre_thumblist);
	  	
	  	
	  	if(jquery == undefined){
	  			  	console.log("WEATHER SETTING DATA: " + data.runid)

			/*
	  		var previousRunSetter = $.post('/get-run-parents', {stepId: data.stepid, step:"climate"}).done(function(){
	  		console.log(previousRunSetter);
	  		
	  		})
	  		*/ 
	  		var dependantRunSetter = $.post('/get-run-children', {stepId:data.stepid, step:"climate"}).done(function(){
	  			console.log(dependantRunSetter);
	  			var data = JSON.parse(dependantRunSetter.responseText);
	  			console.log(data);
	  			Streams.app_control.apps.land_use_models.populateRunList(data.land);
	  			Streams.app_control.apps.environmental_models.populateRunList(data.flow);
	  			Streams.app_control.apps.stream_flow_models.populateRunList(data.streamtemp);
	  			Streams.app_control.apps.fish_models.populateRunList(data.streamtemp);

	  		})
	  	} else {
	  		
	  	}
	  	
	  	
	  	
	  	//DISABLE INPUTS
  		Streams.app_control.apps.weather_models.disableInputs();
  		
	},
	
	refreshInput:function(){
		var selectorList = $("#weather-models-app .runTypeSelect .selectRun");
		$(selectorList).val("Create New Run");
		Streams.app_control.apps.weather_models.exists = false;

		Streams.app_control.apps.weather_models.enableInputs();
	},
	
	disableInputs:function(){
	  	var model = $('div#weather-models-app.application .styledSelect select');
	
	  	var view              = $('#weather-models-app');
	  	var runButton         = view.find('#run');
	
	   	runButton.button('option', 'disabled', true);
	
	  	var inputs = $('#weather-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', true);
	  	}
	  	
	  	$(model).prop("disabled", true)
	  	
	  	var runInputs = $('#weather-models-app .runModel');
		$(runInputs).css('display', 'none');
	  	
	  	inputGraph.disableInputs();
	  },
	  
	  enableInputs:function(){
	  	var model = $('div#weather-models-app.application .styledSelect select');
	
	  	var view              = $('#weather-models-app');
	  	var runButton         = view.find('#run');
	
	   	runButton.button('option', 'disabled', false);
	
	  	var inputs = $('#weather-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', false);
	  	}
	  	
	  	$(model).prop("disabled", false)
	  	
	  	var runInputs = $('#weather-models-app .runModel');
		$(runInputs).css('display', 'block');
		
	  	inputGraph.enableInputs();
	  		Streams.app_control.apps.weather_models.existingStepId = null;
	  	Streams.app_control.apps.land_use_models.refreshInput();
	  	Streams.app_control.apps.environmental_models.refreshInput();
	  	Streams.app_control.apps.stream_flow_models.refreshInput();
	  	Streams.app_control.apps.fish_models.refreshInput();
	  },
	  
	  
	
  /**
   *Starts the Weather Model View 
   */
  init : function () {
  	
   
    var view              = $('#weather-models-app');
    $(view).addClass("application");
    
    var precipSlider1Val  = view.find('#precip01-value');
    var precipSlider2Val  = view.find('#precip02-value');
    var graph1			  = view.find('#graphcontainer1');
    var graph2			  = view.find('#graphcontainer2');
    var meanTempChange    = view.find('#mean-temp');
    var meanTempChangeVal = view.find('#mean-temp-value');
    var runButton         = view.find('#run');
    var select			  = view.find(".selectRun");
    var createnew				  = view.find('.createnew');
	console.log(select)
    // The message element to display information:
    var msg               = view.find('#message');
    var model = $('div#weather-models-app.application .styledSelect select');
   /*
    var runData = Streams.app_control.apps.weather_models.getRuns();
    var runInterval = setInterval(function(){
    	
    	if(runData != null){
    		clearInterval(runInterval);
    		console.log(runData)
    	}
    }, 1000)
	
	*/
	inputGraph.initGraph("WeatherModel_Precipitation", "#graphcontainer1", "graphcontainer1", "variation", "<p>Precipitation - change in mean: in 2013: <input class='startNumber' value='0'></input>% in <span class='enddate'>2093</span>: <input class='endNumber' value='0'>%<br>- change in variance: in 2013: <input class='varstartNumber' value='0'></input>% in <span class='enddate'>2093</span>: <input class='varendNumber' value='0'></input>%", -30, 30, "Years", "Mean");
	inputGraph.initGraph("WeatherModel_Temperature" , "#graphcontainer2", "graphcontainer2", "no_variation", "<p>Temperature - change in mean: in 2013: <input class='startNumber' value='0'></input>% in <span class='enddate'>2093</span>: <input class='endNumber' value='0'>%", -10, 10, "Years", "Mean");
	
	inputGraph.initGraph("Baseline_Precipitation", "#baselineHistoric_graphcontainer1", "baselineHistoric_graphcontainer1", "variation", "<p>Precipitation - change in mean: in 2013: <input class='startNumber' value='0'></input>% in <span class='enddate'>2093</span>: <input class='endNumber' value='0'>%<br>- change in variance: in 2013: <input class='varstartNumber' value='0'></input>% in <span class='enddate'>2093</span>: <input class='varendNumber' value='0'></input>%", -30, 30, "Years", "Mean");
	inputGraph.initGraph("Baseline_Temperature" , "#baselineHistoric_graphcontainer2", "baselineHistoric_graphcontainer2", "no_variation", "<p>Temperature - change in mean: in 2013: <input class='startNumber' value='0'></input>% in <span class='enddate'>2093</span>: <input class='endNumber' value='0'>%", -10, 10, "Years", "Mean");
	
	
    // Set initial values for the sliders.
    precipSlider1Val.text(1);
    precipSlider2Val.text(1);
    meanTempChangeVal.text(0);
    //weathermodels
   // this.setupGraph('graphcontainer1', 'mean_var', -5, 5, "Time", "Percent Change");
   // this.setupGraph('graphcontainer2', 'temp', -15, 15, "Time", "Annual Temp");
    
    //basinemodels
    //this.setupGraph('baselineHistoric_graphcontainer1', 'base_mean_var', -5, 5, "Time", "Percent Change");
   // this.setupGraph('baselineHistoric_graphcontainer2', 'base_temp', -15, 15, "Time", "Annual Temp");
    
    
	model.change(function(){
		console.log($(this).val())
		console.log($('div#weather-models-app.application ' + '#' + $(this).val()));
		
		console.log($('div#weather-models-app.application .app_content .app'));
		var appContent = $('div#weather-models-app.application .app_content .app');
		for(var i=0;i<appContent.length;i++){
			if($(appContent[i]).hasClass("active")){
				$(appContent[i]).removeClass("active")
			}
		}
		
		$('div#weather-models-app.application ' + '#' + $(this).val()).addClass("active")
	})
	
	
	

    // Save the context of this object:
    var that = this;

    // This function checks the status of the Rscript model. It
    // communicates with the server using Ajax to determine if
    // there is any output to be displayed in the UI or if the
    // image files are available for display.
    function statusCheck () {
      console.log('statusCheck called');
      $.get('/mexec/status', function (data) {
        var entry = data;

        console.log(JSON.stringify(entry));

        if (entry.type === 'empty') {
          // Do nothing.
          setTimeout(statusCheck, 1000);
        }
        
        if (entry.type === 'complete') {
          msg.text('done.');
          msg.fadeOut('slow');
          runButton.button('option', 'disabled', false);
        }
        
        if (entry.type === 'info') {
          msg.html('<img src="images/ajax-loader.gif"/>');
          msg.append(entry.message);
          setTimeout(statusCheck, 1000);
        }

        if (entry.type === 'image') {
          console.log(entry.url);
          Streams.ui.makeImageBox({ title : entry.url, url : entry.url });
          setTimeout(statusCheck, 10);
        }
      });
    }
    createnew.button();
     $(createnew).bind('click', function(){
	Streams.app_control.apps.weather_models.exists = false;
				Streams.app_control.apps.weather_models.enableInputs();
})
    runButton.button();
    runButton.click(function (event) {
    	console.log("RUN")
      	//runButton.button('option', 'disabled', true);
      	runButton.button('option', 'disabled', true);
      	that.run();
      	
      	//setTimeout(statusCheck, 3000);
     	return false;
    });
  
    this.view = view;
  },

  run : function () {
  	
  	console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXX");
  	console.log(graphObject[0].startMeanVal)
  	
  	var curGraph = 0;
  	
  	
  	/*
  	 var view              = $('#weather-models-app')[0];
     var freeze = $("<div class='freeze'></div>");
     $(view).append(freeze);
     */
  	var model = $('div#weather-models-app.application .styledSelect select');
  	
  	//Passed Variables
  	var scriptName = $(model).val();
  	if(scriptName == "weather_generator"){
  		curGraph = 0;
  	} else if(scriptName == "baseline_shift"){
  		curGraph = 2;
  	}
  	
  	
  	console.log(scriptName);
  	var precip_mean_y1 = graphObject[curGraph].startMeanVal;
  	
  	var precip_mean_yn = graphObject[curGraph].endMeanVal;
  	var precip_var_y1 = graphObject[curGraph].startVarVal;
  	var precip_var_yn = graphObject[curGraph].endVarVal;
  	var temp_mean_y1 = graphObject[curGraph+1].startMeanVal;
  	var temp_mean_yn = graphObject[curGraph+1].endMeanVal;
  	var n_years = Streams.yearRange || 30;
  	  	console.log(precip_mean_y1);

  	var basin_id = Streams.app_control.apps.basin.basin.id;
  	var run_alias = $('div#weather-models-app.application .runModel .runInput').val();
  	
  	var existing_run_id = Streams.app_control.apps.weather_models.existingRunId;
  	var existing_step_id = Streams.app_control.apps.weather_models.existingStepId;
  	  	var exists = Streams.app_control.apps.weather_models.exists;

  	
  	if(run_alias == "" || run_alias == " Enter a run name"){
  		run_alias = Math.ceil(Math.random()*100000);
  	}
  	
  	console.log(run_alias);
  	
  	var climate = {	flag:true,
  					scriptName:scriptName,
  					basin_id:basin_id,
  					precip_mean_y1:precip_mean_y1,
  					precip_mean_yn:precip_mean_yn,
  					precip_var_y1:precip_var_y1,
  					precip_var_yn:precip_var_yn,
  					temp_mean_y1:temp_mean_y1,
  					temp_mean_yn:temp_mean_yn,
  					n_years:n_years,
  					run_alias:run_alias,
  					existing_run_id:existing_run_id,
  					existing_step_id:existing_step_id,
  					exists:exists};

	console.log("I am sending the Climate Object");
	console.log(climate);  	
  	
	var serverResponse = $.post('/execute-step', {"webInfo": {
		"climate": {
			"step": "climate",
			"flag": climate.flag,
			"alias": climate.run_alias,
			"scriptName": climate.scriptName,
			"basin_id": climate.basin_id,
			"preceding": {
				"run_id": null,
			},
			"precip_mean_y1": climate.precip_mean_y1,
			"precip_mean_yn": climate.precip_mean_yn,
			"precip_var_y1": climate.precip_var_y1,
			"precip_var_yn": climate.precip_var_yn,
			"temp_mean_y1": climate.temp_mean_y1,
			"temp_mean_yn": climate.temp_mean_yn,
			"n_years": climate.n_years,
			"existing_run_id":climate.existing_run_id,
			"existing_step_id":climate.existing_step_id,
			"wet_threshold":0,
			'exists':exists
		},
		}});
		
		Status.addQueue(climate);
	
		
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
					
					var selectorList = $("#weather-models-app .runTypeSelect .selectRun");
					var option = $("<option selected runId=" + output.runID + " stepId=" + output.stepID + " basin_id=" + climate.basin_id +" n_years=" + climate.n_years + " scriptName=" + climate.scriptName + " precip_mean_y1=" + climate.precip_mean_y1 + " precip_mean_yn=" + climate.precip_mean_yn + " precip_var_y1=" + climate.precip_var_y1 +" precip_var_yn=" + climate.precip_var_yn + " temp_mean_y1=" + climate.temp_mean_y1 + " temp_mean_yn=" + climate.temp_mean_yn + ">" + climate.run_alias + "</option>")
					$(option).rundata = climate;
					$(selectorList).append(option);
					console.log(option);    
					Streams.app_control.apps.weather_models.existingStepId = output.stepID;
					console.log(existing_step_id);
					
					
					});
				
				/*
				Streams.app_control.addThumbnail(output[0].runID);
				Streams.app_control.apps.weather_models.getResults(output);				
				Status.clearQueueObject(output[0].alias);
				*/
			}
		},1000)
  	
  	//DISABLE INPUTS
  	Streams.app_control.apps.weather_models.disableInputs();
  	
  	enableButton("inputButton");
  	enableButton("outputButton");
  	enableButton("graphButton");
  	
  
   
	
	
    
  },
  
  
  
  
  getClimateInformation:function(){
  	var curGraph = 0;
  	
  	
  	/*
  	 var view              = $('#weather-models-app')[0];
     var freeze = $("<div class='freeze'></div>");
     $(view).append(freeze);
     */
  	var model = $('div#weather-models-app.application .styledSelect select');
  	
  	//Passed Variables
  	var scriptName = $(model).val();
  	if(scriptName == "weather_generator"){
  		curGraph = 0;
  	} else if(scriptName == "baseline_shift"){
  		curGraph = 2;
  	}
  	
  	
  	console.log(scriptName);
  	var precip_mean_y1 = graphObject[curGraph].startMeanVal;
  	
  	var precip_mean_yn = graphObject[curGraph].endMeanVal;
  	var precip_var_y1 = graphObject[curGraph].startVarVal;
  	var precip_var_yn = graphObject[curGraph].endVarVal;
  	var temp_mean_y1 = graphObject[curGraph+1].startMeanVal;
  	var temp_mean_yn = graphObject[curGraph+1].endMeanVal;
  	var n_years = Streams.yearRange || 30;
  	  	console.log(precip_mean_y1);

  	var basin_id = Streams.app_control.apps.basin.basin.id;
  	var run_alias = $("#weather-models-app .runTypeSelect .selectRun option:selected").html();
  	
  	
  	console.log(run_alias)
  	
  	var existing_run_id = Streams.app_control.apps.weather_models.existingRunId;
  	var existing_step_id = Streams.app_control.apps.weather_models.existingStepId;
  	var exists = Streams.app_control.apps.weather_models.exists;
  	
  	if(run_alias == "" || run_alias == " Enter a run name" || run_alias == "Create New Run"){
  		run_alias = Math.ceil(Math.random()*100000);
  	}
  	
  	console.log(run_alias);
  	
  	var climate = {	flag:true,
  					scriptName:scriptName,
  					basin_id:basin_id,
  					precip_mean_y1:precip_mean_y1,
  					precip_mean_yn:precip_mean_yn,
  					precip_var_y1:precip_var_y1,
  					precip_var_yn:precip_var_yn,
  					temp_mean_y1:temp_mean_y1,
  					temp_mean_yn:temp_mean_yn,
  					n_years:n_years,
  					run_alias:run_alias,
  					existing_run_id:existing_run_id,
  					existing_step_id:existing_step_id,
  					exists:exists};
  					
  	return climate;
  },
  
  
  getResults:function(output){
  	
  },
  
  
  

  
  /**
   * 
   * @param {Object} obj
   * @param {Object} num
   */
  updateText:function(obj, num){
  	 $(obj).val(num);
  },
  
  /**
   * Sets up a Graph
 * @param {Object} container ID of the object being instantiated with the graph
 * @param {Object} state Type of graph to track
 * @param {Object} min Min Data Amount
 * @param {Object} max Max Data Amount
 * @param {Object} xLabel X Axis Label
 * @param {Object} yLabel Y Axis Label
   */
  setupGraph : function(container, state, min, max, xLabel, yLabel){
  	Streams.graphs.init(container, state, min, max, xLabel, yLabel);
  }
  
};


