// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'locationReloadDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有Script标记内容，过滤注释块以及单行注释
 * 检测所有标记内容的 'onXXXXX' 属性值，过滤注释块以及单行注释
 * 如果其内存在 'location.reload("' 'location["reload"]("' 'window["location"]["reload"]("' 'window.location["reload"]("' 等字符情况,
 * 则命中 location.reload
 *
 * 【缺陷】
 * 会漏报劫持 location.reload 函数的情况和 reload 参数为变量的情况。
 *
 *【messages.json】
 * "BX9048": { "message": "IE 浏览器中 location.reload 方法可以传入URL字符串参数"},
 * "BX9048_suggestion": { "message": "请避免为 loaction.reload 方法的参数传入非空字符串值。"},
 */

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  this.locationReloadRegexp_ = /([^\w$]*location([.]reload|\[["']reload["']\])\s?\(([\'\"][a-zA-Z0-9#]))|([^\w$]*window([.]location|\[["']location["']\])([.]reload|\[["']reload["']\])\s?\(([\'\"][a-zA-Z0-9#]))/g
  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;

  var scriptData = '';
  if (node.tagName == 'SCRIPT') {

    if (node.src && node.src != '') {
      scriptData = (node.src in context) ? context[node.src] : '';
    } else {
      scriptData = node.text;
    }

   //delete script comment
   scriptData = scriptData
      .replace(this.oneLineScriptCommentsRegexp_,'')
      .replace(this.multiLineScriptCommentsRegexp_,'');

    if ( this.locationReloadRegexp_.test(scriptData) ) {
        this.addProblem('BX9048', [node]);
	this.locationReloadRegexp_.test('');
    }

  }else{
    for (var i = 0,l = node.attributes.length; i<l; i++){
      if ( node.attributes[i].name.toLowerCase().indexOf('on') == 0 ){
      //delete script comment
        scriptData = node.attributes[i].value
          .replace(this.oneLineScriptCommentsRegexp_,'')
          .replace(this.multiLineScriptCommentsRegexp_,'');
      }
      if ( this.locationReloadRegexp_.test(scriptData) ) {
           this.addProblem('BX9048', [node]);
           this.locationReloadRegexp_.test('');
         }
    }
  }

}
); // declareDetector

});
