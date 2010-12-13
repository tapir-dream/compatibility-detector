// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'float_margin_bottom',

chrome_comp.CompDetect.ScanDomBaseDetector,

null,

function checkNode(node, context) {
  function isFloatLeft(element) {
    return chrome_comp.getComputedStyle(element).float == 'left';
  }

  function hasMarginBottom(element) {
    return parseInt(chrome_comp.getComputedStyle(element).marginBottom, 10) > 0;
  }

  function isLowestFloating(element) {
    var cb = chrome_comp.getContainingBlock(element);
    if (!chrome_comp.hasLayoutInIE(cb))
      return;
    var style = chrome_comp.getComputedStyle(cb);
    var pb = parseInt(style.paddingBottom, 10);
    var bb = parseInt(style.borderBottomWidth, 10);
    var fb = element.getBoundingClientRect().bottom;
    var fmb = parseInt(style.marginBottom, 10);
    var cbb = cb.getBoundingClientRect().bottom;
    return cbb == (fb + fmb + pb + bb);
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (!isFloatLeft(node))
    return;
  if (!hasMarginBottom(node))
    return;

  if (isLowestFloating(node))
    this.addProblem('RB1005', [node]);
}
); // declareDetector

});

