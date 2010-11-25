// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'defaultMarginDisappear',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有设定了负的 margin 的元素，若其自身在 IE 中触发了 hasLayout 与设定了 position:relative，同时其包含块也触发了 hasLayout 则停止检测
 * 获取元素及其包含块四个方向的绝对位置，若出现位置溢出包含块则发出警告
 *
 */


function checkNode(node, additionalData) {
  function getContainingBlock(nodeEl) {
    var position = window.chrome_comp.getComputedStyle(nodeEl).position;
    if (nodeEl == document.documentElement) { return null; }
    if (position == 'fixed') { return null; }
    if (position == 'absolute') { return nodeEl.offsetParent; }
    var nod = nodeEl;
    while (nod) {
      if (nod == document.body) return document.documentElement;
      if (nod.parentNode) nod = nod.parentNode;
      if (window.chrome_comp.getComputedStyle(nod).display ==
          'block' || isBlockFormattingContext(nod)) {
        return nod;
      }
    }
    return null;
  }

  function isBlockFormattingContext(nodeEl) {
    var display = window.chrome_comp.getComputedStyle(nodeEl).display,
        cssFloat = window.chrome_comp.getComputedStyle(nodeEl)['float'],
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

  function isHavingLayout(nodeEl) {
    var display = window.chrome_comp.getComputedStyle(nodeEl).display,
        cssFloat = window.chrome_comp.getComputedStyle(nodeEl)['float'],
        width = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true, 
            'width'),
        height = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true,
            'height'),
        position = window.chrome_comp.getComputedStyle(nodeEl).position,
        writingMode = window.chrome_comp.getComputedStyle(nodeEl).writingMode,
        zoom = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true, 
            'zoom'),
        minWidth = window.chrome_comp.getComputedStyle(nodeEl).minWidth,
        minHeight = window.chrome_comp.getComputedStyle(nodeEl).minHeight,
        maxWidth = window.chrome_comp.getComputedStyle(nodeEl).maxWidth,
        maxHeight = window.chrome_comp.getComputedStyle(nodeEl).maxHeight,
        overflow = window.chrome_comp.getComputedStyle(nodeEl).overflow,
        overflowX = window.chrome_comp.getComputedStyle(nodeEl).overflowX,
        overflowY = window.chrome_comp.getComputedStyle(nodeEl).overflowY,
        tagList = ['HTML', 'BODY', 'TABLE', 'TR', 'TH', 'TD', 'BUTTON', 
            'FIELDSET', 'LEGEND', 'MARQUEE'];
    if (display == 'none') { return false; }
    if (tagList.indexOf(nodeEl.tagName) != -1) { return true; }
    if (display == 'inline-block') { return true; }
    if (cssFloat == 'left' || cssFloat == 'right') { return true; }
    if (position == 'absolute' || position == 'fixed') { return true; }
    if (minWidth != '0px') { return true }
    if (minHeight != '0px') { return true }
    if (maxWidth != 'none') { return true }
    if (maxHeight != 'none') { return true }
    if (overflow != 'visible') { return true }
    if (overflowX != 'visible') { return true }
    if (overflowY != 'visible') { return true }
    if (writingMode == 'tb-rl') { return true; }
    if (zoom && zoom != 'normal') { return true; }
    if (width && width != 'auto') { return true; }
    if (height && height != 'auto') { return true; }
    return false;
  }

  function isNegativeMargin(nodeEl) {
    var t = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginTop),
        r = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginRight),
        b = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginbottom),
        l = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginLeft);
    return (t < 0) || (r < 0) || (b < 0) || (l < 0);
  }

  function isNotInFlow(nodeEl) {
    return (window.chrome_comp.getComputedStyle(nodeEl).position == 
        'absolute') || (window.chrome_comp.getComputedStyle(nodeEl).position ==
        'fixed') || (window.chrome_comp.getComputedStyle(nodeEl).float !=
        'none');
  }

  function isDefaultMargin(nodeEl) {
    var mt = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, false, 
          'margin-top'),
        mb = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, false, 
          'margin-bottom');
    return !mt || !mb;
  }

  function isFirstInFlow(nodeEl, containingBlock) {
    var p = containingBlock.firstElementChild;
    while (p) {
      if (p == nodeEl) {
        return true;
      }
      if (isNotInFlow(p)) {
        p = p.nextElementSibling;
        continue;
      } else {
        return false;
      }
      p = p.nextElementSibling;
    }
    return false;
  }
  
  function isLastInFlow(nodeEl, containingBlock) {
    var p = containingBlock.lastElementChild;
    while (p) {
      if (p == nodeEl) {
        return true;
      }
      if (isNotInFlow(p)) {
        p = p.previousElementSibling;
        continue;
      } else {
        return false;
      }
      p = p.previousElementSibling;
    }
    return false;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var tagList = ['BLOCKQUOTE', 'DL', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 
      'H6', 'OL', 'P', 'PRE', 'UL'];

  if (tagList.indexOf(node.tagName) == -1)
    return;

  if (!isDefaultMargin(node))
    return;

  if (isNotInFlow(node)) {
    this.addProblem('RM1009', [node]);
    return;
  }
//alert(node);
  var cb = getContainingBlock(node), t = node.tagName;
  if (t == 'P' && (isFirstInFlow(node, cb) || isLastInFlow(node, cb))) {
    this.addProblem('RM1009', [node]);
    return;
  }
  if (t != 'P' && isFirstInFlow(node, cb)) {
    this.addProblem('RM1009', [node]);
    return;
  }
}
); // declareDetector

});

