// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'marginTopOnClearanceElement',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 'clear' 特性不为 'none' 的元素，过滤其 'margin-top' 特性的计算值为 '0' 的情况
 * 得到 clearance 元素的包含块并获取距离其包含块顶部的距离，并由此值开始，循环为 clearance 元素设定 'margin-top' 特性的值，每次 +1，比较每次设定前后 clearance 元素是否在垂直方向上出现位移
 * 若出现位移，则返回第一次出现位移时的 'margin-top' 特性的临界值，并恢复 clearance 元素的 style 对象。若始终未出现位移则可以根据传入的 protection 参数的值决定何时结束循环
 * 如果 clearance 元素原先设定的 'margin-top' 特性的值小于得到临界值则发出警告。
 *
 * 【缺陷】
 * while (true) { } 的做法不好，可能导致循环过多
 * 判断 clearance 元素是否存在同级 previousElementSibling 不存在浮动元素的做法需要完善
 * clearance 元素计算后的 'margin-top' 特性值为 '0' 时是否不存在兼容性问题需要再分析
 * 没有考虑作者使用 css hack 时的情况
 */

function checkNode(node, additionalData) {
  function getContainingBlock(nodeEl) {
    var position = window.chrome_comp.getComputedStyle(nodeEl).position;
    if (nodeEl == document.documentElement || position == 'fixed') 
      return null; 
    if (position == 'absolute') 
      return nodeEl.offsetParent; 
    var nod = nodeEl;
    while (nod) {
      if (nod == document.body) 
        return document.documentElement;
      if (nod.parentNode) 
        nod = nod.parentNode;
      if (window.chrome_comp.getComputedStyle(nod).display ==
          'block' || window.chrome_comp.getComputedStyle(nod).display == 
          'list-item' || isBlockFormattingContext(nod)) 
        return nod;
    }
    return null;
  }

  function isBlockFormattingContext(nodeEl) {
    var display = window.chrome_comp.getComputedStyle(nodeEl).display,
        cssFloat = window.chrome_comp.getComputedStyle(nodeEl).float,
        position = window.chrome_comp.getComputedStyle(nodeEl).position,
        overflow = window.chrome_comp.getComputedStyle(nodeEl).overflow,
        overflowX = window.chrome_comp.getComputedStyle(nodeEl).overflowX,
        overflowY = window.chrome_comp.getComputedStyle(nodeEl).overflowY;
    return (display == 'inline-block') || (display == 'table') ||
      (display == 'table-cell') || (display == 'table-caption') ||
      (position == 'absolute') || (position == 'fixed') ||
      (overflow != 'visible') || (overflowX != 'visible') ||
      (overflowY != 'visible');
  }

  function getBoundaryClearanceSpacing(nodeEl, start, protection) {
    var oldTop, newTop, computedMarginTop = 
        parseInt(chrome_comp.getComputedStyle(nodeEl).marginTop) | 0, i = start,
        definedMarginTop = nodeEl.style.marginTop;
    while (true) {
      i++;
      oldTop = nodeEl.getBoundingClientRect().top;
      nodeEl.style.marginTop = i + 'px';
      newTop = nodeEl.getBoundingClientRect().top;
      if (newTop > oldTop) {
        nodeEl.style.marginTop = (definedMarginTop) ? definedMarginTop : null;
        return --i;
      }
      if (protection && i == protection | 0) {
        nodeEl.style.marginTop = (definedMarginTop) ? definedMarginTop : null;
        return i;
      }
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).clear == 'none')
    return;

  var compMarginTop = parseInt(chrome_comp.getComputedStyle(node).marginTop),
      nodeTop = node.getBoundingClientRect().top,
      containingBlockTop = getContainingBlock(node).getBoundingClientRect().top,
      startTop = compMarginTop - nodeTop - containingBlockTop, boundaryTop;
  if (compMarginTop == 0)
    return;
  boundaryTop = getBoundaryClearanceSpacing(node, startTop, 10000);

  if (compMarginTop < boundaryTop) {
    this.addProblem('RM8006', [node]);
  }
}
); // declareDetector

});

