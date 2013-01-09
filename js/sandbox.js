var table,
	tableHeader;
var nodes;
var links;
	
var fileLoader = {
	reader:undefined,
	abortRead:function(){
		fileLoader.reader.abort();
	},
	errorHandler:function(evt){
		switch(evt.target.error.code) {
			case evt.target.error.NOT_FOUND_ERR:
				alert('File Not Found!');
				break;
			case evt.target.error.NOT_READABLE_ERR:
				alert('File is not readable');
				break;
			case evt.target.error.ABORT_ERR:
				break; // noop
			default:
				alert('An error occurred reading this file.');
		};
	},
	updateProgress:function(evt){
		// evt is an ProgressEvent.
		if (evt.lengthComputable) {
			var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
			// Increase the progress bar length.
			if (percentLoaded < 100) {
				var progress = document.querySelector('.percent');
				progress.style.width = percentLoaded + '%';
				progress.textContent = percentLoaded + '%';
			}
		}
	},
	handleFileSelect: function(evt) {
		// Reset progress indicator on new file selection.
		var progress = document.querySelector('.percent');
		progress.style.width = '0%';
		progress.textContent = '0%';
		
		fileLoader.reader = new FileReader();
		fileLoader.reader.onerror = fileLoader.errorHandler;
		fileLoader.reader.onprogress = fileLoader.updateProgress;
		fileLoader.reader.onabort = function(e) {
			alert('File read cancelled');
		};
		fileLoader.reader.onloadstart = function(e) {
			$("#progress_bar").addClass("loading");
			$("#progress_bar_message").removeClass("fail_message");
			$("#progress_bar_message").removeClass("success_message");
			document.getElementById('progress_bar').className = 'loading';
		};
		fileLoader.reader.onload = function(e) {
			// Ensure that the progress bar displays 100% at the end.
			var progress = document.querySelector('.percent');
			progress.style.width = '100%';
			progress.textContent = 'Reading: 100% - Now parsing...';
			setTimeout("fileLoader.finalize();", 2000);
		}
		
		fileLoader.reader.readAsText(evt.target.files[0]);
	},
	
	finalize: function(){
		table = d3.csv.parseRows(fileLoader.reader.result);
		
		$("#progress_bar_message").addClass("success_message");
		$("#progress_bar_message").html(table[0].length+" columns and "+table.length+" rows.");
		$("#validation").addClass("open");
		setTimeout('$("#progress_bar").removeClass("loading");', 2000);
		
		buildUI();
	}
}

function buildUI(){
	$("#UI").html('<b>Data Preview</b><br/><div id="dataPreview"><table>'
		+table.filter(function(d,i){return i<10})
			.map(function(row){return '<tr>'
			+row.map(function(d){return '<td>'+d.substr(0,200)+'</td>';})
				.join('')
			+'</tr>';}).join('')
		+'</table></div><br/><br/>'
		+'<table><tr>'
		+'<td id="network_type1"><img id="network_type1_img" src="res/xyx.png"/><br/><b>1. Mono (Co-occurrence)</b><br/><i>Ex: Authors linked by Papers</i></td>'
		+'<td id="network_type2"><img id="network_type2_img" src="res/xy.png"/><br/><b>2. Bipartite</b><br/><i>Ex: Authors and Papers</i></td>'
		+'<td id="network_type3"><img id="network_type3_img" src="res/xx.png"/><br/><b>3. Citations</b><br/><i>Ex: Papers citing Papers</i></td>'
		+'<td id="network_type4"><img id="network_type4_img" src="res/x.png"/><br/><b>4. No link</b><br/></td>'
		+'</tr></table><br/>'
		+'<b>Type of Network</b><br/>'
		+'<select id="typeOfGraph" onchange="buildUI_set()">'
		+'<option value="none">Choose...</option>'
		+'<option value="mono">1. Mono (Co-occurrence)</option>'
		+'<option value="bipartite">2. Bipartite</option>'
		+'<option value="citation">3. Citations</option>'
		+'<option value="table">4. No link</option>'
		+'</select><br/><br/><div id="buildUI_result">'
		+'</div>');
}

function buildUI_set(){
	if($("#typeOfGraph").val() == "none"){
		$("#buildUI_result").html('');
		
	} else if($("#typeOfGraph").val() == "mono"){
		$("#network_type1_img").attr("src", "res/xyx.png");
		$("#network_type2_img").attr("src", "res/xy_disabled.png");
		$("#network_type3_img").attr("src", "res/xx_disabled.png");
		$("#network_type4_img").attr("src", "res/x_disabled.png");
		nodesColumn_build("#buildUI_result");
			
	} else if($("#typeOfGraph").val() == "bipartite"){
		$("#network_type1_img").attr("src", "res/xyx_disabled.png");
		$("#network_type2_img").attr("src", "res/xy.png");
		$("#network_type3_img").attr("src", "res/xx_disabled.png");
		$("#network_type4_img").attr("src", "res/x_disabled.png");
		nodesColumn1_build("#buildUI_result");
		
	} else if($("#typeOfGraph").val() == "citation"){
		$("#network_type1_img").attr("src", "res/xyx_disabled.png");
		$("#network_type2_img").attr("src", "res/xy_disabled.png");
		$("#network_type3_img").attr("src", "res/xx.png");
		$("#network_type4_img").attr("src", "res/x_disabled.png");
		nodesColumn_build("#buildUI_result");
			
	} else if($("#typeOfGraph").val() == "table"){
		$("#network_type1_img").attr("src", "res/xyx_disabled.png");
		$("#network_type2_img").attr("src", "res/xy_disabled.png");
		$("#network_type3_img").attr("src", "res/xx_disabled.png");
		$("#network_type4_img").attr("src", "res/x.png");
		nodesColumn_build("#buildUI_result");
			
	} else {
		$("#buildUI_result").html('<i>This option is not supported yet.</i>');
	}
	$("#submitButton").hide();
}

function nodesColumn_build(parentId){
	$(parentId).html('<img src="res/x_node.png"> <b>Which are the nodes?</b><br/>'
		+'<select id="nodesCategory" onchange="nodesColumn_set()">'
		+'<option value="none">Choose a column...</option>'
		+table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}).join("")
		+'</select><br/><br/><div id="nodesColumn_result"></div>');
}

function nodesColumn1_build(parentId){
	$(parentId).html('<img src="res/x_node.png"> <b>Which is the first type of nodes?</b><br/>'
		+'<select id="nodesCategory1" onchange="nodesColumn1_set()">'
		+'<option value="none">Choose a column...</option>'
		+table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}).join("")
		+'</select>'
		+'<br/><i>Note: in a bipartite graph, you have to chose two different types of nodes.</i><br/>'
		+'<br/><br/><div id="nodesColumn1_result"></div>');
}

function nodesColumn1_set(){
	if($("#nodesCategory1").val() == "none"){
		$("#nodesColumn1_result").html('');
	} else {
		multipleNodesPerCell1_build("#nodesColumn1_result");
	}
	$("#submitButton").hide();
}

function multipleNodesPerCell1_build(parentId){
	$(parentId).html('<img src="res/x_node.png"> <b>Multiple nodes per cell? (type 1)</b><br/>'
		+'<select id="nodesMultipleSeparator1" onchange="multipleNodesPerCell1_set()">'
		+'<option value="none">Choose a separator...</option>'
		+'<option value="nomultiples">No multiples</option>'
		+'<option value="coma">"," Coma</option>'
		+'<option value="semicolon">";" Semicolon</option>'
		+'<option value="dash">"-" Dash</option>'
		+'<option value="space">" " Space</option>'
		+'<option value="pipe">"|" Pipe</option>'
		+'</select>'
		+'<br/><i>Example:<br/>Your data is a list of papers and you want a <b>graph of authors</b>. Each paper may have several authors, and the author cell in your csv file looks like a list: "Enstein; Erdös; Bacon".<br/>Then you have to define the separator (here, the semicolon ";").</i><br/>'
		+'<br/><br/><div id="multipleNodesPerCell1_result"></div>');
}

function multipleNodesPerCell1_set(){
	if($("#nodesMultipleSeparator1").val() == "none"){
		$("#multipleNodesPerCell1_result").html('');
	} else {
		nodesColumn2_build("#multipleNodesPerCell1_result");
	}
	$("#submitButton").hide();
}

function nodesColumn2_build(parentId){
	var nodesColumnId1 = $("#nodesCategory1").val();
	$(parentId).html('<img src="res/y_node.png"> <b>Which is the second type of nodes?</b><br/>'
		+'<select id="nodesCategory2" onchange="nodesColumn2_set()">'
		+'<option value="none">Choose a column...</option>'
		+table[0].map(function(d,i){
			if(i != nodesColumnId1){
				return '<option value="'+i+'">'+d+'</option>';
			} else {
				return '';
			}
		}).join("")
		+'</select>'
		+'<br/><br/><div id="nodesColumn2_result"></div>');
}

function nodesColumn2_set(){
	if($("#nodesCategory2").val() == "none"){
		$("#nodesColumn2_result").html('');
	} else {
		multipleNodesPerCell2_build("#nodesColumn2_result");
	}
	$("#submitButton").hide();
}

function multipleNodesPerCell2_build(parentId){
	$(parentId).html('<img src="res/y_node.png"> <b>Multiple nodes per cell? (type 2)</b><br/>'
		+'<select id="nodesMultipleSeparator2" onchange="multipleNodesPerCell2_set()">'
		+'<option value="none">Choose a separator...</option>'
		+'<option value="nomultiples">No multiples</option>'
		+'<option value="coma">"," Coma</option>'
		+'<option value="semicolon">";" Semicolon</option>'
		+'<option value="dash">"-" Dash</option>'
		+'<option value="space">" " Space</option>'
		+'<option value="pipe">"|" Pipe</option>'
		+'</select>'
		+'<br/><br/><div id="multipleNodesPerCell2_result"></div>');
}

function multipleNodesPerCell2_set(){
	if($("#linksMultipleSeparator2").val() == "none"){
		$("#multipleNodesPerCell2_result").html('');
	} else {
		nodesMetadata_build("#multipleNodesPerCell2_result");
	}
	$("#submitButton").hide();
}

function nodesColumn_set(){
	if($("#nodesCategory").val() == "none"){
		$("#nodesColumn_result").html('');
	} else {
		multipleNodesPerCell_build("#nodesColumn_result");
	}
	$("#submitButton").hide();
}

function multipleNodesPerCell_build(parentId){
	$(parentId).html('<img src="res/x_node.png"> <b>Multiple nodes per cell?</b><br/>'
		+'<select id="nodesMultipleSeparator" onchange="multipleNodesPerCell_set()">'
		+'<option value="none">Choose a separator...</option>'
		+'<option value="nomultiples">No multiples</option>'
		+'<option value="coma">"," Coma</option>'
		+'<option value="semicolon">";" Semicolon</option>'
		+'<option value="dash">"-" Dash</option>'
		+'<option value="space">" " Space</option>'
		+'<option value="pipe">"|" Pipe</option>'
		+'</select>'
		+'<br/><i>Example:<br/>Your data is a list of papers and you want a <b>graph of authors</b>. Each paper may have several authors, and the author cell in your csv file looks like a list: "Enstein; Erdös; Bacon".<br/>Then you have to define the separator (here, the semicolon ";").</i><br/>'
		+'<br/><br/><div id="multipleNodesPerCell_result"></div>'
		);
}

function multipleNodesPerCell_set(){
	if($("#nodesMultipleSeparator").val() == "none"){
		$("#multipleNodesPerCell_result").html('');
	} else {
		if($("#typeOfGraph").val() == "mono"){
			linksCategory_build("#multipleNodesPerCell_result");
		} else if($("#typeOfGraph").val() == "citation"){
			citationLinkCategory_build("#multipleNodesPerCell_result");
		} else if($("#typeOfGraph").val() == "table"){
			nodesMetadata_build("#multipleNodesPerCell_result");
		} else {
			$("#multipleNodesPerCell_result").html('<i>Error in type of graph</i>');
		}
	}
	$("#submitButton").hide();
}

function citationLinkCategory_build(parentId){
	$(parentId).html('<img src="res/edge.png"> <b>Which are the citation links?</b><br/>'
		+'<select id="citationLinksCategory" onchange="citationLinksCategory_set()">'
		+'<option value="none">Choose a column...</option>'
		+table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}).concat()
		+'</select><br/><br/><div id="citationLinksCategory_result"></div>');
}

function citationLinksCategory_set(){
	if($("#citationLinksCategory").val() == "none"){
		$("#citationLinksCategory_result").html('');
	} else if($("#citationLinksCategory").val() == $("#nodesCategory").val()){
		$("#citationLinksCategory_result").html('You cannot chose the same column for nodes and links.');
	} else {
		multipleCitationLinksPerCell_build("#citationLinksCategory_result");
	}
	$("#submitButton").hide();
}

function multipleCitationLinksPerCell_build(parentId){
	$(parentId).html('<img src="res/edge.png"> <b>Multiple citation links per cell?</b><br/>'
		+'<select id="citationLinksMultipleSeparator" onchange="multipleCitationLinksPerCell_set()">'
		+'<option value="none">Choose a separator...</option>'
		+'<option value="nomultiples">No multiples</option>'
		+'<option value="coma">"," Coma</option>'
		+'<option value="semicolon">";" Semicolon</option>'
		+'<option value="dash">"-" Dash</option>'
		+'<option value="space">" " Space</option>'
		+'<option value="pipe">"|" Pipe</option>'
		+'</select>'
		+'<br/><br/><div id="multipleCitationLinksPerCell_result"></div>');
}

function multipleCitationLinksPerCell_set(){
	if($("#citationLinksMultipleSeparator").val() == "none"){
		$("#multipleCitationLinksPerCell_result").html('');
	} else {
		nodesMetadata_build("#multipleCitationLinksPerCell_result");
	}
	$("#submitButton").hide();
}

function linksCategory_build(parentId){
	$(parentId).html('<img src="res/y_edge.png"> <b>Which are the links?</b><br/>'
		+'<select id="linksCategory" onchange="linksCategory_set()">'
		+'<option value="none">Choose a column...</option>'
		+table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}).concat()
		+'</select><br/><br/><div id="linksCategory_result"></div>');
}

function linksCategory_set(){
	if($("#linksCategory").val() == "none"){
		$("#linksCategory_result").html('');
	} else if($("#linksCategory").val() == $("#nodesCategory").val()){
		$("#linksCategory_result").html('You cannot chose the same column for nodes and links.');
	} else {
		multipleLinksPerCell_build("#linksCategory_result");
	}
	$("#submitButton").hide();
}

function multipleLinksPerCell_build(parentId){
	$(parentId).html('<img src="res/y_edge.png"> <b>Multiple links per cell?</b><br/>'
		+'<select id="linksMultipleSeparator" onchange="multipleLinksPerCell_set()">'
		+'<option value="none">Choose a separator...</option>'
		+'<option value="nomultiples">No multiples</option>'
		+'<option value="coma">"," Coma</option>'
		+'<option value="semicolon">";" Semicolon</option>'
		+'<option value="dash">"-" Dash</option>'
		+'<option value="space">" " Space</option>'
		+'<option value="pipe">"|" Pipe</option>'
		+'</select>'
		+'<br/><i>Example:<br/>Your data is a list of papers and you want a graph of papers <b>that share an author</b>. Each paper may have several authors, and the author cell in your csv file looks like a list: "Enstein; Erdös; Bacon".<br/>Then you have to define the separator (here, the semicolon ";").</i><br/>'
		+'<br/><br/><div id="multipleLinksPerCell_result"></div>');
}

function multipleLinksPerCell_set(){
	if($("#linksMultipleSeparator").val() == "none"){
		$("#multipleLinksPerCell_result").html('');
	} else {
		nodesMetadata_build("#multipleLinksPerCell_result");
	}
	$("#submitButton").hide();
}

function nodesMetadata_build(parentId){
	$(parentId).html('<img src="res/x_node.png"> <b>Select metadata to export with nodes</b><br/>'
		+'<i><b>Warning: </b>Adding metadata may cause a memory overload (a browser crash, not dangerous but you won\'t get any result)</i><br/>'
		+'<div class="metadata_check">'
		+table[0].map(function(d,i){
			return '<span STYLE="text-wrap:none"><label for="nodesMetadata_'+i+'"><input type="checkbox" class="nodesMetadata" id="nodesMetadata_'+i+'" value="'+i+'"/>'+d+'</label></span><br/> ';
		}).join(" ")
		+'</div>'
		+'<button onclick="nodesMetadata_set()">OK</button>'
		+'</select><br/><br/><div id="nodesMetadata_result"></div>');
}

function nodesMetadata_set(){
	if($("#typeOfGraph").val() == "table"){
		temporality_build("#nodesMetadata_result");
	} else {
		linksMetadata_build("#nodesMetadata_result");
	}
	$("#submitButton").hide();
}

function linksMetadata_build(parentId){
	var icon = '';
	if($("#typeOfGraph").val() == "mono"){
		icon = '<img src="res/y_edge.png">'
	}
	$(parentId).html(icon+'<b>Select metadata to export with <i>links</i></b><br/>'
		+'<i><b>Warning: </b>Adding metadata may cause a memory overload (a browser crash, not dangerous but you won\'t get any result)</i><br/>'
		+'<div class="metadata_check">'
		+table[0].map(function(d,i){
			return '<span STYLE="text-wrap:none"><label for="linksMetadata_'+i+'"><input type="checkbox" class="linksMetadata" id="linksMetadata_'+i+'" />'+d+'</label></span><br/> ';
		}).join(" ")
		+'</div>'
		+'<button onclick="linksMetadata_set()">OK</button>'
		+'</select><br/><br/><div id="linksMetadata_result"></div>');
}

function linksMetadata_set(){
	temporality_build("#linksMetadata_result");
	$("#submitButton").hide();
}

function temporality_build(parentId){
	$(parentId).html('<b>Temporality</b><br/>'
		+'<select id="temporality" onchange="temporality_set()">'
		+'<option value="none">Choose temporality...</option>'
		+'<option value="static">None (static data)</option>'
		+'<option value="year">Year by year</option>'
		+'</select><br/><br/><div id="temporality_result"></div>');
}

function temporality_set(){
	if($("#temporality").val() == "none"){
		$("temporality_result").html('Please choose a temporality. If your data do not have one, chose "static".');
	} else if($("#temporality").val() == "static"){
		edgeWeight_build("#temporality_result");
	} else if($("#temporality").val() == "year"){
		temporalityColumn_build("#temporality_result");
	} else {
		$("temporality_result").html('This option is not yet supported.');
	}
	$("#submitButton").hide();
}

function temporalityColumn_build(parentId){
	$(parentId).html('<b>Temporality Column</b><br/>'
		+'<select id="temporalityCategory" onchange="temporalityColumn_set()">'
		+'<option value="none">Choose...</option>'
		+table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}).join("")
		+'</select><br/><br/><div id="temporalityColumn_result"></div>');
}

function temporalityColumn_set(){
	if($("#temporalityCategory").val() == "none"){
		$("#temporalityColumn_result").html('');
	} else {
		buildButton_build("#temporalityColumn_result");
	}
	$("#submitButton").hide();
}

function edgeWeight_build(parentId){
	$(parentId).html('<b>Edge Weight</b><br/>'
		+'<select id="edgeWeight" onchange="edgeWeight_set()">'
		+'<option value="none">Choose...</option>'
		+'<option value="true">Weight the edges</option>'
		+'<option value="false">No weight</option>'
		+'</select><br/><br/><div id="edgeWeight_result"></div>');
}

function edgeWeight_set(){
	if($("#edgeWeight").val() == "none"){
		$("#edgeWeight_result").html('');
	} else {
		buildButton_build("#edgeWeight_result");
	}
	$("#submitButton").hide();
}

function buildButton_build(parentId){
	$(parentId).html('<b>Build the graph</b><br/>'
		+'<input type="button" onclick="buildGraph()" value="Build" style="width: 200px; height: 30px;"/><br/>NB: this may take a while, please be patient.');
}



function getNodes(nodesColumnId, nodesMultiples, nodesSeparator){
	// NODES
	var nodesList = table.map(function(d,i){return {node:d[nodesColumnId], colId:nodesColumnId, tableRows:[i]};});
	
	// Unfold if there are multiples
	if(nodesMultiples){
		nodesList = d3.merge(
			nodesList.map(function(d){
				if(d.node){
					return d.node.split(nodesSeparator)
						.map(function(dd){
							// NB: array.slice(0) is just cloning the array. This is necessary here.
							return {node:dd, colId:d.colId, tableRows:d.tableRows.slice(0)};
						});
				} else {
					return [];
				}
			})
		);
	}
	
	// Clean
	var temp_nodesList = nodesList
		.map(function(d){
			return {node:clean_expression(d.node), colId:d.colId, tableRows:d.tableRows};
		})
		.filter(function(d){
			return d.node != "";
		})
		.sort(function(a, b) {
			return a.node < b.node ? -1 : a.node > b.node ? 1 : 0;
		});
	
	// Merge Doubles
	nodesList = [];
	for (var i = 0; i < temp_nodesList.length; i++) {
		if (i==0 || temp_nodesList[i - 1].node != temp_nodesList[i].node) {
			nodesList.push(temp_nodesList[i]);
		} else {
			nodesList[nodesList.length-1].tableRows = nodesList[nodesList.length-1].tableRows.concat(temp_nodesList[i].tableRows);
		}
	}
	
	return nodesList;
}

function getMonopartiteLinks(nodesColumnId, nodesMultiples, nodesSeparator, linksColumnId, linksMultiples, linksSeparator){
	// To build our graph, we will first build a bipartite graph and the transform it to a monopartite graph.
	// In this case, the nodes of the bipartite graph that will be transformed in links are called "GhostNodes".
	
	var ghostNodesList = table.map(function(d,i){
		// Here we want to keep tracking the links.
		// So we return objects that contain the ghostNode and the list of linked nodes.
		// There is only one linked nodes if there are no multiples for nodes, of course...
		
		// Linked nodes
		var linkedNodesList;
		if(!nodesMultiples){
			linkedNodesList = [clean_expression(table[i][nodesColumnId])];
		} else {
			// We clean the linkedNodesList like we did with the nodesList before...
			if(table[i][nodesColumnId]){
				linkedNodesList = table[i][nodesColumnId].split(nodesSeparator).map(function(d){
					return clean_expression(d);
				})
				.filter(function(d){
					return d != "";
				});
			} else {
				linkedNodesList = [];
			}
		}
		return {ghostNode:d[linksColumnId], linkedNodes:linkedNodesList, tableRows:[i]};
	});
	
	// Unfold if there are multiples
	if(linksMultiples){
		ghostNodesList = d3.merge(
			ghostNodesList.map(function(d,i){
				subGhostNodes = d.ghostNode.split(linksSeparator);
				return subGhostNodes.map(function(dd){
					// NB: array.slice(0) is just cloning the array. This is necessary here.
					return {ghostNode:dd, linkedNodes:d.linkedNodes.slice(0), tableRows:d.tableRows.slice(0)};
				});
			})
		);
	}
	
	// Clean
	var temp_ghostNodesList = ghostNodesList
		.map(function(d){
			return {ghostNode:clean_expression(d.ghostNode), linkedNodes:d.linkedNodes, tableRows:d.tableRows};
		})
		.filter(function(d){
			return d.ghostNode != "";
		})
		.sort(function(a, b) {
			return a.ghostNode < b.ghostNode ? -1 : a.ghostNode > b.ghostNode ? 1 : 0;
		});
	
	// Merge Doubles
	ghostNodesList = [];
	for(var i=0; i<temp_ghostNodesList.length; i++) {
		if(i==0 || temp_ghostNodesList[i-1].ghostNode != temp_ghostNodesList[i].ghostNode) {
			// The element is different from the previous one. We just add it, ok...
			ghostNodesList.push(temp_ghostNodesList[i]);
		} else {
			// The element is the same. Then we have to merge: add the new linked nodes.
			currentLinkedNodesList = ghostNodesList[ghostNodesList.length-1].linkedNodes;
			
			temp_ghostNodesList[i].linkedNodes.forEach(function(d){
				if(!currentLinkedNodesList.some(function(dd){
					return dd == d;
				})){
					// If currentLinkedNodesList contains no "d" node
					// That is, if the element "d" is new, just add it.
					currentLinkedNodesList.push(d);
				}
			});
			
			ghostNodesList[ghostNodesList.length-1].linkedNodes = currentLinkedNodesList;
		}
	}
	
	// Now we have to build the actual monopartite links.
	// Each ghostNode links all the nodes linked to it. First we add all these links and then we remove doublons.
	links = d3.merge(
		ghostNodesList.map(function(d){
			var localLinks = [];
			d.linkedNodes.forEach(function(dd,i){
				for(j=0; j<i; j++){
					var node1 = d.linkedNodes[i];
					var node2 = d.linkedNodes[j];
					if(node1 < node2){
						localLinks.push({source:node1, target:node2, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows});
					} else {
						localLinks.push({source:node2, target:node1, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows});
					}
				}
			});
			return localLinks;
		})
	);
	
	// Remove doublons
	temp_links = links.sort(function(a, b) {
		return a.source+a.target < b.source+b.target ? -1 : a.source+a.target > b.source+b.target ? 1 : 0;
	});
	links = [];
	for(var i=0; i<temp_links.length; i++) {
		if(i==0 || temp_links[i-1].source != temp_links[i].source || temp_links[i-1].target != temp_links[i].target) {
			// The element is different from the previous one. We just add it.
			links.push(temp_links[i]);
		} else {
			links[links.length-1].tableRows = links[links.length-1].tableRows.concat(temp_links[i].tableRows);
		}
	}
	return links;
}

function getBipartiteLinks(nodesColumnId_1, nodesMultiples_1, nodesSeparator_1, nodesColumnId_2, nodesMultiples_2, nodesSeparator_2){
	var secondaryNodesList = table.map(function(d,i){
		// Here we want to keep tracking the links.
		// So we return objects that contain the secondaryNode and the list of linked nodes.
		// There is only one linked nodes if there are no multiples for nodes, of course...

		// Linked nodes
		var linkedNodesList;
		if(!nodesMultiples_1){
			var linkedNode = clean_expression(table[i][nodesColumnId_1]);
			linkedNodesList = [linkedNode];
		} else {
			// We clean the linkedNodesList like we did with the nodesList before...
			linkedNodesList = table[i][nodesColumnId_1].split(nodesSeparator_1).map(function(d){
				return clean_expression(d);
			})
			.filter(function(d){
				return d != "";
			});
		}
		secondaryNode = d[nodesColumnId_2] || "";
		return {secondaryNode:secondaryNode, linkedNodes:linkedNodesList, tableRows:[i]};
	});
	
	// Unfold if there are multiples
	if(nodesMultiples_2){
		secondaryNodesList = d3.merge(
			secondaryNodesList.map(function(d,i){
				subsecondaryNodes = d.secondaryNode.split(nodesSeparator_2);
				return subsecondaryNodes.map(function(dd){
					// NB: array.slice(0) is just cloning the array. This is necessary here.
					return {secondaryNode:dd, linkedNodes:d.linkedNodes.slice(0), tableRows:d.tableRows.slice(0)};
				});
			})
		);
	}
	
	// Clean
	var temp_secondaryNodesList = secondaryNodesList
		.map(function(d){
			return {secondaryNode:clean_expression(d.secondaryNode), linkedNodes:d.linkedNodes, tableRows:d.tableRows};
		})
		.filter(function(d){
			return d.secondaryNode != "";
		})
		.sort(function(a, b) {
			return a.secondaryNode < b.secondaryNode ? -1 : a.secondaryNode > b.secondaryNode ? 1 : 0;
		});
	
	// Merge Doubles
	secondaryNodesList = [];
	for(var i=0; i<temp_secondaryNodesList.length; i++){
		if(i==0 || temp_secondaryNodesList[i-1].secondaryNode != temp_secondaryNodesList[i].secondaryNode) {
			// The element is different from the previous one. We just add it, ok...
			secondaryNodesList.push(temp_secondaryNodesList[i]);
		} else {
			// The element is the same. Then we have to merge: add the new linked nodes.
			var currentLinkedNodesList = secondaryNodesList[secondaryNodesList.length-1].linkedNodes;
			var currentTableRows = secondaryNodesList[secondaryNodesList.length-1].tableRows;
			
			temp_secondaryNodesList[i].linkedNodes.forEach(function(candidate_linked_node){
				if(currentLinkedNodesList.every(function(linked_node){
					return linked_node != candidate_linked_node;
				})){
					// If currentLinkedNodesList contains no candidate_linked_node
					// That is, if the candidate_linked_node is new, just add it.
					currentLinkedNodesList.push(candidate_linked_node);
				}
			});
			
			temp_secondaryNodesList[i].tableRows.forEach(function(candidate_table_row){
				if(currentTableRows.every(function(table_row){
					return table_row != candidate_table_row;
				})){
					// If currentTableRows contains no candidate_table_row
					// That is, if the candidate_table_row is new, just add it.
					currentTableRows.push(candidate_table_row);
				}
			});
		}
	}
	
	console.log(secondaryNodesList.filter(function(d,i){return i<10;}));
	
	// Now we can build the bipartite graph of nodes and secondaryNodes linked.
	var links = d3.merge(secondaryNodesList.map(function(d){
		return d.linkedNodes.map(function(dd){
			return {source:dd, target:d.secondaryNode, sourceColId:nodesColumnId_1, targetColId:nodesColumnId_2, tableRows:d.tableRows};
		});
	}));
	
	// Remove doublons
	temp_links = links.sort(function(a, b) {
		return a.source+a.target < b.source+b.target ? -1 : a.source+a.target > b.source+b.target ? 1 : 0;
	});
	links = [];
	for(var i=0; i<temp_links.length; i++) {
		if(i==0 || temp_links[i-1].source != temp_links[i].source || temp_links[i-1].target != temp_links[i].target) {
			// The element is different from the previous one. We just add it.
			links.push(temp_links[i]);
		} else {
			links[links.length-1].tableRows = links[links.length-1].tableRows.concat(temp_links[i].tableRows);
		}
	}
	
	return links;
}

function getCitationLinks(nodesColumnId, nodesMultiples, nodesSeparator, linksColumnId, linksMultiples, linksSeparator){
	// localLinks.push({source:node1, target:node2, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows});

	var linksList = table.map(function(d,i){return {source:d[nodesColumnId], sourceColId:nodesColumnId, target:d[linksColumnId], targetColId:nodesColumnId, tableRows:[i]};});
	
	
	
	// Unfold by Source if there are multiples
	if(nodesMultiples){
		linksList = d3.merge(
			linksList.map(function(link){
				if(link.source){
					return link.source.split(nodesSeparator)
						.map(function(slicedSource){
							// NB: array.slice(0) is just cloning the array. This is necessary here.
							return {source:slicedSource, sourceColId:link.sourceColId, target:link.target, targetColId:link.targetColId, tableRows:link.tableRows.slice(0)};
						});
				} else {
					return [];
				}
			})
		);
	}
	
	// Unfold by Target if there are multiples
	if(linksMultiples){
		linksList = d3.merge(
			linksList.map(function(link){
				if(link.source){
					return link.target.split(linksSeparator)
						.map(function(slicedTarget){
							// NB: array.slice(0) is just cloning the array. This is necessary here.
							return {source:link.source, sourceColId:link.sourceColId, target:slicedTarget, targetColId:link.targetColId, tableRows:link.tableRows.slice(0)};
						});
				} else {
					return [];
				}
			})
		);
	}
	
	// Clean
	var temp_linksList = linksList
		.map(function(link){
			return {source:clean_expression(link.source), sourceColId:link.sourceColId, target:clean_expression(link.target), targetColId:link.targetColId, tableRows:link.tableRows};
		})
		.filter(function(link){
			return link.source != "" && link.target != "";
		})
		.sort(function(a, b) {
			var A = a.source+"  "+a.target;
			var B = b.source+"  "+b.target;
			return A < B ? -1 : A > B ? 1 : 0;
		});
	
	// Merge Doubles
	linksList = [];
	for (var i = 0; i < temp_linksList.length; i++) {
		if (i==0 || temp_linksList[i - 1].source != temp_linksList[i].source || temp_linksList[i - 1].target != temp_linksList[i].target) {
			linksList.push(temp_linksList[i]);
		} else {
			linksList[linksList.length-1].tableRows = linksList[linksList.length-1].tableRows.concat(temp_linksList[i].tableRows);
		}
	}
	
	return linksList;
}


function buildGraph(){
	
	var typeOfGraph = $("#typeOfGraph").val();
	var weightEdges = $("#edgeWeight").val() == "true";
	
	var htmlSummary = '<img src="res/';
	if(typeOfGraph == "mono"){
		htmlSummary += 'xyx.png';
	} else if(typeOfGraph == "bipartite"){
		htmlSummary += 'xy.png';
	} else if(typeOfGraph == "citation"){
		htmlSummary += 'xx.png';
	} else if(typeOfGraph == "table"){
		htmlSummary += 'x.png';
	}
	htmlSummary += '"><br/><br/><br/><ul>';
	
	tableHeader = table.shift();
	
	if(typeOfGraph == "mono"){
	
		// Monopartite Graph
		var nodesColumnId = $("#nodesCategory").val();
		var nodesMultiples = ($("#nodesMultipleSeparator").val() != "nomultiples");
		var nodesSeparator;
		if(nodesMultiples){
			if($("#nodesMultipleSeparator").val() == "coma")
				nodesSeparator = ",";
			if($("#nodesMultipleSeparator").val() == "semicolon")
				nodesSeparator = ";";
			if($("#nodesMultipleSeparator").val() == "dash")
				nodesSeparator = "-";
			if($("#nodesMultipleSeparator").val() == "space")
				nodesSeparator = " ";
			if($("#nodesMultipleSeparator").val() == "pipe")
				nodesSeparator = "|";
		}
		
		var linksColumnId = $("#linksCategory").val();
		var linksMultiples = ($("#linksMultipleSeparator").val() != "nomultiples");
		var linksSeparator;
		if(linksMultiples){
			if($("#linksMultipleSeparator").val() == "coma")
				linksSeparator = ",";
			if($("#linksMultipleSeparator").val() == "semicolon")
				linksSeparator = ";";
			if($("#linksMultipleSeparator").val() == "dash")
				linksSeparator = "-";
			if($("#linksMultipleSeparator").val() == "space")
				linksSeparator = " ";
			if($("#linksMultipleSeparator").val() == "pipe")
				linksSeparator = "|";
		}
				
		nodes = getNodes(nodesColumnId, nodesMultiples, nodesSeparator);
		links = getMonopartiteLinks(nodesColumnId, nodesMultiples, nodesSeparator, linksColumnId, linksMultiples, linksSeparator);
		
		// HTML Summary
		htmlSummary += "<li>Extraction settings:<ul>";
		htmlSummary += "<li>Type of graph: Simple (one type of node)</li>";
		htmlSummary += '<li><img src="res/x_node.png"> Nodes are from column n° '+nodesColumnId+': '+xmlEntities(tableHeader[nodesColumnId])+'</li>';
		if(nodesMultiples){
			htmlSummary += "<li>There are multiple nodes per cell, separated by \""+nodesSeparator+"\"</li>";
		}
		htmlSummary += '<li><img src="res/y_edge.png"> Links are from column n° '+linksColumnId+": "+xmlEntities(tableHeader[linksColumnId])+"</li>";
		if(linksMultiples){
			htmlSummary += "<li>There are multiple links per cell, separated by \""+linksSeparator+"\"</li>";
		}
		htmlSummary += "</ul></li>";

	} else if(typeOfGraph == "bipartite"){
		// Bipartite Graph
		var nodesColumnId1 = $("#nodesCategory1").val();
		var nodesMultiples1 = ($("#nodesMultipleSeparator1").val() != "nomultiples");
		var nodesSeparator1;
		if(nodesMultiples1){
			if($("#nodesMultipleSeparator1").val() == "coma")
				nodesSeparator1 = ",";
			if($("#nodesMultipleSeparator1").val() == "semicolon")
				nodesSeparator1 = ";";
			if($("#nodesMultipleSeparator1").val() == "dash")
				nodesSeparator1 = "-";
			if($("#nodesMultipleSeparator1").val() == "space")
				nodesSeparator1 = " ";
			if($("#nodesMultipleSeparator1").val() == "pipe")
				nodesSeparator1 = "|";
		}
		var nodesColumnId2 = $("#nodesCategory2").val();
		var nodesMultiples2 = ($("#nodesMultipleSeparator2").val() != "nomultiples");
		var nodesSeparator2;
		if(nodesMultiples2){
			if($("#nodesMultipleSeparator2").val() == "coma")
				nodesSeparator2 = ",";
			if($("#nodesMultipleSeparator2").val() == "semicolon")
				nodesSeparator2 = ";";
			if($("#nodesMultipleSeparator2").val() == "dash")
				nodesSeparator2 = "-";
			if($("#nodesMultipleSeparator2").val() == "space")
				nodesSeparator2 = " ";
			if($("#nodesMultipleSeparator2").val() == "pipe")
				nodesSeparator2 = "|";
		}
		
		var nodes1 = getNodes(nodesColumnId1, nodesMultiples1, nodesSeparator1);
		var nodes2 = getNodes(nodesColumnId2, nodesMultiples2, nodesSeparator2);
		nodes = nodes1.concat(nodes2);
		links = getBipartiteLinks(nodesColumnId1, nodesMultiples1, nodesSeparator1, nodesColumnId2, nodesMultiples2, nodesSeparator2);

		// HTML Summary
		htmlSummary += "<li>Extraction settings:<ul>";
		htmlSummary += "<li>Type of graph: Bipartite</li>";
		htmlSummary += "<li>Nodes are:<ul>"
		htmlSummary += '<li><img src="res/x_node.png"> From column n° '+nodesColumnId1+": "+xmlEntities(tableHeader[nodesColumnId1])+"</li>";
		if(nodesMultiples1){
			htmlSummary += "<li>With multiple nodes per cell, separated by \""+nodesSeparator1+"\"</li>";
		}
		htmlSummary += '<li><img src="res/y_node.png"> And from column n° '+nodesColumnId2+": "+xmlEntities(tableHeader[nodesColumnId2])+"</li>";
		if(nodesMultiples2){
			htmlSummary += "<li>With multiple nodes per cell, separated by \""+nodesSeparator2+"\"</li>";
		}
		htmlSummary += "</ul>"
		
		htmlSummary += "<li>Links are just connexions between them (same row in the table)</li>";
		htmlSummary += "</ul></li>";
		
	} else if(typeOfGraph == "citation"){
		
		// Citation network
		var nodesColumnId = $("#nodesCategory").val();
		var nodesMultiples = ($("#nodesMultipleSeparator").val() != "nomultiples");
		var nodesSeparator;
		if(nodesMultiples){
			if($("#nodesMultipleSeparator").val() == "coma")
				nodesSeparator = ",";
			if($("#nodesMultipleSeparator").val() == "semicolon")
				nodesSeparator = ";";
			if($("#nodesMultipleSeparator").val() == "dash")
				nodesSeparator = "-";
			if($("#nodesMultipleSeparator").val() == "space")
				nodesSeparator = " ";
			if($("#nodesMultipleSeparator").val() == "pipe")
				nodesSeparator = "|";
		}

		var citationLinksColumnId = $("#citationLinksCategory").val();
		var citationLinksMultiples = ($("#citationLinksMultipleSeparator").val() != "nomultiples");
		var citationLinksSeparator;
		if(citationLinksMultiples){
			if($("#citationLinksMultipleSeparator").val() == "coma")
				citationLinksSeparator = ",";
			if($("#citationLinksMultipleSeparator").val() == "semicolon")
				citationLinksSeparator = ";";
			if($("#citationLinksMultipleSeparator").val() == "dash")
				citationLinksSeparator = "-";
			if($("#citationLinksMultipleSeparator").val() == "space")
				citationLinksSeparator = " ";
			if($("#citationLinksMultipleSeparator").val() == "pipe")
				citationLinksSeparator = "|";
		}
		
		nodes = getNodes(nodesColumnId, nodesMultiples, nodesSeparator);
		links = getCitationLinks(nodesColumnId, nodesMultiples, nodesSeparator, citationLinksColumnId, citationLinksMultiples, citationLinksSeparator);
		
		// HTML Summary
		htmlSummary += "<li>Extraction settings:<ul>";
		htmlSummary += "<li>Type of graph: Citation graph</li>";
		htmlSummary += '<li><img src="res/x_node.png"> Nodes are from column n° '+nodesColumnId+": "+xmlEntities(tableHeader[nodesColumnId])+"</li>";
		if(nodesMultiples){
			htmlSummary += "<li>And there are multiple nodes per cell, separated by \""+nodesSeparator+"\"</li>";
		}
		htmlSummary += '<li><img src="res/edge.png"> Links are from column n° '+citationLinksColumnId+": "+xmlEntities(tableHeader[citationLinksColumnId])+"</li>";
		if(citationLinksMultiples){
			htmlSummary += "<li>And there are multiple links per cell, separated by \""+citationLinksSeparator+"\"</li>";
		}
		htmlSummary += "</ul></li>";
		
	} else if(typeOfGraph == "table"){
		
		// Table (No-links Graph)
		var nodesColumnId = $("#nodesCategory").val();
		var nodesMultiples = ($("#nodesMultipleSeparator").val() != "nomultiples");
		var nodesSeparator;
		if(nodesMultiples){
			if($("#nodesMultipleSeparator").val() == "coma")
				nodesSeparator = ",";
			if($("#nodesMultipleSeparator").val() == "semicolon")
				nodesSeparator = ";";
			if($("#nodesMultipleSeparator").val() == "dash")
				nodesSeparator = "-";
			if($("#nodesMultipleSeparator").val() == "space")
				nodesSeparator = " ";
			if($("#nodesMultipleSeparator").val() == "pipe")
				nodesSeparator = "|";
		}

		nodes = getNodes(nodesColumnId, nodesMultiples, nodesSeparator);
		links = [];
		
		// HTML Summary
		htmlSummary += "<li>Extraction settings:<ul>";
		htmlSummary += "<li>Type of graph: No links</li>";
		htmlSummary += '<li><img src="res/x_node.png"> Nodes are from column n° '+nodesColumnId+": "+xmlEntities(tableHeader[nodesColumnId])+"</li>";
		if(nodesMultiples){
			htmlSummary += "<li>And there are multiple nodes per cell, separated by \""+nodesSeparator+"\"</li>";
		}
		htmlSummary += "<li>There are no links</li>";
		htmlSummary += "</ul></li>";
	}
	
	// HTML Summary
	htmlSummary += "<li>Graph topology:<ul>";
	htmlSummary += "<li>"+nodes.length+" Nodes</li>";
	htmlSummary += "<li>"+links.length+" Edges</li>";
	htmlSummary += "</ul></li>";
	
	// Metadata
	var nodesExportedColumnIds = $(".nodesMetadata").toArray().filter(function(d){return $(d).attr("checked");}).map(function(d){return $(d).val();}) || [];
	var linksExportedColumnIds = $(".linksMetadata").toArray().filter(function(d){return $(d).attr("checked");}).map(function(d){return $(d).val();}) || [];
	
	// HTML Summary
	htmlSummary += "<li>Metadata:<ul>";
	if(nodesExportedColumnIds.length>0){
		htmlSummary += "<li>Nodes inherit from the source table:<ul>";
		htmlSummary += nodesExportedColumnIds.map(function(colId){
			return "<li>Column n° "+colId+": "+xmlEntities(tableHeader[colId])+"</li>";
		}).join("");
		htmlSummary += "</ul></li>";
	} else {
		htmlSummary += "<li>Nodes have no metadata</li>";
	}
	if(linksExportedColumnIds.length>0){
		htmlSummary += "<li>Links inherit from the source table:<ul>";
		htmlSummary += linksExportedColumnIds.map(function(colId){
			return "<li>Column n° "+colId+": "+xmlEntities(tableHeader[colId])+"</li>";
		}).join("");
		htmlSummary += "</ul></li>";
	} else {
		htmlSummary += "<li>Links have no metadata</li>";
	}
	htmlSummary += "</ul></li>";
	
	// Temporality
	var dynMode = $("#temporality").val();
	var dynColumnId = $("#temporalityCategory").val() || -1;
	
	// HTML Summary
	htmlSummary += "<li>Temporality: "+dynMode+((dynColumnId>=0)?(", defined by column n° "+dynColumnId+": "+xmlEntities(tableHeader[dynColumnId])+""):(""))+"</li>";
	
	
	  /////////////////////////
	 // Let's make the GEXF //
	/////////////////////////
	
	
	// Blob Builder
	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
	var bb = new BlobBuilder;
	
	
	bb.append('<?xml version="1.0" encoding="UTF-8"?><gexf xmlns="http://www.gexf.net/1.1draft" version="1.1" xmlns:viz="http://www.gexf.net/1.1draft/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gexf.net/1.1draft http://www.gexf.net/1.1draft/gexf.xsd">');
	bb.append("\n" +  '<meta lastmodifieddate="2011-06-15"><creator>GraphMaker</creator><description>Jacomy Mathieu, Sciences Po Medialab and WebAtlas</description></meta>');
	bb.append("\n" +  '<graph defaultedgetype="'+((typeOfGraph=="citation")?('directed'):('undirected'))+'" '+((dynMode!="year")?(''):('timeformat="double"'))+' mode="'+((dynMode!="year")?('static'):('dynamic'))+'">');
	
	// Nodes Attributes
	bb.append("\n" +  '<attributes class="node" mode="'+((dynMode!="year")?('static'):('dynamic'))+'">');
	bb.append("\n" +  '<attribute id="attr_type" title="Type" type="string"></attribute>');
	bb.append("\n" +  '<attribute id="global_occurrences" title="Global Occurrences Count" type="integer"></attribute>');
	nodesExportedColumnIds.forEach(function(colId){
		bb.append("\n" +  '<attribute id="attr_'+colId+'" title="'+xmlEntities(tableHeader[colId])+'" type="string"></attribute>');
	});
	bb.append("\n" +  '</attributes>');
	
	// Edges Attributes
	bb.append("\n" +  '<attributes class="edge" mode="'+((dynMode!="year")?('static'):('dynamic'))+'">');
	bb.append("\n" +  '<attribute id="attr_type" title="Type" type="string"></attribute>');
	linksExportedColumnIds.forEach(function(colId){
		bb.append("\n" +  '<attribute id="attr_'+colId+'" title="'+xmlEntities(tableHeader[colId])+'" type="string"></attribute>');
	});
	bb.append("\n" +  '</attributes>');
	
	// Nodes
	bb.append("\n" +  '<nodes>');
	nodes.forEach(function(d){
		var id = dehydrate_expression(tableHeader[d.colId])+"_"+$.md5(d.node);
		var label = d.node;
		var type = tableHeader[d.colId];
		
		bb.append("\n" +  '<node id="'+id+'" label="'+xmlEntities(label)+'">');
		
		// Dynamic
		if(dynMode=="year"){
			bb.append("\n" +  '<spells>');
			var years = [];
			d.tableRows.forEach(function(rowId){
				var year = table[rowId][dynColumnId];
				if(!years.some(function(y){return y == year;})){
					years.push(year);
				}
			});
			years.forEach(function(y){
				y = parseInt(y);
				bb.append("\n" +  '<spell start="'+y+'.0" end="'+(y+1)+'.0" />');
			});
			bb.append("\n" +  '</spells>');
		}
		
		// AttributeValues
		bb.append("\n" +  '<attvalues>');
		bb.append("\n" +  '<attvalue for="attr_type" value="'+xmlEntities(type)+'"></attvalue>');
		bb.append("\n" +  '<attvalue for="global_occurrences" value="'+d.tableRows.length+'"></attvalue>');
		
		nodesExportedColumnIds.forEach(function(colId){
			if(dynMode!="year"){
				var currentAttValue = "";
				var attValues = d.tableRows.map(function(rowId){
					return table[rowId][colId];
				}).sort(function(a, b) {
					return a < b ? -1 : a > b ? 1 : 0;
				}).filter(function(attValue){
					var result = (attValue != currentAttValue);
					currentAttValue = attValue;
					return result;
				}).join(" | ");
				
				bb.append("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'"></attvalue>');
			} else {
				attValuesPerYear = [];
				d.tableRows.forEach(function(rowId){
					var year = table[rowId][dynColumnId];
					var attValuesThisYear = attValuesPerYear[year] || [];
					
					var attValue = table[rowId][colId];
					attValuesThisYear.push(attValue);
					
					attValuesPerYear[year] = attValuesThisYear;
				});
				d3.keys(attValuesPerYear).forEach(function(year){
					var currentAttValue = "";
					var attValues = attValuesPerYear[year].sort(function(a, b) {
						return a < b ? -1 : a > b ? 1 : 0;
					}).filter(function(attValue){
						var result = (attValue != currentAttValue);
						currentAttValue = attValue;
						return result;
					}).join(" | ");
					year = parseInt(year);
					bb.append("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>');
				});
			}
		});
		
		bb.append("\n" +  '</attvalues>');
		bb.append("\n" +  '</node>');
		
	});
	bb.append("\n" +  '</nodes>');
	
	// Edges
	bb.append("\n" +  '<edges>');
	links.forEach(function(d){
		var sourceId = dehydrate_expression(tableHeader[d.sourceColId])+"_"+$.md5(d.source);
		var targetId = dehydrate_expression(tableHeader[d.targetColId])+"_"+$.md5(d.target);
		var type = tableHeader[linksColumnId];
		
		bb.append("\n" +  '<edge source="'+sourceId+'" target="'+targetId+'" '+((weightEdges)?('weight="'+d.tableRows.length+'"'):(''))+'>');
		
		// Dynamic
		if(dynMode=="year"){
			bb.append("\n" +  '<spells>');
			var years = [];
			d.tableRows.forEach(function(rowId){
				var year = table[rowId][dynColumnId];
				if(!years.some(function(y){return y == year;})){
					years.push(year);
				}
			});
			years.forEach(function(y){
				y = parseInt(y);
				bb.append("\n" +  '<spell start="'+y+'.0" end="'+(y+1)+'.0" />');
			});
			bb.append("\n" +  '</spells>');
		}
		
		// AttributeValues
		bb.append("\n" +  '<attvalues>');
		bb.append("\n" +  '<attvalue for="attr_type" value="'+xmlEntities(type)+'"></attvalue>');
		
		linksExportedColumnIds.forEach(function(colId){
			if(dynMode!="year"){
				var currentAttValue = "";
				var attValues = d.tableRows.map(function(rowId){
					return table[rowId][colId];
				}).sort(function(a, b) {
					return a < b ? -1 : a > b ? 1 : 0;
				}).filter(function(attValue){
					var result = (attValue != currentAttValue);
					currentAttValue = attValue;
					return result;
				}).join(" | ");
				
				bb.append("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'"></attvalue>');
			} else {
				attValuesPerYear = [];
				d.tableRows.forEach(function(rowId){
					var year = table[rowId][dynColumnId];
					var attValuesThisYear = attValuesPerYear[year] || [];
					
					var attValue = table[rowId][colId];
					attValuesThisYear.push(attValue);
					
					attValuesPerYear[year] = attValuesThisYear;
				});
				d3.keys(attValuesPerYear).forEach(function(year){
					var currentAttValue = "";
					var attValues = attValuesPerYear[year].sort(function(a, b) {
						return a < b ? -1 : a > b ? 1 : 0;
					}).filter(function(attValue){
						var result = (attValue != currentAttValue);
						currentAttValue = attValue;
						return result;
					}).join(" | ");
					year = parseInt(year);
					bb.append("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>');
				});
			}
		});
		bb.append("\n" +  '</attvalues>');
		bb.append("\n" +  '</edge>');
	});
	bb.append("\n" +  '</edges>');
	
	bb.append("\n" +  '</graph></gexf>');
	
	// Finalization
	htmlSummary += "</ul>";
	$("#UI").html(htmlSummary);
	$("#submitButton").show();
	$("#files").hide();
	nodes = [];
	links = [];
	$("#submitButton").click(function(){
		var blob = bb.getBlob("text/gexf+xml;charset=utf-8");
		saveAs(blob, "Network.gexf");
	});
}


// Utilities
function clean_expression(expression){
	expression = expression || "";
	return expression.replace(/ +/gi, ' ').trim().toLowerCase();
}
function dehydrate_expression(expression){
	expression = expression || "";
	return expression.replace(/[^a-zA-Z0-9]*/gi, '').trim().toLowerCase();
}
function xmlEntities(expression) {
	expression = expression || "";
    return String(expression).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function log(t){$("#log").text($("#log").text()+t);};