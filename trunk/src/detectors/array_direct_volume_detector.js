// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'arrayDirectVolumeDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

/*
 *【思路】
 * 检测所有标记的内联事件与script标记，去除注释后与字符内容后，如果存在 ',]' 字符则命中。
 *
 *【messages.json】
 * "SJ2007": { "message": "IE6 IE7 IE8 不会忽略数组直接量的末尾空元素"},
 * "SJ2007_suggestion": { "message": "数组直接量的最后不要出现 \",\"字符，以保证兼容各浏览器。" },
 *
 */

function constructor(rootNode) {
  this.gatherAllProblemNodes_ = false;
  this.arrayDirectVolumeRegexp_ = /,\]/g;
  this.stringDirectVolumeRegxp_ = /['"].+?['"]/g;
  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;
},

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var scriptData = '';

  if (node.tagName == 'SCRIPT') {
    if (node.src && node.src != '') {
      scriptData = (node.src in context) ? context[node.src] : '';
    } else {
      scriptData = node.text;
    }

   //delete script comment and string
   scriptData = scriptData
      .replace(this.oneLineScriptCommentsRegexp_,'')
      .replace(this.multiLineScriptCommentsRegexp_,'')
      .replace(this.stringDirectVolumeRegxp_,'');
    if (this.arrayDirectVolumeRegexp_.test(scriptData))
      this.addProblem('SJ2007', [node]);

  //check inline events of other node
  }else{
    for (var i = 0,l = node.attributes.length; i<l; i++){
      if ( node.attributes[i].name.toLowerCase().indexOf('on') == 0 ){
       scriptData = node.attributes[i].value
        .replace(this.oneLineScriptCommentsRegexp_,'')
        .replace(this.multiLineScriptCommentsRegexp_,'')
	.replace(this.stringDirectVolumeRegxp_,'');
        if (this.arrayDirectVolumeRegexp_.test(scriptData))
           this.addProblem('SJ2007', [node]);
      }
    }
  }
  // Clear the status of test method.
  this.arrayDirectVolumeRegexp_.test('');
  this.stringDirectVolumeRegxp_.test('');
  this.oneLineScriptCommentsRegexp_.test('');
  this.multiLineScriptCommentsRegexp_.test('');

}
); // declareDetector

});
