// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'windowEvalDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有Script标记内容，过滤注释块以及单行注释
 * 检测所有标记内容的 'onXXXXX' 属性值，过滤注释块以及单行注释
 * 如果其内存在 'window.eval(' 'window["eval"](' 字符情况,
 * 并且没有处于 '||' 和 '&&' 短路字符前，则命中 window.eval
 *
 * 【缺陷】
 * 会误报测处于eval函数内的 window.eval() 和某些逻辑语句后 return window.eval() 情况。
 *
 *【messages.json】
 * "BX9056": { "message": "各浏览器下 window.eval 方法的执行上下文存在差异"},
 * "BX9056_suggestion": { "message": "IE 中的 window.eval 方法不会产生全局上下文，对内部字符串变量需使用 window 关键字指定其全局作用环境。"},
 */

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  this.windowEvalFilterShortSyntaxRegexp_ =  /\b(?:[^||&&])\s*window(([.]eval)|(\[["']eval["']\]))\s?\(/g;
  this.windowEvalRegexp_ =  /[^\w$]*window(([.]eval)|(\[["']eval["']\]))\s?\(/g;
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

    if (this.windowEvalRegexp_.test(scriptData) &&
        !this.windowEvalFilterShortSyntaxRegexp_.test(scriptData)) {
        this.addProblem('BX9056', [node]);
        this.windowEvalRegexp_.test('');
        this.windowEvalFilterShortSyntaxRegexp_.test('');
    }

  }else{
    for (var i = 0,l = node.attributes.length; i<l; i++){
      if ( node.attributes[i].name.toLowerCase().indexOf('on') == 0 ){
      //delete script comment
        scriptData = node.attributes[i].value
          .replace(this.oneLineScriptCommentsRegexp_,'')
          .replace(this.multiLineScriptCommentsRegexp_,'');
      }
      if (this.windowEvalRegexp_.test(scriptData) &&
         !this.windowEvalFilterShortSyntaxRegexp_.test(scriptData)) {
           this.addProblem('BX9056', [node]);
           this.windowEvalRegexp_.test('');
           this.windowEvalFilterShortSyntaxRegexp_.test('');
         }
    }
  }



}
); // declareDetector

});
