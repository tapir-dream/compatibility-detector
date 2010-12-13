// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'fontsize_stretching',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (chrome_comp.getComputedStyle(node).display != 'inline')
    return;

  var fontSize = parseInt(chrome_comp.getComputedStyle(node).fontSize, 10);
  var ch = node.children;
  var chFontSize;
  for (var i = 0, j = ch.length; i < j; i++) {
    chFontSize = parseInt(chrome_comp.getComputedStyle(ch[i]).fontSize, 10);
    if ((chFontSize > fontSize) && 
        (chrome_comp.getComputedStyle(ch[i]).display != 'none'))
      this.addProblem('RD1011', [ch[i]]);
  }
}
); // declareDetector

});

