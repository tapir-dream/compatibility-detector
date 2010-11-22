// @author : qiabnaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'windowConstructorDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,


/*【思路】
 * 检测所有Script标记内容，过滤注释块以及单行注释
 * 检测所有标记内容的 'onXXXXX' 属性值，过滤注释块以及单行注释
 * 如果其内存在 'Window.' 'Window[' 'window.__proto__.' 'window["__proto__"][' 'window.constructor.'  'window["constructor"][' 字符情况
 * 并且没有处于 '||' 和 '&&' 短路字符前，则命中 document.all
 *
 * 【缺陷】
 * 会误报测处于eval函数内的和某些逻辑语句后 return Window 等情况。
 *
 *【messages.json】
 * "BX9045": { "message": "各浏览器中 window 对象的构造器不同"},
 * "BX9045_suggestion": { "message": "window 对象的构造器在个浏览器内支持非常混乱，因此强烈不建议在实际应用中使用。" },
 */

function constructor(rootNode) {
  this.gatherAllProblemNodes_ = false;
  this.windowConstructorFilterShortSyntaxRegexp_ =  /(\|\||\&\&)\s*(Window\s*(\.|\[)|window\s*(\.__proto__|\[\s*["']__proto__["']\s*\]\s*[\.\[])|window\s*(\.constructor|\[\s*["']constructor["']\s*\]\s*[\.\[]))/g;
  this.windowConstructorRegexp_ =  /Window\s*(\.|\[)|window\s*(\.__proto__|\[\s*["']__proto__["']\s*\]\s*[\.\[])|window\s*(\.constructor|\[\s*["']constructor["']\s*\]\s*[\.\[])/g;
  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;
},

function checkNode(node, context) {
  // Do not check page's root node(HTML tag).
  if (node == this.rootNode_)
    return;

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  //check script node
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

    if (this.windowConstructorRegexp_.test(scriptData) &&
        !this.windowConstructorFilterShortSyntaxRegexp_.test(scriptData)) {
      this.addProblem('BX9045', [node]);
    }

  //check inline events of other node
  }else{
    for (var i = 0,l = node.attributes.length; i<l; i++){
      if ( node.attributes[i].name.toLowerCase().indexOf('on') == 0 ){

       scriptData = node.attributes[i].value
        .replace(this.oneLineScriptCommentsRegexp_,'')
        .replace(this.multiLineScriptCommentsRegexp_,'');
        if (this.windowConstructorRegexp_.test(scriptData) &&
	    !this.windowConstructorFilterShortSyntaxRegexp_.test(scriptData)) {
           this.addProblem('BX9045', [node]);
         }
      }
    }
  }
  // Clear the status of test method.
  this.windowConstructorRegexp_.test('');
  this.windowConstructorFilterShortSyntaxRegexp_.test('');
  this.multiLineScriptCommentsRegexp_.test('');
  this.oneLineScriptCommentsRegexp_.test('');
}
); // declareDetector

});
