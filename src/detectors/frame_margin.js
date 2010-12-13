// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'frameMarginWidthAndHightDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'FRAME' && node.tagName != 'IFRAME')
    return;

  var propertyValueRegExp_ = /(^\d+$)|(^\s*$)|^null$/;

  if (!propertyValueRegExp_.test(node.getAttribute('marginwidth')))
    this.addProblem('HM1002', [node]);
  if (!propertyValueRegExp_.test(node.getAttribute('marginheight')))
    this.addProblem('HM1002', [node]);

}
); // declareDetector

});
