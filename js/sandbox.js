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
        var target = evt.target || evt.srcElement
        // evt is an ProgressEvent.
        if (evt.lengthComputable) {
            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
            // Increase the progress bar length.
            if (percentLoaded < 100) {
                var bar = $(target).parent().siblings('.progress').children('.bar')
                bar.css('width', percentLoaded + '%')
                bar.text(percentLoaded + '%')
            }
        }
    },
    handleFileSelect: function(evt) {
        var target = evt.target || evt.srcElement
        // Reset progress indicator on new file selection.
        $(target).parent().hide()
        $(target).parent().siblings('.progress').show()
        var bar = $(target).parent().siblings('.progress').children('.bar')
        bar.css('width', '0%')
        
        fileLoader.reader = new FileReader();
        fileLoader.reader.onerror = fileLoader.errorHandler;
        fileLoader.reader.onprogress = fileLoader.updateProgress;
        fileLoader.reader.onabort = function(e) {
            alert('File read cancelled');
        };
        fileLoader.reader.onloadstart = function(e) {
            var bar = $(target).parent().siblings('.progress').children('.bar')
            bar.removeClass("bar-success")
            bar.removeClass("bar-warning")
        };
        fileLoader.reader.onload = function(e) {
            // Ensure that the progress bar displays 100% at the end.
            var bar = $(target).parent().siblings('.progress').children('.bar')
            bar.css('width', '100%')
            bar.text('Reading: 100% - parsing...')
            setTimeout("fileLoader.finalize('"+target.parentNode.parentNode.id+"');", 2000)
        }
        
        fileLoader.reader.readAsText(evt.target.files[0]);
    },
    
    finalize: function(id){
        switch(id){
            case 'csvloader':
                table = d3.csv.parseRows(fileLoader.reader.result)

                // Add the row number to the table
                table.forEach(function(row, i){
                    if(i==0)
                        row.unshift('Row number')
                    else
                       row.unshift(''+i)
                })

                $('#'+id+' .progress').hide()
                $('#'+id+' .alert').addClass('alert-success')
                $('#'+id+' .alert').html('Parsing successful. '+table[0].length+' columns and '+table.length+' rows. <button type="button" class="close" data-dismiss="alert">&times;</button>')
                $('#'+id+' .alert').show()

                $("#validation").addClass("open");
                
                buildUI();
                break;
            default:
                alert('Unknown file loader');
                break;
        }
    }
}


function buildUI(){
    $("#UI").append(
        $('<div/>').html('<h4>Table preview</h4><div id="dataPreview"><table class="table table-condensed table-bordered">'
        +table.filter(function(d,i){return i<10})
            .map(function(row, i){return '<tr>'
            +row.map(function(d){return ((i==0)?('<th>'):('<td>'))+d.substr(0,200)+((i==0)?('</th>'):('</td>'));})
                .join('')
            +'</tr>';}).join('')
        +'</table></div>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12"/>').append(
                $('<hr/>')
            ).append(
                $('<h2/>').text('1. Type of Network')
            ).append(
                $('<div class="row"/>').append(
                    $('<div class="span6"/>').append(
                        $('<select id="typeOfGraph" class="span6"/>')
                            .append($('<option value="none">Choose type of network...</option>'))
                            .append($('<option value="mono">Normal (one type of node)</option>'))
                            .append($('<option value="bipartite">Bipartite (two types of nodes)</option>'))
                            .append($('<option value="citation">Citations</option>'))
                            .append($('<option value="table">No link</option>'))
                            .on('change', buildUI_set)
                    ).append(
                        $('<div id="typeOfGraph_img"/>')
                            .css('padding-top', '20px')
                    )
                ).append(
                    $('<div class="span6" id="typeOfGraph_help"/>').append(
                        $('<p class="text-info"/>').text(
                            'You may extract different types of networks from a table. It depends on how you use columns to build the nodes and the edges. '
                        )
                    ).append(
                        $('<p class="text-info"/>').append(
                            $('<ul/>').append(
                                $('<li><img id="network_type1_img" class="pull-right" src="res/xyx_disabled.png"/><strong>Normal: </strong> if you want a single type of nodes, for instance <em>authors</em>. They will be linked when they share a value in another column, for instance <em>papers</em>.</li>')
                                    .css('padding-bottom', '20px')
                            ).append(
                                $('<li><img id="network_type1_img" class="pull-right" src="res/xy_disabled.png"/><strong>Bipartite: </strong> if you want two types of nodes, for instance <em>authors</em> and <em>papers</em>, they will be linked whey they appear in the same row of the table.</li>')
                                    .css('padding-bottom', '20px')
                            ).append(
                                $('<li><img id="network_type1_img" class="pull-right" src="res/xx_disabled.png"/><strong>Citation: </strong> if you have a column containing references to another one, for instance <em>paper title</em> and <em>cited papers (title)</em></li>')
                                    .css('padding-bottom', '20px')
                            ).append(
                                $('<li><img id="network_type1_img" class="pull-right" src="res/x_disabled.png"/><strong>No link: </strong> a single type of nodes, without link</li>')
                                    .css('padding-bottom', '20px')
                            )
                        )
                    )
                )
            ).append(
                $('<div class="row"/>').append(
                    $('<div class="span12" id="buildUI_result"/>')
                )
            )
        )
    )
    buildUI_set()
    
}

function buildUI_set(){
    if($("#typeOfGraph").val() == "none"){
        $('#typeOfGraph_img').html('')

        $("#buildUI_result").html('');
        
    } else if($("#typeOfGraph").val() == "mono"){
        $('#typeOfGraph_img').html('<p><img id="network_type1_img" src="res/xyx.png"/></p>')
            .append(
                $('<p>You will have to choose:<ul><li>Which column <img src="res/x_node.png"> will define the nodes</li><li>Which column <img src="res/y_edge.png"> will define the links</li></ul></p>')
            )

        nodesColumn_build("#buildUI_result");
            
    } else if($("#typeOfGraph").val() == "bipartite"){
        $('#typeOfGraph_img').html('<img id="network_type1_img" src="res/xy.png"/>')
            .append(
                $('<p>You will have to choose:<ul><li>Which column <img src="res/x_node.png"> will define the first type of nodes</li><li>Which column <img src="res/y_node.png"> will define the second type of nodes</li></ul></p>')
            )

        nodesColumn1_build("#buildUI_result");
        
    } else if($("#typeOfGraph").val() == "citation"){
        $('#typeOfGraph_img').html('<img id="network_type1_img" src="res/xx.png"/>')
            .append(
                $('<p>You will have to choose:<ul><li>Which column <img src="res/x_node.png"> contains the identifiers of the nodes</li><li>Which column <img src="res/edge.png"> contains the identifiers of the cited nodes</li></ul></p>')
            )

        nodesColumn_build("#buildUI_result");
            
    } else if($("#typeOfGraph").val() == "table"){
        $('#typeOfGraph_img').html('<img id="network_type1_img" src="res/x.png"/>')
            .append(
                $('<p>You will have to choose:<ul><li>Which column <img src="res/x_node.png"> defines the nodes</li></ul></p>')
            )

        nodesColumn_build("#buildUI_result");
            
    } else {
        $("#buildUI_result").html('<div class="alert"><strong>Warning!</strong> This option is not supported yet.</div>')
    }
    $("#submitButton").hide();
}

function nodesColumn_build(parentId){
    $(parentId).html('').append(
        $('<hr/><h2>2. Nodes</h2>')
    ).append(
        $('<h4><img src="res/x_node.png"> Which column defines the nodes?</h4>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<select id="nodesCategory" class="span6"/>')
                    .append($('<option value="none">Choose a column...</option>'))
                    .append(table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}))
                    .on('change', nodesColumn_set)
            ).append(
                $('<select id="nodesMultipleSeparator" class="span6"/>')
                    .append($('<option value="nomultiples">One expression per cell</option>'))
                    .append($('<option value="coma">Comma-separated ","</option>'))
                    .append($('<option value="semicolon">Semicolon-separated ";"</option>'))
                    .append($('<option value="dash">Dash-separated "-"</option>'))
                    .append($('<option value="space">Space-separated " "</option>'))
                    .append($('<option value="pipe">Pipe-separated "|"</option>'))
                    .on('change', nodesColumn_set)
            ).append(
                $('<div class="row"/>').append(
                    $('<div class="span6"  id="nodesColumn_example"/>')
                )
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'The expressions in this column will define the nodes. Some cleaning will be applied (unnecessary spaces, upper case...)'
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>If you have multiple items per cell, specify the separator</strong>. '
                    +'For instance you have a list of papers, you want a graph of authors, and the cells look like this: "Enstein; Erdös; Bacon". '
                    +'You have multiple authors per cell. Then you have to set the separator, here the semicolon ";".'
                )
            )
        )
    ).append(
        $('<div class="row"/>').css('margin-top', '20px').append(
            $('<div class="span12"/>').append(
                $('<h4><img src="res/x_node.png"> Do you want nodes attributes?</h4>')
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<a style="width:100%;" id="nodes_metadata"> </a>')
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'You may transfer the content of some columns to the network as attributes of the nodes. '
                    +'This feature is only useful under certain circumstances, when the attribute columns actually qualify the node column. '
                    +'Else, it is possible (and probable) that multiple attributes correspond to a single node. If this happens, the multiple values will be concatenated with the | separator (pipe). '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>Warning: </strong>Adding metadata may cause a memory overload (a browser crash, not dangerous but you won\'t get any result)'
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12" id="nodesColumn_result"/>')
        )
    )

    // Deal with metadata selector
    $("#nodes_metadata").select2({
        query: function (query) {
            var data = {results: []}, i, j, s
            
            table[0].forEach(function(colname, i){
                if(colname.toLowerCase().match(query.term.toLowerCase()))
                    data.results.push({id: i, text: colname});
            })
            query.callback(data);
        },
        multiple:true,
        placeholder: "Select one or several columns",
        allowClear: true
    })
    //$("#nodes_metadata").on("change", function(e){})
}

function nodesColumn_example(){
    // Fetch some examples
    var nodesSamples = []
        ,threshold = 5
    while(nodesSamples.length<threshold){
        var line = 1 + Math.floor( Math.random() * ( table.length - 1 ) )
            ,cell = table[line][+$('#nodesCategory').val()]
            ,separator
            ,expressions
        switch ($("#nodesMultipleSeparator").val()){
            case 'coma':
                separator = ','
                break
            case 'semicolon':
                separator = ';'
                break
            case 'dash':
                separator = '-'
                break
            case 'space':
                separator = ' '
                break
            case 'pipe':
                separator = '|'
                break
        }
        if($("#nodesMultipleSeparator").val() != 'none')
            expressions = cell.split(separator)
        else
            expressions = [cell]
        expressions.map(function(d){
            return clean_expression(d)
        }).filter(function(d, i){
            return d != ""
        }).forEach(function(d){
            nodesSamples.push(d)
        })
    }
    nodesSamples = nodesSamples.filter(function(d,i){return i<threshold})

    // Display
    $('#nodesColumn_example').html('').append(
        $('<p/>').html('<strong>Sample of nodes</strong> extracted with these settings:').append(
            $('<button class="btn btn-link">(<i class="icon-refresh"/> sample)</button>').click(nodesColumn_example)
        )
    ).append(
        $('<p/>').append(
            nodesSamples.map(function(expression){return $('<span class="label label-info"/>').text(expression).after($('<span> </span>'))})
        )
    )
}

function nodesColumn_set(){
    if($("#nodesCategory").val() == "none"){
        $("#nodesColumn_result").html('')
        $("#nodesColumn_example").html('')
    } else {
        nodesColumn_example()
        if($("#typeOfGraph").val() == "mono"){
            linksCategory_build("#nodesColumn_result")
        } else if($("#typeOfGraph").val() == "citation"){
            citationLinkCategory_build("#nodesColumn_result")
        } else if($("#typeOfGraph").val() == "table"){
            nolink_build("#nodesColumn_result")
        }
    }
    $("#submitButton").hide()
}

function nodesColumn1_build(parentId){
    $(parentId).html('').append(
        $('<hr/><h2>2. Nodes</h2>')
    ).append(
        $('<h4><img src="res/x_node.png"> Which column defines the <em>first type</em> of nodes?</h4>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<select id="nodesCategory1" class="span6"/>')
                    .append($('<option value="none">Choose a column...</option>'))
                    .append(table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}))
                    .on('change', nodesColumn1_set)
            ).append(
                $('<select id="nodesMultipleSeparator1" class="span6"/>')
                    .append($('<option value="nomultiples">One expression per cell</option>'))
                    .append($('<option value="coma">Comma-separated ","</option>'))
                    .append($('<option value="semicolon">Semicolon-separated ";"</option>'))
                    .append($('<option value="dash">Dash-separated "-"</option>'))
                    .append($('<option value="space">Space-separated " "</option>'))
                    .append($('<option value="pipe">Pipe-separated "|"</option>'))
                    .on('change', nodesColumn1_set)
            ).append(
                $('<div class="row"/>').append(
                    $('<div class="span6"  id="nodesColumn1_example"/>')
                )
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'The expressions in this column will define the <strong>first type</strong> of nodes. Some cleaning will be applied (unnecessary spaces, upper case...)'
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>If you have multiple items per cell, specify the separator</strong>. '
                    +'For instance you have a list of papers, you want a graph of authors and papers, and the cells of the <em>Author</em> column look like this: "Enstein; Erdös; Bacon". '
                    +'You have multiple authors per cell. Then you have to set the separator, here the semicolon ";".'
                )
            )
        )
    ).append(
        $('<div class="row"/>').css('margin-top', '20px').append(
            $('<div class="span12"/>').append(
                $('<h4><img src="res/x_node.png"> Do you want attributes for the <em>first type</em> of nodes?</h4>')
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<a style="width:100%;" id="nodes1_metadata"> </a>')
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'You may transfer the content of some columns to the network as attributes of the <strong>first type</strong> of nodes. '
                    +'This feature is only useful under certain circumstances, when the attribute columns actually qualify the node column. '
                    +'Else, it is possible (and probable) that multiple attributes correspond to a single node. If this happens, the multiple values will be concatenated with the | separator (pipe). '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>Warning: </strong>Adding metadata may cause a memory overload (a browser crash, not dangerous but you won\'t get any result)'
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12" id="nodesColumn1_result"/>')
        )
    )

    // Deal with metadata selector
    $("#nodes1_metadata").select2({
        query: function (query) {
            var data = {results: []}, i, j, s
            
            table[0].forEach(function(colname, i){
                if(colname.toLowerCase().match(query.term.toLowerCase()))
                    data.results.push({id: i, text: colname});
            })
            query.callback(data);
        },
        multiple:true,
        placeholder: "Select one or several columns",
        allowClear: true
    })
}

function nodesColumn1_example(){
    // Fetch some examples
    var nodesSamples = []
        ,threshold = 5
    while(nodesSamples.length<threshold){
        var line = 1 + Math.floor( Math.random() * ( table.length - 1 ) )
            ,cell = table[line][+$('#nodesCategory1').val()]
            ,separator
            ,expressions
        switch ($("#nodesMultipleSeparator1").val()){
            case 'coma':
                separator = ','
                break
            case 'semicolon':
                separator = ';'
                break
            case 'dash':
                separator = '-'
                break
            case 'space':
                separator = ' '
                break
            case 'pipe':
                separator = '|'
                break
        }
        if($("#nodesMultipleSeparator1").val() != 'none')
            expressions = cell.split(separator)
        else
            expressions = [cell]
        expressions.map(function(d){
            return clean_expression(d)
        }).filter(function(d, i){
            return d != ""
        }).forEach(function(d){
            nodesSamples.push(d)
        })
    }
    nodesSamples = nodesSamples.filter(function(d,i){return i<threshold})

    // Display
    $('#nodesColumn1_example').html('').append(
        $('<p/>').html('<strong>Sample of nodes</strong> extracted with these settings:').append(
            $('<button class="btn btn-link">(<i class="icon-refresh"/> sample)</button>').click(nodesColumn1_example)
        )
    ).append(
        $('<p/>').append(
            nodesSamples.map(function(expression){return $('<span class="label label-info"/>').text(expression).after($('<span> </span>'))})
        )
    )
}

function nodesColumn1_set(){
    if($("#nodesCategory1").val() == "none"){
        $("#nodesColumn1_result").html('')
        $("#nodesColumn1_example").html('')
    } else {
        nodesColumn1_example()
        nodesColumn2_build("#nodesColumn1_result")
    }
    $("#submitButton").hide()
}

function nodesColumn2_build(parentId){
    $(parentId).html('').append(
        $('<h4><img src="res/y_node.png"> Which column defines the <em>second type</em> of nodes?</h4>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<select id="nodesCategory2" class="span6"/>')
                    .append($('<option value="none">Choose a column...</option>'))
                    .append(table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}))
                    .on('change', nodesColumn2_set)
            ).append(
                $('<select id="nodesMultipleSeparator2" class="span6"/>')
                    .append($('<option value="nomultiples">One expression per cell</option>'))
                    .append($('<option value="coma">Comma-separated ","</option>'))
                    .append($('<option value="semicolon">Semicolon-separated ";"</option>'))
                    .append($('<option value="dash">Dash-separated "-"</option>'))
                    .append($('<option value="space">Space-separated " "</option>'))
                    .append($('<option value="pipe">Pipe-separated "|"</option>'))
                    .on('change', nodesColumn2_set)
            ).append(
                $('<div class="row"/>').append(
                    $('<div class="span6"  id="nodesColumn2_example"/>')
                )
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'The expressions in this column will define the <strong>second type</strong> of nodes. '
                    +'Typically if you have a list of papers and you want a bipartite graph of authors and papers, select <em>Author</em> as the first type of nodes and <em>Title</em> as the second type of nodes. '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>If you have multiple items per cell, specify the separator</strong>. '
                )
            )
        )
    ).append(
        $('<div class="row"/>').css('margin-top', '20px').append(
            $('<div class="span12"/>').append(
                $('<h4><img src="res/y_node.png"> Do you want attributes for the <em>second type</em> of nodes?</h4>')
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<a style="width:100%;" id="nodes2_metadata"> </a>')
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'You may transfer the content of some columns to the network as attributes of the <strong>second type</strong> of nodes. '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>Warning: </strong>Adding metadata may cause a memory overload (a browser crash, not dangerous but you won\'t get any result)'
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12" id="nodesColumn2_result"/>')
        )
    )

    // Deal with metadata selector
    $("#nodes2_metadata").select2({
        query: function (query) {
            var data = {results: []}, i, j, s
            
            table[0].forEach(function(colname, i){
                if(colname.toLowerCase().match(query.term.toLowerCase()))
                    data.results.push({id: i, text: colname});
            })
            query.callback(data);
        },
        multiple:true,
        placeholder: "Select one or several columns",
        allowClear: true
    })
}

function nodesColumn2_example(){
    // Fetch some examples
    var nodesSamples = []
        ,threshold = 5
    while(nodesSamples.length<threshold){
        var line = 1 + Math.floor( Math.random() * ( table.length - 1 ) )
            ,cell = table[line][+$('#nodesCategory2').val()]
            ,separator
            ,expressions
        switch ($("#nodesMultipleSeparator2").val()){
            case 'coma':
                separator = ','
                break
            case 'semicolon':
                separator = ';'
                break
            case 'dash':
                separator = '-'
                break
            case 'space':
                separator = ' '
                break
            case 'pipe':
                separator = '|'
                break
        }
        if($("#nodesMultipleSeparator2").val() != 'none')
            expressions = cell.split(separator)
        else
            expressions = [cell]
        expressions.map(function(d){
            return clean_expression(d)
        }).filter(function(d, i){
            return d != ""
        }).forEach(function(d){
            nodesSamples.push(d)
        })
    }
    nodesSamples = nodesSamples.filter(function(d,i){return i<threshold})

    // Display
    $('#nodesColumn2_example').html('').append(
        $('<p/>').html('<strong>Sample of nodes</strong> extracted with these settings:').append(
            $('<button class="btn btn-link">(<i class="icon-refresh"/> sample)</button>').click(nodesColumn2_example)
        )
    ).append(
        $('<p/>').append(
            nodesSamples.map(function(expression){return $('<span class="label label-info"/>').text(expression).after($('<span> </span>'))})
        )
    )
}

function nodesColumn2_set(){
    if($("#nodesCategory2").val() == "none"){
        $("#nodesColumn2_result").html('')
        $("#nodesColumn2_example").html('')
    } else {
        nodesColumn2_example()
        nolink_build("#nodesColumn2_result")
    }
    $("#submitButton").hide()
}

function nolink_build(parentId){
    $(parentId).html('').append(
        $('<hr/><h2>3. Links</h2>')
    ).append(
        $('<p>You have nothing to set here.</p>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12" id="linksCategory_result"/>')
        )
    )
    additionalsettings_build("#linksCategory_result")
}

function citationLinkCategory_build(parentId){
    $(parentId).html('').append(
        $('<hr/><h2>3. Links</h2>')
    ).append(
        $('<h4><img src="res/edge.png"> Which column defines the citation links?</h4>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<select id="citationLinksCategory" class="span6"/>')
                    .append($('<option value="none">Choose a column...</option>'))
                    .append(table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}))
                    .on('change', citationLinksCategory_set)
            ).append(
                $('<select id="citationLinksMultipleSeparator" class="span6"/>')
                    .append($('<option value="nomultiples">One expression per cell</option>'))
                    .append($('<option value="coma">Comma-separated ","</option>'))
                    .append($('<option value="semicolon">Semicolon-separated ";"</option>'))
                    .append($('<option value="dash">Dash-separated "-"</option>'))
                    .append($('<option value="space">Space-separated " "</option>'))
                    .append($('<option value="pipe">Pipe-separated "|"</option>'))
                    .on('change', citationLinksCategory_set)
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'The expressions in this column will define the citation links. '
                    +'<strong>The expressions must match the nodes.</strong> '
                    +'For instance if the nodes are <em>Paper titles</em> then this column must contain paper titles as well. However do not use the same column. The cited papers may have a different column name like <em>References</em>. '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>You certainly have multiple items per cell, please specify the separator</strong>. '
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"  id="citationLinksCategory_example"/>')
        )
    ).append(
        $('<div class="row"/>').css('margin-top', '20px').append(
            $('<div class="span12"/>').append(
                $('<h4><img src="res/edge.png"> Do you want attributes for citation links?</h4>')
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<a style="width:100%;" id="citationLinks_metadata"> </a>')
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'You may transfer the content of some columns to the network as attributes of the citation links. '
                    +'This feature is only useful under certain circumstances, when the attribute columns actually qualify the links column. '
                    +'In case of multiple values, they will be concatenated with the | separator (pipe). '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>Warning: </strong>Adding metadata may cause a memory overload (a browser crash, not dangerous but you won\'t get any result)'
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12" id="citationLinksCategory_result"/>')
        )
    )

    // Deal with metadata selector
    $("#citationLinks_metadata").select2({
        query: function (query) {
            var data = {results: []}, i, j, s
            
            table[0].forEach(function(colname, i){
                if(colname.toLowerCase().match(query.term.toLowerCase()))
                    data.results.push({id: i, text: colname});
            })
            query.callback(data);
        },
        multiple:true,
        placeholder: "Select one or several columns",
        allowClear: true
    })
}

function citationLinksCategory_example(){
    // Fetch some examples
    var nodesSamples = []
        ,threshold = 5
    while(nodesSamples.length<threshold){
        var line = 1 + Math.floor( Math.random() * ( table.length - 1 ) )
            ,cell = table[line][+$('#citationLinksCategory').val()]
            ,separator
            ,expressions
        switch ($("#citationLinksMultipleSeparator").val()){
            case 'coma':
                separator = ','
                break
            case 'semicolon':
                separator = ';'
                break
            case 'dash':
                separator = '-'
                break
            case 'space':
                separator = ' '
                break
            case 'pipe':
                separator = '|'
                break
        }
        if($("#citationLinksMultipleSeparator").val() != 'none')
            expressions = cell.split(separator)
        else
            expressions = [cell]
        expressions.map(function(d){
            return clean_expression(d)
        }).filter(function(d, i){
            return d != ""
        }).forEach(function(d){
            nodesSamples.push(d)
        })
    }
    nodesSamples = nodesSamples.filter(function(d,i){return i<threshold})

    // Display
    $('#citationLinksCategory_example').html('').append(
        $('<p/>').html('<strong>Sample of items</strong> extracted with these settings:').append(
            $('<button class="btn btn-link">(<i class="icon-refresh"/> sample)</button>').click(citationLinksCategory_example)
        )
    ).append(
        $('<p/>').append(
            nodesSamples.map(function(expression){return $('<span class="label label-info"/>').text(expression).after($('<span> </span>'))})
        )
    )
}

function citationLinksCategory_set(){
    if($("#citationLinksCategory").val() == "none"){
        $("#citationLinksCategory_result").html('')
        $("#citationLinksCategory_example").html('')
    } else if($("#citationLinksCategory").val() == $("#nodesCategory").val()){
        citationLinksCategory_example()
        $("#citationLinksCategory_example").html('')
        $("#citationLinksCategory_result").html('<div class="alert"><strong>Warning!</strong> You cannot chose the same column for nodes and links.</div>')
    } else {
        citationLinksCategory_example()
        additionalsettings_build("#citationLinksCategory_result")
    }
    $("#submitButton").hide();
}

function linksCategory_build(parentId){
    $(parentId).html('').append(
        $('<hr/><h2>3. Links</h2>')
    ).append(
        $('<h4><img src="res/y_edge.png"> Which column defines the links?</h4>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<select id="linksCategory" class="span6"/>')
                    .append($('<option value="none">Choose a column...</option>'))
                    .append(table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}))
                    .on('change', linksCategory_set)
            ).append(
                $('<select id="edgesMultipleSeparator" class="span6"/>')
                    .append($('<option value="nomultiples">One expression per cell</option>'))
                    .append($('<option value="coma">Comma-separated ","</option>'))
                    .append($('<option value="semicolon">Semicolon-separated ";"</option>'))
                    .append($('<option value="dash">Dash-separated "-"</option>'))
                    .append($('<option value="space">Space-separated " "</option>'))
                    .append($('<option value="pipe">Pipe-separated "|"</option>'))
                    .on('change', linksCategory_set)
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'The expressions in this column will define the links. '
                    +'<strong>Two nodes will be linked when they have an item in common in this column.</strong> '
                    +' Some cleaning will be applied (unnecessary spaces, upper case...) '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>If you have multiple items per cell, specify the separator</strong>. '
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"  id="linksCategory_example"/>')
        )
    ).append(
        $('<div class="row"/>').css('margin-top', '20px').append(
            $('<div class="span12"/>').append(
                $('<h4><img src="res/y_edge.png"> Do you want links attributes?</h4>')
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<a style="width:100%;" id="links_metadata"> </a>')
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'You may transfer the content of some columns to the network as attributes of the links. '
                    +'This feature is only useful under certain circumstances, when the attribute columns actually qualify the links column. '
                    +'In case of multiple values, they will be concatenated with the | separator (pipe). '
                )
            ).append(
                $('<p class="text-info"/>').html(
                    '<strong>Warning: </strong>Adding metadata may cause a memory overload (a browser crash, not dangerous but you won\'t get any result)'
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12" id="linksCategory_result"/>')
        )
    )

    // Deal with metadata selector
    $("#links_metadata").select2({
        query: function (query) {
            var data = {results: []}, i, j, s
            
            table[0].forEach(function(colname, i){
                if(colname.toLowerCase().match(query.term.toLowerCase()))
                    data.results.push({id: i, text: colname});
            })
            query.callback(data);
        },
        multiple:true,
        placeholder: "Select one or several columns",
        allowClear: true
    })
}

function linksCategory_example(){
    // Fetch some examples
    var nodesSamples = []
        ,threshold = 5
    while(nodesSamples.length<threshold){
        var line = 1 + Math.floor( Math.random() * ( table.length - 1 ) )
            ,cell = table[line][+$('#linksCategory').val()]
            ,separator
            ,expressions
        switch ($("#edgesMultipleSeparator").val()){
            case 'coma':
                separator = ','
                break
            case 'semicolon':
                separator = ';'
                break
            case 'dash':
                separator = '-'
                break
            case 'space':
                separator = ' '
                break
            case 'pipe':
                separator = '|'
                break
        }
        if($("#edgesMultipleSeparator").val() != 'none')
            expressions = cell.split(separator)
        else
            expressions = [cell]
        expressions.map(function(d){
            return clean_expression(d)
        }).filter(function(d, i){
            return d != ""
        }).forEach(function(d){
            nodesSamples.push(d)
        })
    }
    nodesSamples = nodesSamples.filter(function(d,i){return i<threshold})

    // Display
    $('#linksCategory_example').html('').append(
        $('<p/>').html('<strong>Sample of items</strong> extracted with these settings:').append(
            $('<button class="btn btn-link">(<i class="icon-refresh"/> sample)</button>').click(linksCategory_example)
        )
    ).append(
        $('<p/>').append(
            nodesSamples.map(function(expression){return $('<span class="label label-info"/>').text(expression).after($('<span> </span>'))})
        )
    )
}

function linksCategory_set(){
    if($("#linksCategory").val() == "none"){
        $("#linksCategory_result").html('')
        $("#linksCategory_example").html('')
    } else if($("#linksCategory").val() == $("#nodesCategory").val()){
        linksCategory_example()
        $("#linksCategory_example").html('')
        $("#linksCategory_result").html('<div class="alert"><strong>Warning!</strong> You cannot chose the same column for nodes and links.</div>')
    } else {
        linksCategory_example()
        additionalsettings_build("#linksCategory_result")
    }
    $("#submitButton").hide();
}

function additionalsettings_build(parentId){
    $(parentId).html('').append(
        $('<hr/><h2>4. Additional settings</h2>')
    ).append(
        $('<h4>Optional: time series</h4>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<select id="temporality" class="span6"/>')
                    .append($('<option value="none">No temporal data</option>'))
                    .append(table[0].map(function(d,i){return '<option value="'+i+'">'+d+'</option>';}))
                    //.on('change', linksCategory_set)
            ).append(
                $('<span class="help-block">Select only a column containing <strong>integers</strong>.</span>')
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'You may select an attribute a column describing time. '
                    +'<strong>It will only work if it contains integers</strong> (1, 2, 3...), and thus typically works with <strong>years</strong>. '
                    +'It does not handle full dates. '
                )
            )
        )
    ).append(
        $('<h4>Optional: edge weight</h4>')
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<select id="edgeWeight" class="span6"/>')
                    .append($('<option value="false" selected="true">No weight</option>'))
                    .append($('<option value="true">Weight the edges</option>'))
                    //.on('change', linksCategory_set)
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'Links are naturally ranked by the number of rows matching in the table between the connected nodes. You may choose to weight the links according to it. '
                )
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span12"/>').append(
                $('<hr/><h2>5. Build the network</h2>')
            )
        )
    ).append(
        $('<div class="row"/>').append(
            $('<div class="span6"/>').append(
                $('<div id="build_container"/>').append(
                    $('<button value="Build" class="btn btn-block btn-primary"><i class="icon-download icon-white"/> Build and download the network (GEXF)</button>')
                        .click(buildGraph)
                ).append(
                    $('<span class="help-block"/>').text('NB: this may take a while, please be patient.')
                )
            )
        ).append(
            $('<div class="span6"/>').append(
                $('<p class="text-info"/>').html(
                    'After building the network, the download will trigger automatically. '
                    +'The network file is a <strong>GEXF</strong>, the <a href="http://gephi.org">Gephi</a> file format. '
                )
            )
        )
    )
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
        // There is only one linked node if there are no multiples for nodes, of course...
        
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
                subGhostNodes = (d.ghostNode || '').split(linksSeparator);
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
                        localLinks.push({source:node1, target:node2, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows, ghostNodes: [d.ghostNode]});
                    } else {
                        localLinks.push({source:node2, target:node1, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows, ghostNodes: [d.ghostNode]});
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
            links[links.length-1].ghostNodes = links[links.length-1].ghostNodes.concat(temp_links[i].ghostNodes);
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
            // The element is different from the previous one. We add it and we reformat tableRows
            secondaryNodesList.push({
                secondaryNode:    temp_secondaryNodesList[i].secondaryNode
            ,   linkedNodes:      temp_secondaryNodesList[i].linkedNodes
                                    .map(function(d){
                                            return {node: d, tableRows: temp_secondaryNodesList[i].tableRows}
                                        })
            });
        } else {
            // The element is the same. Then we have to merge: add the new linked nodes.
            var currentLinkedNodesList = secondaryNodesList[secondaryNodesList.length-1].linkedNodes;
            
            temp_secondaryNodesList[i].linkedNodes.forEach(function(candidate_linked_node){
                if(currentLinkedNodesList.every(function(linked_node){
                    return linked_node.node != candidate_linked_node;
                })){
                    // If currentLinkedNodesList contains no candidate_linked_node
                    // That is, if the candidate_linked_node is new, just add it.
                    currentLinkedNodesList.push({
                        node: candidate_linked_node
                    ,   tableRows: temp_secondaryNodesList[i].tableRows
                    });
                } else {
                    // Else add the tableRows to previous tableRows if currentLinkedNodesList contains a candidate_linked_node
                    currentLinkedNodesList.forEach(function(linked_node){
                        if(linked_node.node == candidate_linked_node){
                            temp_secondaryNodesList[i].tableRows.forEach(function(tr){
                                if(linked_node.tableRows.indexOf(tr) < 0){
                                    linked_node.tableRows.push(tr)
                                }
                            })
                            
                        }
                    })
                }

            });
            
            
        }
    }

    // Now we can build the bipartite graph of nodes and secondaryNodes linked.
    var links = d3.merge(secondaryNodesList.map(function(d){
        return d.linkedNodes.map(function(dd){
            return {source:dd.node, target:d.secondaryNode, sourceColId:nodesColumnId_1, targetColId:nodesColumnId_2, tableRows:dd.tableRows};
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
    // UI: display progress bar
    $('#build_container').html('<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>')
    $('select').attr('disabled', 'true')
    setTimeout(buildGraph_, 10)
}

function buildGraph_(){
    
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
        var linksMultiples = ($("#edgesMultipleSeparator").val() != "nomultiples");
        var linksSeparator;
        if(linksMultiples){
            if($("#edgesMultipleSeparator").val() == "coma")
                linksSeparator = ",";
            if($("#edgesMultipleSeparator").val() == "semicolon")
                linksSeparator = ";";
            if($("#edgesMultipleSeparator").val() == "dash")
                linksSeparator = "-";
            if($("#edgesMultipleSeparator").val() == "space")
                linksSeparator = " ";
            if($("#edgesMultipleSeparator").val() == "pipe")
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
    var nodesExportedColumnIds
        ,linksExportedColumnIds
    if(typeOfGraph == 'mono'){
        if($('#nodes_metadata').val() != '')
            nodesExportedColumnIds = $('#nodes_metadata').val().split(',')
        else
            nodesExportedColumnIds = []
        if($('#links_metadata').val() != '')
            linksExportedColumnIds = $('#links_metadata').val().split(',')
        else
            linksExportedColumnIds = []
    } else if(typeOfGraph == 'bipartite'){
        var nodesExportedColumnIds_1 = []
        if($('#nodes1_metadata').val() != '')
            nodesExportedColumnIds_1 = $('#nodes1_metadata').val().split(',')
        var nodesExportedColumnIds_2 = []
        if($('#nodes2_metadata').val() != '')
            nodesExportedColumnIds_2 = $('#nodes2_metadata').val().split(',')
        nodesExportedColumnIds = [nodesExportedColumnIds_1, nodesExportedColumnIds_2]
        linksExportedColumnIds = []
    } else if(typeOfGraph == 'citation'){
        if($('#nodes_metadata').val() != '')
            nodesExportedColumnIds = $('#nodes_metadata').val().split(',')
        else
            nodesExportedColumnIds = []
        if($('#citationLinks_metadata').val() != '')
            linksExportedColumnIds = $('#citationLinks_metadata').val().split(',')
        else
            linksExportedColumnIds = []
    } else if(typeOfGraph == 'table'){
        if($('#nodes_metadata').val() != '')
            nodesExportedColumnIds = $('#nodes_metadata').val().split(',')
        else
            nodesExportedColumnIds = []
        linksExportedColumnIds = []
    }
    
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
    var dynMode, dynColumnId
    if($("#temporality").val() == 'none'){
        dynMode = 'none'
        dynColumnId = -1
    } else {
        dynMode = 'year'
        dynColumnId = +$("#temporality").val()
    }

    // HTML Summary
    htmlSummary += "<li>Temporality: "+dynMode+((dynColumnId>=0)?(", defined by column n° "+dynColumnId+": "+xmlEntities(tableHeader[dynColumnId])+""):(""))+"</li>";
    
    
      /////////////////////////
     // Let's make the GEXF //
    /////////////////////////
    
    
    var content = []
    
    content.push('<?xml version="1.0" encoding="UTF-8"?><gexf xmlns="http://www.gexf.net/1.1draft" version="1.1" xmlns:viz="http://www.gexf.net/1.1draft/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gexf.net/1.1draft http://www.gexf.net/1.1draft/gexf.xsd">');
    content.push("\n" +  '<meta lastmodifieddate="2011-06-15"><creator>GraphMaker</creator><description>Jacomy Mathieu, Sciences Po Medialab and WebAtlas</description></meta>');
    content.push("\n" +  '<graph defaultedgetype="'+((typeOfGraph=="citation")?('directed'):('undirected'))+'" '+((dynMode!="year")?(''):('timeformat="double"'))+' mode="'+((dynMode!="year")?('static'):('dynamic'))+'">');
    
    // Nodes Attributes
    content.push("\n" +  '<attributes class="node" mode="'+((dynMode!="year")?('static'):('dynamic'))+'">');
    content.push("\n" +  '<attribute id="attr_type" title="Type" type="string"></attribute>');
    content.push("\n" +  '<attribute id="global_occurrences" title="Occurrences Count" type="integer"></attribute>');
    if(typeOfGraph == 'bipartite'){
        nodesExportedColumnIds[0].forEach(function(colId){
            content.push("\n" +  '<attribute id="attr_1_'+colId+'" title="'+xmlEntities(tableHeader[colId])+' (type 1)" type="string"></attribute>')
        })
        nodesExportedColumnIds[1].forEach(function(colId){
            content.push("\n" +  '<attribute id="attr_2_'+colId+'" title="'+xmlEntities(tableHeader[colId])+' (type 2)" type="string"></attribute>')
        })
    } else {
        nodesExportedColumnIds.forEach(function(colId){
            content.push("\n" +  '<attribute id="attr_'+colId+'" title="'+xmlEntities(tableHeader[colId])+'" type="string"></attribute>')
        })
    }
    content.push("\n" +  '</attributes>');
    
    // Edges Attributes
    content.push("\n" +  '<attributes class="edge" mode="'+((dynMode!="year")?('static'):('dynamic'))+'">');
    content.push("\n" +  '<attribute id="attr_type" title="Type" type="string"></attribute>');
    content.push("\n" +  '<attribute id="matchings_count" title="Matchings Count" type="integer"></attribute>');
    if(typeOfGraph == 'mono'){
        content.push("\n" +  '<attribute id="shared_values" title="Shared values" type="string"></attribute>');
    }
    linksExportedColumnIds.forEach(function(colId){
        content.push("\n" +  '<attribute id="attr_'+colId+'" title="'+xmlEntities(tableHeader[colId])+'" type="string"></attribute>');
    });
    content.push("\n" +  '</attributes>');
    
    // Nodes
    content.push("\n" +  '<nodes>');
    nodes.forEach(function(d){
        var id = dehydrate_expression(tableHeader[d.colId])+"_"+$.md5(d.node);
        var label = d.node;
        var type = tableHeader[d.colId];
        
        content.push("\n" +  '<node id="'+id+'" label="'+xmlEntities(label)+'">');
        
        // Dynamic
        if(dynMode=="year"){
            content.push("\n" +  '<spells>');
            var years = [];
            d.tableRows.forEach(function(rowId){
                var year = table[rowId][dynColumnId];
                if(!years.some(function(y){return y == year;})){
                    years.push(year);
                }
            });
            years.forEach(function(y){
                y = parseInt(y);
                content.push("\n" +  '<spell start="'+y+'.0" end="'+(y+1)+'.0" />');
            });
            content.push("\n" +  '</spells>');
        }
        
        // AttributeValues
        content.push("\n" +  '<attvalues>');
        content.push("\n" +  '<attvalue for="attr_type" value="'+xmlEntities(type)+'"></attvalue>');
        content.push("\n" +  '<attvalue for="global_occurrences" value="'+d.tableRows.length+'"></attvalue>');
        
        if(typeOfGraph == 'bipartite'){
            nodesExportedColumnIds[0].forEach(function(colId){
                if(dynMode!="year"){
                    if(type == tableHeader[nodesColumnId1]){
                        var currentAttValue = ""
                        var attValues = d.tableRows.map(function(rowId){
                            return table[rowId][colId]
                        }).sort(function(a, b) {
                            return a < b ? -1 : a > b ? 1 : 0
                        }).filter(function(attValue){
                            var result = (attValue != currentAttValue)
                            currentAttValue = attValue
                            return result
                        }).join(" | ")
                        
                        content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="'+xmlEntities(attValues)+'"></attvalue>');
                    } else {
                        content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="n/a"></attvalue>');
                    }
                } else {
                    attValuesPerYear = []
                    d.tableRows.forEach(function(rowId){
                        var year = table[rowId][dynColumnId]
                        var attValuesThisYear = attValuesPerYear[year] || []
                        
                        var attValue = table[rowId][colId]
                        attValuesThisYear.push(attValue)
                        
                        attValuesPerYear[year] = attValuesThisYear
                    })
                    d3.keys(attValuesPerYear).forEach(function(year){
                        var currentAttValue = ""
                        var attValues = attValuesPerYear[year].sort(function(a, b) {
                            return a < b ? -1 : a > b ? 1 : 0
                        }).filter(function(attValue){
                            var result = (attValue != currentAttValue)
                            currentAttValue = attValue
                            return result
                        }).join(" | ")
                        year = parseInt(year)
                        if(type == tableHeader[nodesColumnId1]){
                            content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="'+xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                        } else {
                            content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="n/a" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                        }
                    })
                }
            })
            nodesExportedColumnIds[1].forEach(function(colId){
                if(dynMode!="year"){
                    if(type == tableHeader[nodesColumnId2]){
                        var currentAttValue = ""
                        var attValues = d.tableRows.map(function(rowId){
                            return table[rowId][colId]
                        }).sort(function(a, b) {
                            return a < b ? -1 : a > b ? 1 : 0
                        }).filter(function(attValue){
                            var result = (attValue != currentAttValue)
                            currentAttValue = attValue
                            return result
                        }).join(" | ")
                        
                        content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="'+xmlEntities(attValues)+'"></attvalue>');
                    } else {
                        content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="n/a"></attvalue>');
                    }
                } else {
                    attValuesPerYear = []
                    d.tableRows.forEach(function(rowId){
                        var year = table[rowId][dynColumnId]
                        var attValuesThisYear = attValuesPerYear[year] || []
                        
                        var attValue = table[rowId][colId]
                        attValuesThisYear.push(attValue)
                        
                        attValuesPerYear[year] = attValuesThisYear
                    })
                    d3.keys(attValuesPerYear).forEach(function(year){
                        var currentAttValue = ""
                        var attValues = attValuesPerYear[year].sort(function(a, b) {
                            return a < b ? -1 : a > b ? 1 : 0
                        }).filter(function(attValue){
                            var result = (attValue != currentAttValue)
                            currentAttValue = attValue
                            return result
                        }).join(" | ")
                        year = parseInt(year)
                        if(type == tableHeader[nodesColumnId2]){
                            content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="'+xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                        } else {
                            content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="n/a" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                        }
                    })
                }
            })
        } else {
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
                    
                    content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'"></attvalue>');
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
                        content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>');
                    });
                }
            })
        }
            
        
        content.push("\n" +  '</attvalues>');
        content.push("\n" +  '</node>');
        
    });
    content.push("\n" +  '</nodes>');
    
    // Edges
    content.push("\n" +  '<edges>');
    links.forEach(function(d){
        var sourceId = dehydrate_expression(tableHeader[d.sourceColId])+"_"+$.md5(d.source);
        var targetId = dehydrate_expression(tableHeader[d.targetColId])+"_"+$.md5(d.target);
        var type = tableHeader[linksColumnId];
        
        content.push("\n" +  '<edge source="'+sourceId+'" target="'+targetId+'" '+((weightEdges)?('weight="'+d.tableRows.length+'"'):(''))+'>');
        
        // Dynamic
        if(dynMode=="year"){
            content.push("\n" +  '<spells>');
            var years = [];
            d.tableRows.forEach(function(rowId){
                var year = table[rowId][dynColumnId];
                if(!years.some(function(y){return y == year;})){
                    years.push(year);
                }
            });
            years.forEach(function(y){
                y = parseInt(y);
                content.push("\n" +  '<spell start="'+y+'.0" end="'+(y+1)+'.0" />');
            });
            content.push("\n" +  '</spells>');
        }
        
        // AttributeValues
        content.push("\n" +  '<attvalues>');
        content.push("\n" +  '<attvalue for="matchings_count" value="'+xmlEntities(d.tableRows.length)+'"></attvalue>');
        if(typeOfGraph == 'mono'){
            content.push("\n" +  '<attvalue for="shared_values" value="'+xmlEntities(d.ghostNodes.join('; '))+'"></attvalue>');
        }
        content.push("\n" +  '<attvalue for="attr_type" value="'+xmlEntities(type)+'"></attvalue>');
        
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
                
                content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'"></attvalue>');
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
                    content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>');
                });
            }
        });
        content.push("\n" +  '</attvalues>');
        content.push("\n" +  '</edge>');
    });
    content.push("\n" +  '</edges>');
    
    content.push("\n" +  '</graph></gexf>');
    
    // Finalization
    /*htmlSummary += "</ul>";
    $("#UI").html(htmlSummary);
    $("#submitButton").show();
    $("#files").hide();
    nodes = [];
    links = [];
    $("#submitButton").click(function(){
        var blob = bb.getBlob("text/gexf+xml;charset=utf-8");
        saveAs(blob, "Network.gexf");
    });*/

    // Finally, download !
    nodes = [];
    links = [];
    
    var blob = new Blob(content, {'type':'text/gexf+xml;charset=utf-8'})
        ,filename = "Network.gexf"
    if(navigator.userAgent.match(/firefox/i))
       alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
    saveAs(blob, filename)

    $('#build_container').html('<div class="alert alert-success">GEXF downloaded <button type="button" class="close" data-dismiss="alert">&times;</button></div>')

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
