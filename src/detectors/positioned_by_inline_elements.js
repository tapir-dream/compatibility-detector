addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'positioned_by_inline_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  /*function isShrinkToFit(node) {
    var width = window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'width');
    if (width && width != 'auto') return;
    var position = window.chrome_comp.getComputedStyle(node).position,
        cssFloat = window.chrome_comp.getComputedStyle(node)['float'],
        inlineBlock = window.chrome_comp.getComputedStyle(node).display,
        isAbsPosition = (position == 'absolute') || (position == 'fixed'),
        isFloat = (cssFloat == 'left') || (cssFloat == 'right'),
        isInlineBlock = inlineBlock == 'inline-block';
    return isAbsPosition || isFloat || isInlineBlock;
  }*/

  if (Node.ELEMENT_NODE != node.nodeType ||
      window.chrome_comp.getComputedStyle(node).display != 'inline')
    return;
  if (window.chrome_comp.getComputedStyle(node).position != 'relative')
    return;
  for (var i = 0, j = node.getElementsByTagName('*'), k = j.length; i < k; 
      i++) {
    var pos = window.chrome_comp.getComputedStyle(j[i]).position,
        isCB = (pos == 'absolute' && j[i].offsetParent == node);
    if (!isCB) continue;
    this.addProblem('RM1020', [j[i]]);
  }
}
); // declareDetector

});

