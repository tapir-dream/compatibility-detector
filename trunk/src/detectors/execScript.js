// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'execscript',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  this.execScriptSyntaxRegexp_ = /([^\w$]*execScript\s?[\(\w$])|([^\w$]*window([.]execScript|\[["']execScript["']\])\s?[\(\w$])/g
  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;

  var scriptData = '';
  if (node.tagName == 'SCRIPT') {
    if (node.src && node.src != '')
      scriptData = (node.src in context) ? context[node.src] : '';
    else
      scriptData = node.text;

    //delete script comment
    scriptData = scriptData.replace(this.oneLineScriptCommentsRegexp_, '')
        .replace(this.multiLineScriptCommentsRegexp_, '');

    if (this.execScriptSyntaxRegexp_.test(scriptData)) {
      this.addProblem('BX9055', [node]);
      this.execScriptSyntaxRegexp_.test('');
    }
  } else {
    for (var i = 0, l = node.attributes.length; i < l; i++) {
      if (node.attributes[i].name.toLowerCase().indexOf('on') == 0) {
        //delete script comment
        scriptData = node.attributes[i].value
            .replace(this.oneLineScriptCommentsRegexp_, '')
            .replace(this.multiLineScriptCommentsRegexp_, '');
      }
      if (this.execScriptSyntaxRegexp_.test(scriptData)) {
        this.addProblem('BX9055', [node]);
        this.execScriptSyntaxRegexp_.test('');
      }
    }
  }
}
); // declareDetector

});
