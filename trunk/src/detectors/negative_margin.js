// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'negativeMargin',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有设定了负的 margin 的元素，若其自身在 IE 中触发了 hasLayout 与设定了 position:relative，同时其包含块也触发了 hasLayout 则停止检测
 * 获取元素及其包含块四个方向的绝对位置，若出现位置溢出包含块则发出警告
 *
 */


function checkNode(node, additionalData) {
  function isNegativeMargin(nodeEl) {
    var t = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginTop),
        r = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginRight),
        b = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginbottom),
        l = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginLeft);
    return (t < 0) || (r < 0) || (b < 0) || (l < 0);
  }

  function isRelativePositioned(nodeEl) {
    return window.chrome_comp.getComputedStyle(nodeEl).position == 'relative';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!isNegativeMargin(node))
    return;
  
  var cb = window.chrome_comp.getContainingBlock(node);
  if (window.chrome_comp.hasLayoutInIE(cb) && isRelativePositioned(node) &&
      window.chrome_comp.hasLayoutInIE(node))
    return;

  var nodeBound = node.getBoundingClientRect(),
      cbBound = cb.getBoundingClientRect();
  if (nodeBound.top < cbBound.top || nodeBound.right > cbBound.right ||
      nodeBound.bottom > cbBound.bottom || nodeBound.left < cbBound.left) {
    this.addProblem('RB1001', [cb]);
    
  }
}
); // declareDetector

});

