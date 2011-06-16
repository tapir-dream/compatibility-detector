function autoFitWindow(){
	var wh = $(window).height();
	var ph = document.body.scrollHeight;
	var ah = ph>wh?ph:wh;
	var height = ah - 90;
	$('#leftBox').css('height',height);	
}
function customizeMails(obj){
	var box = $('#emailsBox');
	var listBox = $('#emailList');
	if(obj.value == 'customize'){
		box.css('display','');
		$('#emails')[0].value = '';
		$('#inputEmails')[0].value = '';
	}else{
		box.css('display','none');
	}
	listBox.css('display',obj.value == 'select'?'':'none');
}
function checkSendMailForm(){
	var form = $('#email_info')[0];
	if(form.targets.value=='customize'){
		var emailValue = form.inputEmails.value;
		emailValue = emailValue.replace(/\;+/g,';');
		emailValue = emailValue.replace(/[\n\t\s]*/g,'');
		var errorEmails = "";
		var emailAddresses = "";
		var emailArr = emailValue.match(/\;/)?emailValue.split(';'):[emailValue];
		if(emailArr){
			$.each(emailArr, function(k,v){
				v = trim(v);
				if(v!=''){
					if(!isEmail(v)){
						errorEmails += v + "\n";
					}else{
						emailAddresses += v + ";";
					}
				}
			});
		}
		if(errorEmails!=''){
			alert('以下电子邮件地址不正确，请核实！\n' + errorEmails);
			form.inputEmails.focus();
			return false;
		}
		if(emailAddresses==''){
			form.inputEmails.value = '';
			alert('请输入邮件地址！');
			form.inputEmails.focus();
			return false;
		}
		$('#emails')[0].value = emailAddresses;
	}
	if(form.targets.value=='select'){
		var emailValue = form.selectedEmails.value;
		emailValue = emailValue.replace(/\;+/g,'');
		emailValue = emailValue.replace(/(^\;+)|(\;+$)/g,'');
		if(emailValue==''){
			alert('请选择邮件！');
			return false;
		}
		$('#emails')[0].value = emailValue;
	}
	if(form.subject.value==''){
		alert('请输入邮件标题！');
		form.subject.focus();
		return false;
	}
	var mContent = edt.getSource();
	if(mContent==''){
		alert('请输入邮件内容！');
		return false;
	}
	return true;
}
function emailIsExisting(v){
	var se = $('#selectedEmails')[0];
	var existing = se.value.indexOf(';'+v+';')>-1?true:false;
	return existing;
}
function checkinEmail(obj){
	var se = $('#selectedEmails')[0];
	var existing = emailIsExisting(obj.value);
	if(obj.checked && !existing){
		se.value += ";" + obj.value + ";";
	}
	if(!obj.checked && existing){
		se.value = se.value.replace(";" + obj.value + ";","");
	}
}
var pagination = function(boxId,listId,rows,actionPage,count){
	this.pagBox = $('#' + boxId)[0];
	this.listBox = $('#' + listId)[0];
	this.rows = rows;
	this.actionPage = actionPage;
	this.count = count;
}
pagination.prototype = {
	setPagination : function(page){
		var page = page?page:1;
		var pBox = this.pagBox;
		if(this.count<=this.rows){
			pBox.innerHTML = "";
			pBox.style.display = "none";
			return;
		}
		var c = this.count/this.rows;
		var pageCount = c>parseInt(c) ? (parseInt(c)+1) : c;
		var firstPage = page>1?'<a href="javascript:pg.getResult(pg,1);">&lt;&lt;First</a>&nbsp;':'&lt;&lt;First&nbsp;&nbsp;';
		var lastPageNum = page<pageCount?'<a href="javascript:pg.getResult(pg,' + pageCount + ');">Last&gt;&gt;</a>':'Last&gt;&gt;';
		var previousPage = page>1?'<a href="javascript:pg.getResult(pg,' + (page-1) + ');">&lt;Previous</a>&nbsp;&nbsp;':'&lt;Previous&nbsp;&nbsp;';
		var nextPage = (page+1)<=pageCount?'<a href="javascript:pg.getResult(pg,' + (page+1) + ');">Next&gt;</a>&nbsp;&nbsp;':'Next&gt;&nbsp;&nbsp;';
		var pageLinks = "";
		for(var i=1; i<(pageCount + 1); i++){
			pageLinks += (i==page?i:'<a href="javascript:pg.getResult(pg,' + i + ');">' + i + '</a>') + "&nbsp;&nbsp;";
		}
		var pageInfo = firstPage + previousPage + pageLinks + nextPage + lastPageNum;
		pBox.innerHTML = pageInfo;
		pBox.style.display = "block";
	},
	showResult : function(data, page){
		var content = "";
		if(!data || !data.length){
			content = "No Data.";
		}else{
			var template = '<table width="500" border="0" cellspacing="5" cellpadding="0" class="rowItem"><tr><td class="subTd"><input type="checkbox" name="subscriberItem" onchange="checkinEmail(this)" #cStatus# value="#email#"> #name# <span class="subInfo">( #email# )</span></td></tr></table>';
			var tpl,cStatus;
			$.each(data, function(k,v){
				cStatus = emailIsExisting(v['email'])?"checked":"";
				tpl = template.replace(/\#name\#/g, v['name']);
				tpl = tpl.replace(/\#email\#/g, v['email']);
				tpl = tpl.replace(/\#cStatus\#/g, cStatus);
				content += tpl;
			});
		}
		this.listBox.innerHTML = content;
		this.setPagination(page);
	},
	getResult : function(obj, page){
		var page = page?page:1;
		$.post(obj.actionPage,
		{Action : "post",
		 page : page},
		function(data, textStatus){
			obj.showResult(data, page);
		});
	}
}
function batch(form,checkbox){
	var f = document.forms[form];
	for (var i=0;i<f.elements.length;i++){
		if (f.elements[i].type=='checkbox'){
			f.elements[i].checked = checkbox.checked;
		}
	}
}
function batch_do(form, obj){
	var mode = obj.options[obj.selectedIndex].value;
	if (mode=="") return;
	var f = $('#'+form)[0];
	var s = false;
	var c = $("[name='ids[]']");
	for (var i=0; i<c.length; i++){
		if (c[i].checked){
			s = true;
			break;
		}
	}
	if (s==false){
		alert('请先选择一项！');
		obj.options[0].selected = true;
		return false;
	}
	if (mode=="delete"){
		var cfm = window.confirm('您确定要删除选中项吗？');
		if(cfm){
			f.action = f.action + mode;
			f.submit();
		}else{
			obj.options[0].selected = true;
		}
	}
	if (mode=="batch_update_html"){
		var cfm = window.confirm('您确定要更新选中项吗？');
		if(cfm){
			f.action = f.action + mode;
			f.submit();
		}else{
			obj.options[0].selected = true;
		}
	}
}
function selectAll(name, obj){
	var inputs = document.getElementsByTagName('input');
	$.each(inputs, function(k,v){
		if(v.type=='checkbox' && v.name.replace(/\[\]/g,'')==name){
			v.checked = obj.checked;
		}
	});
}
function trimString(str){
	str = str.replace(/(^\s*)|(\s*$)/g,'');
	return str;
}
$(document).ready(function(){
	autoFitWindow();
});
window.onresize = autoFitWindow;