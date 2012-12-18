var loops = 0;
// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

// Place any jQuery/helper plugins in here.
(function($){
	var settings = {};
	
	var data = {
		domStrings : {},
		urlPath : '',
		htmlName : '',
		dropped : 1 // a counter for how many items have been dropped into the workMenu
	};
	
	//private methods
	var privateMethods = {
		/***************************** 
			Process FileList: Loops through all files dropped and reads each.
			parameters: files - a list of files loaded through HTML5
		*****************************/	
		processFiles : function(files) {
			if(files && typeof FileReader !== "undefined") {
				messageHandler.clearMessages();
				//process each files only if browser is supported
				for(var i=0; i<files.length; i++) {
					privateMethods.readFile(files[i]);
				}
				messageHandler.displayMessages();
			} else {
				
			}
		},
	
	
		/***************************** 
			Read the File Object
			parameters: file - a single file loaded through HTML5
		*****************************/	
		readFile : function(file) {
			if( data.domStrings[ file.name ] != undefined ){
				messageHandler.pushMessage({readableCode: "File load error",
										    text: "I already have file "+file.name,
										    userVisible: true,
										    type: "error"});
			} else if (file.type != 'text/html'){
				messageHandler.pushMessage({readableCode: "File load error",
											text: "The file "+file.name+" should be html",
										    userVisible: true,
										    type: "error"});
			} else {
				//define FileReader object
				var reader = new FileReader();
				
				//init reader onload event handlers
				reader.onload = function(e) {	
					privateMethods.addFileFolders(e.target.result, file.name);
				}	
				
				//begin reader read operation
				reader.readAsText(file);
			} 
		},
		/***************************** 
			- Creates a div containing the name of the module and places that div in the "fileDrawer"
			- Saves the html within the contents variable into the domString variable for later use
			parameters: contents - the html in the file
						fileLabel - the label for the file. Will be listed in the fileDrawer and on hover in the
									workArea.
		*****************************/	
		addFileFolders : function (contents, fileLabel){
		$(contents)
			data.domStrings[ fileLabel ] = $(contents);
		
			 var modules = $('module.main',$(contents));
			 // First case: there are <module> tags in the html file
			 for(var i=0; i<modules.length; i++){
				 var module_name = $(modules[i]).attr('name');
				 if(module_name && !data.domStrings[ module_name ]){
					 data.domStrings[ module_name ] = $(modules[i]);
					 var new_folder = $( document.createElement("div") ).append(module_name).addClass("fileFolder");
					 $("#fileDrawer").append(new_folder);
				 }
			 }
			 // Second case: there are no <module> tags in the html file
			 if(!modules.length){
				 var new_folder = $( document.createElement("div") ).append(fileLabel).addClass("fileFolder");
				 $("#fileDrawer").append(new_folder);
			 }
			 
		 },
		
		/***************************** 
			Make text and images editable. Searches all children for text nodes, and wraps any
			found text nodes in a span with the class "editable". Also prepares images for editing
			by wrapping them in a span with the class "editImage."
			
			parameters: node - a jquery object, 
		*****************************/	
		prepareEditableContent : function(node) {
			// undo the logic that makes text unselectable in Jquery UI's Sortable plugin
			var wrap_span =  $(document.createElement("span")).addClass('editable').attr('contenteditable',true);
				
			// make all text nodes editable by wrapping them in spans with a contenteditable attribute set to true

			node.find('[class!="label"]').contents().filter(function () { 
				var whitespace = /^\s*$/;
				loops++;
				return (this.nodeType === 3 && !whitespace.test(this.nodeValue));
			}).wrap(wrap_span);
			
			// disable all links
			$('a',node).each(function() {
				var $t = $(this);
				$t
					.attr({
						xhref : $t.attr('href'),
					})
					.removeAttr('href')
				;
			});
			
			// make all images editable
			$('img',node).wrap("<span class='editImage' />");
			$(".editImage img", node).each(function(){
				$(this).attrChangeHoverForm("attachForm");
			});
		},
		/***************************** 
			Takes a full url to an html file, splits it into the path to the file and the 
			name of the file, and saves both these to the object-wide "data" method.
			parameters: addURL - a full url
		*****************************/	
		populateDataURLs : function(addURL) {
			var path = addURL.split("/");
			data.htmlName = path.pop();
			data.urlPath = path.join('/');
		},
		/***************************** 
			Inserts content related to one div before another div
			parameters: origDiv - the original div with a "rel" to the id of the div to insert
		*****************************/	
		insertRelatedDiv : function(origDiv, parentContainer){
			var move_div_id = $(origDiv).attr('rel');
			var move_div = $("#"+move_div_id);
			var append_to_div_id = $(origDiv).next().attr('rel');
			var append_to_div = $("#"+append_to_div_id);
			
			if(append_to_div[0]){
				append_to_div.before(move_div);
			} else {
				// Sometimes you can't find the append_to_div, because the item is going to the bottom of the list
				parentContainer.append(move_div);
			}
		},
		/***************************** 
			Clones the contents of origDiv, adds a "close" option and links the new div to its related content in the
			work area.
			parameters: origDiv - The original div that is being cloned.
		*****************************/	
		createLabelDiv : function(origDiv, relatesTo){
			var dropped_label = $(origDiv).clone();
			// Create a label for the file
			// Create close box for the file
			var deskFolderClose = $( document.createElement("div") ).addClass("close");
			deskFolderClose.click(
			 function(event) {
				var current_message = $(this).parents('.fileFolder');
				$("#"+current_message.attr("rel")).remove();
				current_message.remove();
			   }
			);
			
			dropped_label.append(deskFolderClose);
			dropped_label.attr('rel',relatesTo);
			return dropped_label;
		}
	};
	
	//public functions
	var methods = {
		//our constructor for the Wsy canvas
		init : function( options ){
			$.extend(settings,options);

			var $this = $(this);
			//set our Wsy environment up and ready to use.
			$('.formOptions').hide();
			
			// Find out which radio button was clicked and show the appropriate form fields
			$("[name=deskTopCreate]").each(function(){
				if($(this).attr('checked')){
					$("#"+$(this).val()).show();
				}
			}).click(function(){
					$('.formOptions').hide();
					$("#"+$(this).val()).show();
			});
			 
			// Process the form fields and create your work area
			$("#deskForm button").click(function(){
			 	var clickedButton = $("input[name=deskTopCreate]:checked").val();
			 	if(clickedButton == 'url'){
			 	
			 		// split the url into the "data" method
			 		var addURL = $("#addURL").val();
			 		privateMethods.populateDataURLs(addURL);
			 		
			 		var this_file = $.ajax({
					 url: "loadURL.php?addURL="+addURL,
					 success: function(returnData) {
					 	var $returnData = $(returnData);
						$('img',$returnData).each(function () {
							var source = $(this).attr("src");
							if(!(/^http/).test(source)){
								$(this).addClass('relative');
								$(this).attr("oldsrc", $(this).attr("src"));
								$(this).attr("src", data.urlPath + "/" + source);
							}
						});
						
						privateMethods.addFileFolders($returnData, data.htmlName);
						
						var modules = $('module.main',$returnData);
						if(modules.length){
							privateMethods.prepareEditableContent($returnData);
							$("#fullWorkArea").append($returnData);
							modules.first().parent().wrapInner("<div id='workArea' />");
							modules.each(function(){
								var mod_name = $(this).attr("name");
								if(mod_name){
									var new_file = methods.receiveFile(mod_name, $('#workMenu'));
									var dropped_label = privateMethods.createLabelDiv($("<div class='fileFolder'>"+mod_name+"</div>"), new_file.attr('id'));
									privateMethods.prepareEditableContent(new_file);
									$("#workMenu").append(dropped_label);
									$(this).before(new_file);
									$(this).remove();
								}
							});
							
						} else {
							// if the file to be loaded doesn't contain any module tags, load a generic 
							// work area and dump the whole file into the file folder.
							messageHandler.pushMessage({readableCode: "URL read warning",
										    text: "No module tags in the given URL...",
										    userVisible: true,
										    type: "info"});
							messageHandler.pushMessage({readableCode: "URL read warning",
										    text: "Assuming the whole file is a module.",
										    userVisible: true,
										    type: "info"});
							methods.createWorkArea('FFFFFF','600');
							var new_file = methods.receiveFile(data.htmlName, $('#workMenu'));
							var dropped_label = privateMethods.createLabelDiv($("<div class='fileFolder'>"+data.htmlName+"</div>"), new_file.attr('id'));
							privateMethods.prepareEditableContent(new_file);
							$("#workMenu").append(dropped_label);
							$("#workArea").append(new_file);
							messageHandler.displayMessages();
						}
						methods.load();
					   }
					});
			 	} else {
			 		// create the table with the correct attributes.
			 		var addColor = "#" +  $("#bgcolor").val();
			 		var addWidth = $("#width").val();
			 		
			 		methods.createWorkArea(addColor,addWidth);
			 		methods.load();
			 	}
			 	
			 	$("#deskForm").hide();
			 });
			 
			// hide the tab containing the source of the file
			$("#source").hide();
			
			// to start out we're viewing the rendered html instead of the source, so reflect that in the "tabs"
			$("#view_html").addClass('active');
			
			// tab manipulation
			$("#view_html").click(function(){
				$(this).addClass('active');
				$("#view_source").removeClass('active');
				$('#fullWorkArea').show();
				$('#source').hide();
			});
			
			$("#view_source").click(function(e){ methods.viewSource(e.currentTarget) });
		},
		/***************************** 
			Creates the workArea as a td within a table and appends the table to the deskTop
			parameters: addColor - the background color of the table and the td#workArea
						addWidth - the width of the table and the td#workArea
		*****************************/	
		createWorkArea : function(addColor, addWidth) {
			// Creates the following table:
			// <table align="center" border="0" cellpadding="0" cellspacing="0">
			// <tr>
			// <td id="workArea" class="connectedSortable" align="center"></td>
			// </tr>
			// </table>
			var td = $( document.createElement("td") ).addClass("connectedSortable").attr({ id : "workArea", 
				align : "center", 
				width : addWidth, 
				bgcolor : addColor,
				valign : "top"});
			var tr = $( document.createElement("tr") );
			var table = $( document.createElement("table") ).attr({
				align : "center", 
				border : 0,
				cellpadding : 0,
				cellspacing : 0,
				width : addWidth, 
				bgcolor : addColor});
			tr.append(td);
			table.append(tr);
			$("#fullWorkArea").append(table);
		},
		/***************************** 
			Initializes the Drag and Drop abilities in the inbox, fileDrawer, and deskTop
		*****************************/	
		load : function() {
			//setup our drag and drop file load.
			var inbox = $( document.createElement("div") ).append("<p>Drag and Drop Module File(s) Here</p><p class='label'>Inbox</p>" ).attr("id","inbox");
			
			inbox.bind("dragover", function(event) {
				event.preventDefault();
			});
			
			inbox.bind("drop", function(e) {
				//prevent browser from open the file when drop off
				e.stopPropagation();
				e.preventDefault();
				
				//retrieve uploaded files data
				var files = e.originalEvent.dataTransfer.files;
				privateMethods.processFiles(files);
				
				return false;
			
			});
			
			// Make your drawer sortable
			$( "#fileDrawer").sortable({
				placeholder: 'placeholder',
				tolerance:'pointer',
				start: function(e, ui){
				   $.fn.attrChangeHoverForm("hideForm",data.currentObj);
				},
				connectWith : ".connectedSortable",
				remove : function(e, ui) {
					 $(ui.item).addClass('tmp');
				},
				stop : function(e,ui){
					if($(ui.item).hasClass('tmp')){
						$( "#fileDrawer").sortable("cancel");
						$(ui.item).removeClass('tmp');
					}
				}
			});
			
			$( "#workMenu" ).sortable({ 
				placeholder: 'placeholder',
				tolerance:'pointer',
				start: function(e, ui){
				   $.fn.attrChangeHoverForm("hideForm",data.currentObj);
				   $( this ).sortable( 'refreshPositions' );
				},
				receive: function(e, ui){
					var droppedContainer = $(e.target);
					var current_file = $(ui.item).text();
					var new_file = methods.receiveFile(current_file, droppedContainer);
					var dropped_label = privateMethods.createLabelDiv(ui.item, new_file.attr('id'));
					$(ui.item).after(dropped_label);
					privateMethods.prepareEditableContent(new_file);
					$("#workArea").append(new_file);
					privateMethods.insertRelatedDiv(dropped_label, $("#workArea"));
				},
				stop: function (e, ui){
					privateMethods.insertRelatedDiv(ui.item, $("#workArea"));
				}
			});
										
			// Add the drop area to accept files. Created last to prevent premature file loading.
			$("#fileManager").prepend( inbox );
		},
		/***************************** 
			Takes a jquery file dropped and appends it to the work area in a sortable div
			parameters: current_file - the hash key to the domString element to manipulate.
		*****************************/	
		receiveFile : function(current_file, droppedContainer) {
		   // the content of the file that was uploaded
		   var id = "dropped"+data.dropped;
		   data.dropped++;
		   var deskFolderDiv = $("<div id='"+id+"' />").addClass("deskFolder").append(data.domStrings[current_file].clone());
		   // Create box to move the label out of the way
			deskFolderDiv.bind('mousemove', function(e){
				$(this).addClass('hovered');
				var current_label = $("div.fileFolder[rel='"+this.id+"']");
				$('#workMenu .fileFolder').removeClass('current');
				current_label.addClass('current');
				var height_per_label = current_label.outerHeight();
				var min_height = $( "#fullWorkArea" ).offset().top;
				var distance_down = $('#workMenu .fileFolder').index(current_label);
				var distance_to_lower = e.pageY - (distance_down * height_per_label) - (height_per_label/2);
				distance_to_lower = Math.max(distance_to_lower, min_height);
				droppedContainer.css({
				   position: "absolute",
				   top:   distance_to_lower,
				   left:  droppedContainer.offset().left
				});
			})
			.bind('mouseout', function(){
				$('#workMenu .fileFolder').removeClass('current');
				$(this).removeClass('hovered');
			});
		   return deskFolderDiv;

		},
		/***************************** 
			Clean up and display the source of the current file in the "View code" tab.
			parameters: ui - the button just clicked to cause this to happen
		*****************************/	
		viewSource : function(ui){
			// when you view source, clean up the code in the rendered html and add it to the "view_source" textbox.
			$(ui).addClass('active');
			$("#view_html").removeClass('active');
			$('#fullWorkArea').hide();
			$('#source').show();
			
			// clean up the work area before dumping it in to the textarea
			var workAreaContents = $('#fullWorkArea').clone();
			$("span.editable", workAreaContents).each(function() {
				$(this).replaceWith(this.childNodes);
			  });
			  
			$("img.relative", workAreaContents).each(function() {
				var $t = $(this);
				$t
					.attr({
						src : $t.attr('oldsrc'),
					})
					.removeAttr('oldsrc')
					.removeClass('relative');
				;
			  });

			$('a', workAreaContents).each(function() {
				var $t = $(this);
				$t
					.attr({
						href : $t.attr('xhref'),
					})
					.removeAttr('xhref')
				;
			});
			
			$('span.editImage > *', workAreaContents).unwrap();
			$('.deskFolder > *', workAreaContents).unwrap();
			$('#workArea > *', workAreaContents).unwrap();
			$('module > *', workAreaContents).unwrap();
			$('.label', workAreaContents).remove();
			
			// show the text area with the html inside it.
			$('#source').val(workAreaContents.html());
		},
		
		/***************************** 
			Add getter for the urlPath stored in the data method.
		*****************************/
		getURLPath : function(){
			return data.urlPath;
		}
	};
	
	//access function for our plugin
	$.fn.DOMwsy = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.DOMwsy' );
		}    
	};
})(jQuery);

// Plugin for the hover box to change an image's src (or any attribute supplied)
(function($){
	var settings = {
		attributes : {},
		resourceCheck : [],
		shadowAttr : [],
		animationSpeed : 400,
		formDiv : "#attrChangeHoverForm"
	};
	var data = {};
	var privateMethods  = {
		arrayContains : function(a,n){
			for (i in a) {
			   if (a[i] == n) return true;
			}
		   return false;
		},
		checkResource : function(resource){
			var response = $.ajax({
				url: "imageTest.php",
				type: 'POST',
				data: "imgUrl="+resource,
				async: false, //if this is changed to true, the vaulu in data.currentObj will no longer be correct. 
				beforeSend : function(jqXHR, settings){ //we aren't modifying the request just using this before request to show our loading bar
					privateMethods.toggleLoader();
				},
				error : function(rqData,code,HTTP){
					privateMethods.showResourceError( $( settings.formDiv +" input[type=text][name="+settings.attributes[attr]+"]"));
					setTimeout( function(){ privateMethods.toggleLoader(); }, 1000 );
				},
				success : function(rqData,code,HTTP){
					if( privateMethods.arrayContains(settings.shadowAttr, settings.attributes[attr] ) && data.currentObj.attr('old'+settings.attributes[attr])){
						var relativePath = resource.replace($.fn.DOMwsy('getURLPath')+"/","");
						data.currentObj.attr("old"+settings.attributes[attr], relativePath );
					}
					data.currentObj.prop(settings.attributes[attr], resource );
					setTimeout( function(){ privateMethods.toggleLoader(); }, 1000 );
					$.fn.attrChangeHoverForm("hideForm",data.currentObj);
				}
			});
		},
		showResourceError : function(resourceField){
			resourceField.addClass("inputError");
		},
		toggleLoader : function(callback){
			$( settings.formDiv+" #loader" ).fadeToggle("fast",function(){
				(typeof callback == "function") ? callback() : function(){};
			});
		},
	};
	var methods = {
		init : function(userSettings){
			$.extend( settings, userSettings );
			
			//populate our form
			for( attr in settings.attributes ){
				$( settings.formDiv ).append(
					//"<span> <input type='checkbox' name='"+settings.attributes[attr]+"' /> <label>"+settings.attributes[attr]+" </label><input type='text' name='"+settings.attributes[attr]+"' />" We're applying all for now
					"<span><label>"+settings.attributes[attr]+" </label><input type='text' name='"+settings.attributes[attr]+"' />"
				);
			}
			$( settings.formDiv ).append( 
				$("<input type='button' value='Update' />").click(function(){
					$.fn.attrChangeHoverForm("changeAttrs");
				}) 
			).find("a").click(function(){
				$.fn.attrChangeHoverForm("hideForm",data.currentObj);
			});
		},
		attachForm : function(){
			var $this = $(this);
			$this.bind('mousedown.ui-disableSelection selectstart.ui-disableSelection', function(e) {
				  data.currentObj = $this;
				  $.fn.attrChangeHoverForm("showForm",$this);
			});
			$this.click(function(){
				data.currentObj = $this;
				$.fn.attrChangeHoverForm("showForm",$this);
			},function(){});
		},
		showForm : function(obj){
			var $this = $(obj);
			//get the attributes of the element the form is hovering for.
			var objDimens = { width : $this.width(), height : $this.height() }
			//get our x and y position on the page
			var cords = $this.offset();
			//fill in the data that matches the given attributes in settings
			for( attr in settings.attributes ){
				if( privateMethods.arrayContains(settings.shadowAttr, settings.attributes[attr] ) && data.currentObj.attr('old'+settings.attributes[attr])){
					attrName = 'old'+settings.attributes[attr];
				} else {
					attrName = settings.attributes[attr];
				}
				if(data.currentObj.attr(attrName) != undefined){
					var this_input = $( settings.formDiv +" input[type=text][name="+settings.attributes[attr]+"]");
					$( settings.formDiv +" input[type=text][name="+settings.attributes[attr]+"]").removeClass('inputError').val( $this.attr( attrName ) );
				} 
			}
			
			$(settings.formDiv).css({
				left: cords.left + objDimens.width - 10 + "px",
				top:  cords.top + objDimens.height/4 + "px"
			}).fadeIn(settings.animationSpeed);
			
		},
		hideForm : function(){
			$(settings.formDiv).fadeOut(settings.animationSpeed);
		},
		changeAttrs : function(){
			var applyChanges = 0; // a variable to see if something has actually changed, or if the user just submitted the form with all the original data
			for( attr in settings.attributes ){
				//if( $( settings.formDiv +" input[type=checkbox][name="+settings.attributes[attr]+"]").is(":checked") ){
					var fieldVal = $( settings.formDiv +" input[type=text][name="+settings.attributes[attr]+"]").val();
					if( privateMethods.arrayContains(settings.shadowAttr, settings.attributes[attr] ) && data.currentObj.attr('old'+settings.attributes[attr]) && !(/^http/).test(fieldVal)){
						fieldVal = $.fn.DOMwsy('getURLPath')+"/"+fieldVal;
					}
					//check to see if we need to validate a resource
					if(fieldVal != data.currentObj.prop(settings.attributes[attr])){
						if( privateMethods.arrayContains(settings.resourceCheck, settings.attributes[attr] )){
							applyChanges = 1;
							//if we do need to do resource validation then run the function
							privateMethods.checkResource( fieldVal );
						}else{
							data.currentObj.prop(settings.attributes[attr], fieldVal );
						}
					}
				//}
			}
			// if nothing has been changed, just close the form
			if(!applyChanges){
				$.fn.attrChangeHoverForm("hideForm",data.currentObj);
			}
			
		}
	};

	$.fn.attrChangeHoverForm =function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.DOMinipulator' );
		}    
	};
})(jQuery);

// Plugin for displaying errors
var messageHandler = {
	 errors : new Array(),
	 pushMessage : function(error){
		 /**
		 * The following is the format in which error objects should be passed to the messageHandler object's pushMessage function.
		 *   error = { //example error, as seen 
		 *		code 		: "EmptyVal", 
		 *		readableCode: "No Value Found", 
		 *		text		: "Please Select a value in "+ tagName +"'s selection menu.", 
		 *		devMsg 		: "No value was found for selectBox when accessed using .val()", 
		 *		userVisible : true,
		 *		type		: "info"
		 *	} 
		 **/
		 messageHandler.errors.push( error );
	 },
	 displayMessages : function(){
		 var l = messageHandler.errors.length, i = 0,error;
		 for(i;i<l;i++){
			 error = messageHandler.errors[i];
			 if( error.userVisible ){
				 errorFill = $("<p>"+ error.readableCode + ": " + error.text + "</p>").prepend( $("<img align='left' err='"+ i +"' src='img/close.png'/>").click(function(){
					 messageHandler.closeMessage( parseInt( $(this).attr("err") ) );
				 }) );
				 //now check to see if it's an error or just a info message
				 if(error.type == "info"){
					 errorFill.addClass('ui-state-highlight');
					 //put the message in our message alert box
					 $("#info").append( errorFill );
				 }else{
					 errorFill.addClass( 'ui-state-highlight' );
					 //put the message in our fatal errors box
					 $("#error").append( errorFill );
				 }
				 error.DOMhandle = errorFill;
			 }else{
				 //echo our the error in the console so devs can see it.
				 console.log("Error Code: " + error.code + " | Dev Info:" + error.devMsg);
			 }
		 }
		 $("#info").append( "<p> No Messages </p>" );
		 $("#error").append( "<p> No Errors </p>" );
		 $("#messages").animate({height:"55px"});
		 //$("#info").toggleClass("messageShow",400);
	 },
	 clearMessages : function(){
		 $("#error").empty();
		 $("#info").empty();
		 messageHandler.errors.length = 0;
	 },
	 closeMessage	: function(errorIndex){
		 //animate the closing
		 $(messageHandler.errors[ errorIndex ].DOMhandle).effect("blind",{},800,function(){
			 $(this).remove()
		 });
		 
	 }
 };