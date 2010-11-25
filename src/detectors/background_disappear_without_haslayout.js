// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'backgroundDisappearWithoutHasLayout',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 过滤掉 clear:none 的元素，过滤掉没有通过 clear 特性清除浮动的包含块，过滤掉包含块宽度较宽且包含块内包含非 clearance 的普通流节点的元素
 * 若包含块设定了背景图片则发出警告
 * 若包含块的背景色与其容器背景色不同则发出警告
 *
 * 【缺陷】
 * 此问题情况比较复杂，若包含块之后存在普通流中的元素且非触发hasLayout则可能不会出现背景色异常
 * 没有考虑作者使用 css hack 时的情况
 */


function checkNode(node, additionalData) {
  function getNextHasLayoutElement(nodeEl) {
    var nod = nodeEl;
    while (nod) {
      nod = nod.nextElementSibling;
      if (nod && window.chrome_comp.hasLayoutInIE(nod))
        return nod;
    }
  }

  function getNearestHasLayoutAncestor(nodeEl) {
    var nod = nodeEl;
    while (nod) {
      nod = nod.parentNode;
      if (nod && window.chrome_comp.hasLayoutInIE(nod))
        return nod;
    }
  }

  function hasOnlyFloat(nodeEl) {
    var ch = nodeEl.childNodes, reWS = /^\s*$/,
        last = nodeEl.lastElementChild;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (ch[i].nodeType == 1) {
        if (chrome_comp.getComputedStyle(ch[i]).clear != 'none' && 
            ch[i] == last)
          return true;
        if (chrome_comp.getComputedStyle(ch[i]).display != 'block')
          return false;
        if (chrome_comp.getComputedStyle(ch[i]).float == 'none')
          return false;
      }
      if (ch[i].nodeType == 3) {
        if (!reWS.test(ch[i].nodeValue))
          return false;
      }
    }
    return true;
  }

  function getNearestLesserWidthAncestor(nodeEl) {
    var parent = nodeEl.parentNode,
        width = parseInt(chrome_comp.getComputedStyle(nodeEl).width),
        pWidth = parseInt(chrome_comp.getComputedStyle(parent).width);
    return pWidth < width;
  }

  function hasClearanceSpacing(nodeEl) {
    var oldTop, newTop, inlineMarginTop = nodeEl.style.marginTop;
    nodeEl.style.marginTop = '-1px';
    oldTop = nodeEl.getBoundingClientRect().top;
    nodeEl.style.marginTop = '0px';
    newTop = nodeEl.getBoundingClientRect().top;
    nodeEl.style.marginTop = (inlineMarginTop) ? inlineMarginTop : null;
    return newTop == oldTop;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var clearDir = window.chrome_comp.getComputedStyle(node).clear;
  if (clearDir == 'none')
    return;
  if (!hasClearanceSpacing(node))
    return;
  if (!getNearestLesserWidthAncestor(node) && !hasOnlyFloat(node.parentNode))
    return;

  var cb = window.chrome_comp.getContainingBlock(node), cbBgColor, cbCbBgColor;
  cbBgColor = window.chrome_comp.getComputedStyle(cb).backgroundColor;
  cbBgImage = window.chrome_comp.getComputedStyle(cb).backgroundImage;
  if (cbBgColor == window.chrome_comp.COLOR_TRANSPARENT)
    return;
  if (cbBgImage) {
    this.addProblem('RM3007', [cb]);
  } else {
    if (window.chrome_comp.getComputedStyle(
        window.chrome_comp.getContainingBlock(cb)).backgroundColor != 
        cbBgColor) {
      this.addProblem('RM3007', [cb]);
    }
  }
}
); // declareDetector

});

