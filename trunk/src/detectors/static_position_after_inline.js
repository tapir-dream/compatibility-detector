// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'staticPositionAfterInline',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 type 属性值为 text、password、button、reset、submit 的 INPUT 元素
 * 文本框通过将其 line-height 特性设定为 normal 再恢复判断其是否设定了不为 normal 值的 line-height
 * 按钮通过将其 -webkit-appearance 私有特性设定为 textfield 再回复来判断其是否设定了不为 normal 值的 line-height
 * 若上述表单控件设定了不为 normal 的 line-height 则发出警告
 *
 *【缺陷】
 * 仅考虑了 IE 和 Chrome 之间的差异
 * 没有考虑用户私自设定了 -webkit-appearance 私有特性的情况
 */


function checkNode(node, additionalData) {
  function isVerticalStaticPosition(nodeEl) {
    /*var inlineTop = nodeEl.style.top,
        inlineBottom = nodeEl.style.bottom,
        oldCompTop = parseInt(chrome_comp.getComputedStyle(nodeEl).top),
        oldCompBottom = parseInt(chrome_comp.getComputedStyle(nodeEl).bottom);
    nodeEl.style.top = 'auto';
    nodeEl.style.bottom = 'auto';
    var compTop = parseInt(chrome_comp.getComputedStyle(nodeEl).top),
        compBottom = parseInt(chrome_comp.getComputedStyle(nodeEl).bottom),
        ret = (oldCompTop == compTop) && (oldCompBottom == compBottom);
    alert(oldCompTop + '\n' + compTop);
    nodeEl.style.top = (inlineTop) ? inlineTop : null;
    nodeEl.style.bottom = (inlineBottom) ? inlineBottom : null;*/
    var top = chrome_comp.getComputedStyle(nodeEl).top,
        bottom = chrome_comp.getComputedStyle(nodeEl).bottom;
    return (top == 'auto') && (bottom == 'auto');
  }
  
  function isAbsolutelyPositioned(nodeEl) {
    var pos = chrome_comp.getComputedStyle(nodeEl).position;
    return (pos == 'absolute') || (pos == 'fixed');
  }
  
  function isHidden(nodeEl) {
    return (chrome_comp.getComputedStyle(nodeEl).display == 'none') ||
        (chrome_comp.getComputedStyle(nodeEl).visibility == 'hidden');
  }

  function hasInlinePreviousSibling(nodeEl) {
    var nod = nodeEl, reWS = /^\s*$/;
    while (nod) {
      nod = nod.previousSibling;
      if (!nod)
        return null;
      if (nod.nodeType == 3) {
        if (reWS.test(nod.nodeValue))
          continue;
        return !reWS.test(nod.nodeValue);
      } else if (nod.nodeType == 1) {
        return chrome_comp.getComputedStyle(nod).display == 'inline'
      }
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!isAbsolutelyPositioned(node))
    return;
  
  if (isHidden(node))
    return;
  
  if (!isVerticalStaticPosition(node))
    return;

  if (hasInlinePreviousSibling(node))
    this.addProblem('RD8019', [node]);
  
  
}
); // declareDetector

});

