var Graphing = {
	minimizedGraphs : [],
	graphs : [],
	coords : [],
	
	init : function(num){
		var rows = 1,
			cols = 1,
			barWidth = 90,
			xBar= [],
			marginBar = 5,
			barContainerWidth = [],
			x = 0,
			y = 0,
			margin = 80,
			height = 350,
			width = 590,
			n = 0;
		
		
		for(var i = 0; i < num; i++){
			var div = $('#graphBoxContainer');
			var graph_div = $("<div class='graphDiv' data-disabled='false' graph_num=" + i + "></div>");
			var graph_handle = $("<div id='minimize_handle'></div>");

			var bar = $('#graphBar');
			var graphBar_div = $("<div class='graphDiv' data-disabled='true' graph_num=" + i + "></div>");
			var graphBar_handle = $("<div id='minimizeBar_handle'></div>");

			
			$(graph_div).css('left', (x + ((cols - 1)*(width + margin))) + 'px');
			$(graph_div).css('top', (y + ((rows - 1)*(height + margin))) + 'px');
			$(graphBar_div).attr('hidden', true);
			
			$(graph_div).append(graph_handle);
			$(div).append(graph_div);
			
			$(graphBar_div).append(graphBar_handle);		
			$(bar).append(graphBar_div);
			
			var xBar[i] = marginBar + (100 * i);
			var barContainerWidth[i] = 105 + (100 * (i-1));
			var xy = {
				x : x + ((cols - 1)*(width + margin)),
				y : y + ((rows - 1)*(height + margin))
			}
									
			Graphing.coords.push(xy);
			
			cols++;
			if (cols > 2){
				cols = 1;
				rows ++;
			}
		
		$(graph_div).find("#minimize_handle").click(function(){
			var parentGraphNum = $(this).parent().attr('graph_num');
			$(this).parent().attr('data-disabled', 'true');
			$('#graphBar [graph_num="' + parentGraphNum + '"]').attr('data-disabled', 'false');
						
			for(var i = 0; i < num; i++){
				var graphIdentifier = $('#graphBoxContainer .graphDiv')[i];
				graphIdentifier = $(graphIdentifier).attr('data-disabled');
				if (graphIdentifier == 'true'){
					$('#graphBoxContainer [graph_num="' + i + '"]').hide();
					$('#graphBar [graph_num="' + i + '"]').fadeIn('slow');
				}
				else{
					$('#graphBoxContainer [graph_num="' + i + '"]').css('top', Graphing.coords[n].y + 'px');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('left', Graphing.coords[n].x + 'px');
					n++;
				}
			}
			n = 0;
			console.log("+++++++++++++++++++++++++")
		});
		
		$(graphBar_div).find("#minimizeBar_handle").click(function(){
			$(this).parent().fadeOut('slow');
			
			var parentBarNum = $(this).parent().attr('graph_num');
			$(this).parent().attr('data-disabled', 'true');
			$('#graphBoxContainer [graph_num="' + parentBarNum + '"]').fadeIn('slow');
			$('#graphBoxContainer [graph_num="' + parentBarNum + '"]').attr('data-disabled', 'false')
			
			for(var i = 0; i < num; i++){
				var graphIdentifier = $('#graphBoxContainer .graphDiv')[i];
				graphIdentifier = $(graphIdentifier).attr('data-disabled');
				if (graphIdentifier == 'false'){
					$('#graphBoxContainer [graph_num="' + i + '"]').css('top', Graphing.coords[n].y + 'px');
					$('#graphBoxContainer [graph_num="' + i + '"]').css('left', Graphing.coords[n].x + 'px');
					n++;
				}
			}
			n = 0;
			
		});
	}}
}
