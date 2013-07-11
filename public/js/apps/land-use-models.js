Streams.app_control.apps.land_use_models = {
  name : 'Land Use Models',
  order: 4,
   previousRunData: [],
   existingRunId: null,
  existingStepId: null,
  exists: false,
  setup:false,

   
   getRuns: function(){
		var runs = $.post('/users/script/runs', {'scriptname': "land", 'basin_id':Streams.app_control.apps.basin.basinId}).done(function(){
			var parse = Output.runInformation.parseResponse(runs.responseText);
				Streams.app_control.apps.land_use_models.populateRunList(parse);
				return runs;
		});
		
		return null;
	},
	
	populateRunList:function(rundata){
		
		console.log("LAND DATA")
		console.log(rundata)
		$("#land-use-models-app .runTypeSelect .selectRun option[value!='Select a Completed Run']").each(function(){
			$(this).remove();
		})
		var selectorList = $("#land-use-models-app .runTypeSelect .selectRun");
		
		if(selectorList.length == 0){
			var option = $("<option disabled='true'>No Existing Runs Found</option>")
		}
		for(var i = 0;i < rundata.length;i++){
			var settings = "http://" + document.location.host + '/' + rundata[i];
			$.getJSON(settings, function(data){
				console.log(data);
				if(data.basin_id == Streams.app_control.apps.basin.basinId){
					var option = $("<option runId=" + data.runID + " basin_id=" + data.basin_id + " stepId=" + data.stepID + " scriptName=" + data.scriptName + " scenario=" + data.scenario + ">" + data.alias + "</option>")
					$(option).rundata = data;				
					$(selectorList).append(option);
				}

			})
		}
		
		Streams.app_control.apps.land_use_models.previousRunData = rundata;
		
		selectorList.change(function(){
			if($("#land-use-models-app .runTypeSelect .selectRun option:selected").html() == "Create New Run"){
				Streams.app_control.apps.land_use_models.exists = false;
				Streams.app_control.apps.land_use_models.enableInputs();
				
			} else {
				Streams.app_control.apps.land_use_models.editSettings($("#land-use-models-app .runTypeSelect .selectRun option:selected"));
			}
		});
	},
	
	editSettings:function(options,jquery){
		var data;
				  		var pre_thumblist = [];

		console.log(options);
		Streams.app_control.apps.land_use_models.exists = true;
		if(jquery == false){
			data = options;
			
			Streams.app_control.apps.land_use_models.existingRunId = data.runID;
			Streams.app_control.apps.land_use_models.existingStepId = data.stepID;
			
			var selectorList = $("#land-use-models-app .runTypeSelect .selectRun");
			$(selectorList).val(data.alias);
			//$(selectorList).selectmenu('refresh');
		} else {
			data = $(options).getAttributes();
			console.log("--------------------------------")
			console.log(data);
			pre_thumblist.push({
					
						url:Streams.user + "/land/" + data.stepid + "/"
					})
			Streams.app_control.apps.land_use_models.existingRunId = data.runid;
			Streams.app_control.apps.land_use_models.existingStepId = data.stepid;
		}
		
		
		console.log(data);
		
		var model = $('div#land-use-models-app.application .styledSelect select');
  	
	  	/**
	  	 * STAGE ONE
	  	 * Change Script Name and Window 
	  	 */
	  	$(model).val(data.scriptname);
	  	
	  	var appContent = $('div#land-use-models-app.application .app_content .app');
		for(var i=0;i<appContent.length;i++){
			if($(appContent[i]).hasClass("active")){
				$(appContent[i]).removeClass("active")
			}
		}
		
		$('div#land-use-models-app.application ' + '#' + $(model).val()).addClass("active")
	  	
	  	
	  	/**
	  	 * STAGE TWO
	  	 * Change Script Values 
	  	 */
	  	$("div#land-use-models-app.application .app_content #emissions select").val(data.scenario);
	  
	  	console.log(data);
	 	console.log("SETTING DATA: " + data.stepid)
	 	if(jquery == undefined){
		  	var previousRunSetter = $.post('/get-run-parents', {stepId: data.stepid, step:"land"}).done(function(){
		  		console.log(previousRunSetter);
		  		var data = JSON.parse(previousRunSetter.responseText);
		  		console.log(data);
		  			Streams.app_control.apps.weather_models.editSettings(data.message[0], false);
		  		
				for(var i = 0;i < data.message.length;i++){
					var item = data.message[i];
					pre_thumblist.push({
						url:item.user + "/" + item.step + "/" + item.stepID + "/"
					})
				}
				
				var dropdown_url = pre_thumblist[0];
				pre_thumblist.splice(0, 1);
				pre_thumblist.push(dropdown_url);
				Streams.app_control.addThumbnail(pre_thumblist);

		  		
		  	})
		  	
		  	var dependantRunSetter = $.post('/get-run-children', {stepId:data.stepid, step:"land"}).done(function(){
		  			console.log(dependantRunSetter);
		  			var data = JSON.parse(dependantRunSetter.responseText);
		  			console.log(data);
		  			console.log("I AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONEI AM DONE")

		  			Streams.app_control.apps.environmental_models.populateRunList(data.flow);
		  			Streams.app_control.apps.stream_flow_models.populateRunList(data.streamtemp);
		  			Streams.app_control.apps.fish_models.populateRunList(data.streamtemp);
	
		  		})
		  }
	  	
	  	
	  	//DISABLE INPUTS
  		Streams.app_control.apps.land_use_models.disableInputs();
  		
	},
	
	refreshInput:function(){
		var selectorList = $("#land-use-models-app .runTypeSelect .selectRun");
		$(selectorList).val("Create New Run");
		Streams.app_control.apps.land_use_models.exists = false;

		Streams.app_control.apps.land_use_models.enableInputs();
	},
	
	
	disableInputs:function(){
	  	var model = $('div#land-use-models-app.application .styledSelect select');
	
	  	var view              = $('#land-use-models-app');
	  	var runButton         = view.find('#run');
	
	   	runButton.button('option', 'disabled', true);
	
	  	var inputs = $('#land-use-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', true);
	  	}
	  	
	  	$(model).prop("disabled", true)
	  	var runInputs = $('#land-use-models-app .runModel');
		$(runInputs).css('display', 'none');
	  },
	  
	  enableInputs:function(){
	  	var model = $('div#land-use-models-app.application .styledSelect select');
	
	  	var view              = $('#land-use-models-app');
	  	var runButton         = view.find('#run');
	
	   	runButton.button('option', 'disabled', false);
	
	  	var inputs = $('#land-use-models-app input');
	  	for(var q = 0 ; q < inputs.length; q ++){
	  		$(inputs[q]).prop('disabled', false);
	  	}
	  	
	  	$(model).prop("disabled", false)
	  	var runInputs = $('#land-use-models-app .runModel');
		$(runInputs).css('display', 'block');
		
					  		Streams.app_control.apps.land_use_models.existingStepId = null;

		
	  	Streams.app_control.apps.environmental_models.refreshInput();
	  	Streams.app_control.apps.stream_flow_models.refreshInput();
	  	Streams.app_control.apps.fish_models.refreshInput();
		
	  },
	
	
  init : function () {
    //// Initialize View ////
    // Nothing in context yet!
    var view=$('#land-use-models-app');
    $(view).addClass("application");
    
    var model = $('div#land-use-models-app.application .styledSelect select.selectRun');
	var emissions = $('div#land-use-models-app.application div.app_content #emissions.styledSelect select');
    
    var riparianslider1 = view.find('.riparianslider1');
    var surfaceslider1 = view.find('.surfaceslider1');
    
    var riparianNumber = view.find('.riparianNumber');
    var surfaceNumber = view.find('.surfaceNumber');
    var createnew				  = view.find('.createnew');
createnew.button();
$(createnew).bind('click', function(){
	Streams.app_control.apps.land_use_models.exists = false;
				Streams.app_control.apps.land_use_models.enableInputs();
})
    /*
    var runData = Streams.app_control.apps.land_use_models.getRuns();
    var runInterval = setInterval(function(){
    	
    	if(runData != null){
    		clearInterval(runInterval);
    		console.log(runData)
    	}
    }, 1000)
    */
    
     var that = this;
    
    //RUN BUTTON
	var runButton         = view.find('#run');    
    runButton.button();
    runButton.click(function (event) {
    	console.log("RUN")
      	//runButton.button('option', 'disabled', true);
      	that.run();
      	//setTimeout(statusCheck, 3000);
     	return false;
    });
    
    
    riparianslider1.slider({
     		max    : 100,
	        min     : 0,
	        range   : 'min',
	        value   : 50,
	        animate : 'fast',
      		disabled:false,
      		slide   : function (event, ui) {
      			riparianNumber.text(ui.value);
      		}
    });
    
    surfaceslider1.slider({
     		max    : 100,
	        min     : 0,
	        range   : 'min',
	        value   : 50,
	        animate : 'fast',
     		 disabled:false,
     		 slide   : function (event, ui) {
     		 	surfaceNumber.text(ui.value);
     		 }
    });
    
    this.view = view;
    //var view = $('<div id="land-use-models-app">');
    //view.html('land use models app.');
    
    
    emissions.change(function(){
    	console.log($(this).val())
    });
    
    
    model.change(function(){
		console.log($(this).val())
		console.log($('div#land-use-models-app.application ' + '#' + $(this).val()));
		
		console.log($('div#land-use-models-app.application .app_content .app'));
		var appContent = $('div#land-use-models-app.application .app_content .app');
		for(var i=0;i<appContent.length;i++){
			if($(appContent[i]).hasClass("active")){
				$(appContent[i]).removeClass("active")
			}
		}
		
		$('div#land-use-models-app.application ' + '#' + $(this).val()).addClass("active")
	})
    
    
  
  },
  
  run : function () {
  	
  	
  	var model = $('div#land-use-models-app.application .styledSelect select.selectRun');
	var emissions = $('div#land-use-models-app.application div.app_content #emissions.styledSelect select');
    
  	//Passed Variables
  	var scriptName = $(model).val();


	//Get Basin ID and ALIAS
  	var basin_id = Streams.app_control.apps.basin.basin.id;
  	var run_alias = $('div#land-use-models-app.application .runModel .runInput').val();
  	var existing_run_id = Streams.app_control.apps.land_use_models.existingRunId;
  	var existing_step_id = Streams.app_control.apps.land_use_models.existingStepId;
  	var exists = Streams.app_control.apps.land_use_models.exists;

  	//if Basin Alias is null, create a name for them
  	if(run_alias == "" || run_alias == " Enter a run name"){
  		run_alias = Math.ceil(Math.random()*100000);
  	}
  	
  	//Create sending Object
  	var land = {	flag:true,
  					scriptName:scriptName,
  					scenario:$(emissions).val(),
  					basin_id:basin_id,
  					run_alias:run_alias,
  					existing_run_id:existing_run_id,
  					existing_step_id:existing_step_id,
  					exists:exists};
  	
 	
 	var prec_ClimateInformation = Streams.app_control.apps.weather_models.getClimateInformation();
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
			},
			"precip_mean_y1": prec_ClimateInformation.precip_mean_y1,
			"precip_mean_yn": prec_ClimateInformation.precip_mean_yn,
			"precip_var_y1": prec_ClimateInformation.precip_var_y1,
			"precip_var_yn": prec_ClimateInformation.precip_var_yn,
			"temp_mean_y1": prec_ClimateInformation.temp_mean_y1,
			"temp_mean_yn": prec_ClimateInformation.temp_mean_yn,
			"existing_run_id":prec_ClimateInformation.existing_run_id,
			"existing_step_id":prec_ClimateInformation.existing_step_id,
			"n_years": prec_ClimateInformation.n_years,
	
			"wet_threshold":0,
			
			"exists":prec_ClimateInformation.exists
		},
		
		"land": {
			"scriptName":land.scriptName,
			"scenario":land.scenario,
			"alias":land.run_alias,
			"preceding": {
				"run_id": null,
			},
			"existing_run_id":land.existing_run_id,
			"existing_step_id":land.existing_step_id,
			"exists":exists,
		}
		
		}});
		
		Status.addQueue(land);
	
		
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
					var selectorList = $("#land-use-models-app .runTypeSelect .selectRun");
					var option = $("<option selected runId=" + output.runID + " stepId=" + output.stepID + " basin_id=" + land.basin_id + " scriptName=" + land.scriptName + " scenario=" + land.scenario + ">" + land.run_alias + "</option>")
					$(option).rundata = land;
					$(selectorList).append(option);
					console.log(option);
					Streams.app_control.apps.land_use_models.existingStepId = output.stepID;

					});
				
				/*
				Streams.app_control.addThumbnail(output[0].runID);
				Streams.app_control.apps.weather_models.getResults(output);				
				Status.clearQueueObject(output[0].alias);
				*/
			}
		},1000)
  		//DISABLE INPUTS
  	Streams.app_control.apps.land_use_models.disableInputs();
  	
  	
  	console.log("RUNNING LAND USE MODEL")
  	enableButton("inputButton");
  	enableButton("outputButton");
  	enableButton("graphButton");
  	
  	
  },
  
  getLandInformation:function(){
  	var model = $('div#land-use-models-app.application .styledSelect select.selectRun');
	var emissions = $('div#land-use-models-app.application div.app_content #emissions.styledSelect select');
  	//Passed Variables
  	var scriptName = $(model).val();

	//Get Basin ID and ALIAS
  	var basin_id = Streams.app_control.apps.basin.basin.id;
  	var run_alias = $("#land-use-models-app .runTypeSelect .selectRun option:selected").html();
  	
  	var existing_run_id = Streams.app_control.apps.land_use_models.existingRunId;
  	var existing_step_id = Streams.app_control.apps.land_use_models.existingStepId;
  	var exists = Streams.app_control.apps.land_use_models.exists;
  	
  	//if Basin Alias is null, create a name for them
  	if(run_alias == "" || run_alias == " Enter a run name" || run_alias == "Create New Run"){
  		run_alias = Math.ceil(Math.random()*100000);
  	}
  	
  	//Create sending Object
  	var land = {	flag:true,
  					scriptName:scriptName,
  					scenario:$(emissions).val(),
  					basin_id:basin_id,
  					run_alias:run_alias,
  					existing_run_id:existing_run_id,
  					existing_step_id:existing_step_id,
  					exists:exists};
  	return land;
  }
  
}
