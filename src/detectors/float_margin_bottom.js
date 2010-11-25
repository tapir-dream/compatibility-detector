// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'floatMarginBottom',

chrome_comp.CompDetect.ScanDomBaseDetector,

/*【思路】
 * 检测当前元素是否为左浮动元素，且其包含块是否触发了 hasLayout 特性
 * 判断浮动元素的底部 margin box 是否紧邻到了其包含块的底部 padding box，若是则发出警告
 *
 *【缺陷】
 * 对浮动元素的位置判断可能会不准确
 */

null,

function checkNode(node, context) {
  function isFloatLeft(element) {
    return chrome_comp.getComputedStyle(element).float == 'left';
  }

  function hasMarginBottom(element) {
    return parseInt(chrome_comp.getComputedStyle(element).marginBottom) > 0;
  }

  function isLowestFloating(element) {
    var cb = chrome_comp.getContainingBlock(element);
    if (!chrome_comp.hasLayoutInIE(cb))
      return;
    var pb = parseInt(chrome_comp.getComputedStyle(cb).paddingBottom);
    var bb = parseInt(chrome_comp.getComputedStyle(cb).borderBottomWidth);
    var fb = element.getBoundingClientRect().bottom;
    var fmb = parseInt(chrome_comp.getComputedStyle(element).marginBottom);
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

