// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'invisibleElementOverflow',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有宽度或者高度为 0 的元素
 * 判断其包含块的 overflow 特性是否为 auto 或 scroll
 *
 */


function checkNode(node, additionalData) {
  function isInvisible(nodeEl) {
    var w = parseInt(window.chrome_comp.getComputedStyle(nodeEl).width),
        h = parseInt(window.chrome_comp.getComputedStyle(nodeEl).height);
    return (w == 0) || (h == 0);
  }

  function isOverflowAutoOrScroll(nodeEl) {
    return window.chrome_comp.getComputedStyle(nodeEl).overflow == 'auto' ||
        window.chrome_comp.getComputedStyle(nodeEl).overflow == 'scroll';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!isInvisible(node))
    return;
  
  var cb = window.chrome_comp.getContainingBlock(node);
  if (!cb)
    return;
  
  if (!isOverflowAutoOrScroll(cb))
    return;
  
  var nodeBound = node.getBoundingClientRect(),
      cbBound = cb.getBoundingClientRect();
  if (nodeBound.top < cbBound.top || nodeBound.right > cbBound.right ||
      nodeBound.bottom > cbBound.bottom || nodeBound.left < cbBound.left) {
    this.addProblem('BX8037', [node]);
    
  }
}
); // declareDetector

});

