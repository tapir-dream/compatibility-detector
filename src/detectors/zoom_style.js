addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'zoom_style',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var nodeCssZoomValue =
        parseInt(chrome_comp.getComputedStyle(node).zoom,10);

  if ( isNaN(nodeCssZoomValue) )
    return;

  if ( nodeCssZoomValue > 1 )
    this.addProblem('BX8017', [node]);
}
); // declareDetector

});
