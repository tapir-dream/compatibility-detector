// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'float_center_css',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (window.chrome_comp.getDefinedStylePropertyByName(node, true, 'float') ===
      'center')
    this.addProblem('RM1025', [node]);
}
); // declareDetector

});
