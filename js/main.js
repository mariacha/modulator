//start using the plugins by first passing in the settings
$(document).ready(function(){
	$("#office").DOMwsy( {} ); 
	$(document).attrChangeHoverForm({
		 attributes : ["src","height","width"],
		 resourceCheck : ["src"],
		 shadowAttr : ["src"],
		 animationSpeed: 200,
	 });
});