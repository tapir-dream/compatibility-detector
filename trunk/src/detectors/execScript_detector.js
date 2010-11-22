// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'execScriptDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有Script标记内容，过滤注释块以及单行注释
 * 检测所有标记内容的 'onXXXXX' 属性值，过滤注释块以及单行注释
 * 如果其内存在 'execScript(' 字符情况,则命中 document.all
 *
 * 【缺陷】
 * 会误报测处于eval函数内的 execScript()  和某些逻辑语句后 return execScript() 情况。
 */

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  this.execScriptSyntaxRegexp_ = /([^\w$]*execScript\s?[\(\w$])|([^\w$]*window([.]execScript|\[["']execScript["']\])\s?[\(\w$])/g
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

    if ( this.execScriptSyntaxRegexp_.test(scriptData) ) {
        this.addProblem('BX9055', [node]);
	this.execScriptSyntaxRegexp_.test('');
    }

  }else{
    for (var i = 0,l = node.attributes.length; i<l; i++){
      if ( node.attributes[i].name.toLowerCase().indexOf('on') == 0 ){
      //delete script comment
        scriptData = node.attributes[i].value
          .replace(this.oneLineScriptCommentsRegexp_,'')
          .replace(this.multiLineScriptCommentsRegexp_,'');
      }
      if ( this.execScriptSyntaxRegexp_.test(scriptData) ) {
           this.addProblem('BX9055', [node]);
           this.execScriptSyntaxRegexp_.test('');
         }
    }
  }



}
); // declareDetector

});
