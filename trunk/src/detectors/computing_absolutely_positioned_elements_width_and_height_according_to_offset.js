// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'computingAbsolutelyPositionedElementsWidthAndHeightAccordingToOffset',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 过滤掉 position 特性值不为 absolute 和 fixed 的情况
 * 得到元素的 width left right 特性的计算值，若 left 和 right 不为 auto 且 width 为 auto 时判断根据规范计算后的宽度是否恰好等于其 shrink-to-fit 宽度，若是则发出警告
 * 对于高度也是如此
 *
 * 【缺陷】
 * 判断宽度和高度是否为 auto，存在问题，如 CSS 文件跨域
 * 没有考虑作者使用 css hack 时的情况
 */


function checkNode(node, additionalData) {
  function isPositioned(nodeEl) {
    var position = window.chrome_comp.getComputedStyle(nodeEl).position;
    return (position == 'absolute') || (position == 'fixed');
  }

  function isWidthAuto(nodeEl) {
    var width = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true, 
      'width');
    return !width || width == 'auto';
  }

  function isHeightAuto(nodeEl) {
    var height = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true, 
      'height');
    return !height || height == 'auto';
  }

  if (Node.ELEMENT_NODE != node.nodeType || !isPositioned(node))
    return;
  var left = window.chrome_comp.getComputedStyle(node).left,
      right = window.chrome_comp.getComputedStyle(node).right,
      width = window.chrome_comp.getComputedStyle(node).width;
  if (left != 'auto' && right != 'auto' && isWidthAuto(node)) {
    node.style.left = 'auto';
    node.style.right = 'auto';
    var stfWidth = window.chrome_comp.getComputedStyle(node).width;
    node.style.left = left;
    node.style.right = right;
    if (width != stfWidth) {
      this.addProblem('RD8008', [node]);
      return;
    }
  }
  var top = window.chrome_comp.getComputedStyle(node).top,
        bottom = window.chrome_comp.getComputedStyle(node).bottom,
        height = window.chrome_comp.getComputedStyle(node).height;
    if (left != 'auto' && right != 'auto' && isHeightAuto(node)) {
      node.style.top = 'auto';
      node.style.bottom = 'auto';
      var stfHeight = window.chrome_comp.getComputedStyle(node).height;
      node.style.top = top;
      node.style.bottom = bottom;
      if (height != stfHeight) {
        this.addProblem('RD8008', [node]);
        return;
      }
    }
}
); // declareDetector

});

