var save=location.href.indexOf("cause")>-1;
(function(){
	window.$root=document.getElementById("root");
	window.folders=[];
	var childNodes=$root.childNodes;
	for(var i=0;i<childNodes.length;i++){
		if(childNodes[i].nodeType==1)folders.push(childNodes[i]);
	}
	if(!save)return;		//...
	var args=window.name.split(",");
	if(args.length==8){
		for(var i=0;i<folders.length;i++){
			folders[i].className=(args[i]=="1"?"folder open":"folder");
		}
		if(args[7])setTimeout(function(){document.getElementById(args[7]).focus();},1);
	}
})();
$root.onclick=function(e){
	function saveState(id){
		if(!save)return;	//...
		var state=[];
		for(var i=0;i<folders.length;i++)state.push(folders[i].className=="folder open"?1:0);
		state.push(document.documentElement.scrollTop||document.body.scrollTop);
		state.push(id);
		window.name=state.join(",");
	}
	var event=e||window.event;
	var $target=event.target||event.srcElement;
	if($target.tagName=="H2"){
		$target=$target.parentNode;
		$target.className=$target.className=="folder open"?"folder":"folder open";
		saveState("");
	}
	else if($target.tagName=="A"){
		saveState($target.id);
	}
};
function expandAll(){
	var folders=document.getElementById("root").childNodes;
	for(var i=0;i<folders.length;i++)if(folders[i].tagName=="LI")folders[i].className="folder open";
}
function collapseAll(){
	var folders=document.getElementById("root").childNodes;
	for(var i=0;i<folders.length;i++)if(folders[i].tagName=="LI")folders[i].className="folder";
}
