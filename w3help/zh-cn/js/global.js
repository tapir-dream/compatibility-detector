/*
 * Filename: global.js
 * Description:	all js functions of w3h.
 * Author: JieYun.Wei
 * Copyright: Copyright 2010 Google! Inc. All rights reserved.
 */
function checkForm(){
	var form = getObject('subscribeForm');
    if(form.name.value == ''){
		alert('请输入您的姓名。');
		form.name.focus();
		return false;
	}
    if(form.email.value == ''){
		alert('请输入您的E-mail。');
		form.email.focus();
		return false;
	}
    if(!isEmail(form.email.value)){
		alert('E-mail地址不正确。');
		form.email.focus();
		return false;
	}
	form.submit();
}
function trim(str){
	str = str.replace(/^[\s|\n|\t]+|[\s|\n|\t]+$/g,'');	
	return str;
}
function printArticle(){
	//preview
	var pBox = getObject('previewWindow');
	var win = getWindowSize();
	var h = win.height - 200;
	if(!pBox){
		var pBox = document.createElement('div');
		pBox.style.position = 'absolute';
		pBox.style.zIndex = '100';
		pBox.id = "previewWindow";
		pBox.style.top = "10px";
		pBox.style.left = "200px";
		pBox.style.width = '800px';
		pBox.style.background = '#f2f2f2';
		pBox.style.padding = '10px';
		pBox.style.border = '1px solid #999';
		pBox.style.textAlign = 'center';
		var url = document.location.href;
		url = url.replace(/\/$/,'');
		url = url.match(/[^\/]+$/);
		url = url[0].toString();
		url = "/zh-cn/causes/"+url.substr(0,1)+"/"+url.substr(1,1)+"/"+url.substr(2,1)+"/"+url.substring(3)+".html";
		pBox.innerHTML = '打印预览<br /><div style="padding:5px 0;"><iframe src="/php/templates/printArticle.htm" width="100%" id="articleIframe" height="'+h+'" marginheight="0" marginwidth="0" frameborder="0" style="border:1px solid #999" onload="fillinContent()"></iframe></div><input type="button" value=" 打 印 " onclick="printPage()" />&nbsp;&nbsp;<input type="button" value=" 取 消 " onclick="cancelPrint()" />';
		//remove dotted part
		document.body.appendChild(pBox);
	}else{
		pBox.style.display = '';	
	}
	var t = Math.ceil(win.height/2 - pBox.offsetHeight/2) + "px";
	var l = Math.ceil(win.width/2 - pBox.offsetWidth/2) + "px";
	pBox.style.top = t;
	pBox.style.left = l;
}
function fillinContent(){
	var iframe = getObject('articleIframe');
	var container = iframe.contentWindow.document.body;
	var content = getObject('w3h_body').innerHTML;
	var aimContent = "";
	if(content.match(/<div\s*class\=\"*appendix\"*>/i)){
		aimContent = content.match(/(<h1\s*class\=\"*title\"*>([\w\W]*?))<div\s*class\=\"*appendix\"*>/i);
		aimContent = aimContent?aimContent[1]:'';
	}else{
		aimContent = getObject('div.body_content').innerHTML;
		aimContent = aimContent.replace(/<p\s+id\=\"*printButton\"*>([\w\W]*?)<\/ul>/ig,'');
	}
	aimContent = aimContent?aimContent+"<br />":'未找到文章！';
	container.innerHTML = aimContent;
}
function cancelPrint(){
	getObject('previewWindow').style.display = "none";
}
function printPage(){
	getObject('articleIframe').contentWindow.print();
}
function getWindowSize(){
	var pageObj = document.documentElement || document.body;
    var w = pageObj.clientWidth || pageObj.offsetWidth; 
    var h = pageObj.clientHeight || pageObj.offsetHeight;
    return {
		page : pageObj,
		width : w,
		height : h
	}; 
}
function addEvent(oTarget,sEventType,funName){
    if(oTarget.addEventListener){
        oTarget.addEventListener(sEventType, funName, false);
    }else if(oTarget.attachEvent){
        oTarget.attachEvent("on" + sEventType, funName);
    }else{
        oTarget["on" + sEventType] = funName;
    }
};
function removeEvent(oTarget,sEventType,funName){
    if(oTarget.removeEventListener){
        oTarget.removeEventListener(sEventType, funName, false);
    }else if(oTarget.detachEvent){
        oTarget.detachEvent("on" + sEventType, funName);
    }else{
        oTarget["on" + sEventType] = null;
    }
};
var topBtn = {
	btn : null,
	windowObj : null,
	init : function(){
		var i = getObject('topImg');
		if(!i){
			i = document.createElement('img');
			i.id = 'topImg';
			i.src = '/zh-cn/images/top.gif';
			i.onclick = topBtn.getTop;
			i.style.position = 'absolute';
			i.style.cursor = 'pointer';
			i.style.display = "none";
			i.style.right = '7px';
			document.body.appendChild(i);
		}
		//set display
		var page = document.documentElement || document.body;
		if(page.offsetTop > 0 || page.scrollHeight > page.clientHeight){
			i.style.display = "block";
		}else{
			i.style.display = "none";
		}
		this.position();
		window.onscroll = topBtn.position
	},
	position : function(){
		var win = getWindowSize();
		var st = win.page.scrollTop || document.body.scrollTop;
		var i = getObject('topImg');
		i.style.top = (win.height + st) - 20 + "px";
	},
	getTop : function(){
		var i = getObject('topImg');
		var w = getWindowSize();
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	}
}
function submitSearch(){
	var keyObj = getObject('keyword');
	var v = keyObj.value;
	v = v.replace(/(^\s*)|(\s*$)/g,'');
	if(v==''){
		alert('请输入关键字！');
		keyObj.value = v;
		keyObj.focus();
		return false;
	}else{
		var url = '/zh-cn/home/search.html?key=' + escape(v);
		document.location.href = url;
		return true;
	}
}
function isEmail(v){
	var re = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
	var m = re.test(v);
	return m;
}
function getObject(objInfo){
	if(objInfo.match(/\./)){
		var ds = objInfo.split(/\./);
		var tag = ds[0];
		var className = ds[1];
		var objArr = document.getElementsByTagName(tag);
		if(!objArr) return;
		for(i=0; i<objArr.length; i++){
			if(objArr[i].className==className){
				return objArr[i];
			}
		}
	}else{
		var obj = typeof(objInfo)=='object'?objInfo:document.getElementById(objInfo);
	}
	return obj;
}
var seconds = 5; //倒计时的秒数
var countdownObjId = ""; //倒计时的秒数 
var URL; 
function redirectPage(objId, url, s){
	URL = url; 
	countdownObjId = objId; 
	seconds = s?s:5;
	for(var i=seconds; i>=0; i--){
		window.setTimeout('updateCountdownInfo(' + i + ')', (seconds-i) * 1000); 
	}
}
function updateCountdownInfo(num){ 
	var obj = document.getElementById(countdownObjId);
	if(!obj) return;
	obj.innerHTML = num; 
	if(num == 0) { window.location = URL; } 
}
function showLoading(obj, width){
	var obj = getObject(obj);
	var w = width?'width="'+width+'"':'';
	obj.innerHTML = '<img src="/zh-cn/images/loading.gif" ' + w + ' border=0 />';
}
function display(obj, type){
	var obj = getObject(obj);
	var d = (typeof(type)=='undefined'||type)?'':'none';
	obj.style.display = d;
}
function focusKey(obj){
	obj.className = 'focus';
}
function blurKey(obj){
	obj.className = obj.value===''?'text':'focus';
}