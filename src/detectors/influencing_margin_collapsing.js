// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'influencingMarginCollapsing',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 *【缺陷】
 * 
 */


function checkNode(node, context) {
  function hasFloatOrPositionedBeforeFirstInFlowChild(element) {
    var first = getFirstInFlowElement(element);
    if (!first)
      return false;
    var ch = element.children;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (!isInFlow(ch[i]))
        return ch[i];
      if (hasPureFloatOrPositioned(ch[i]) && isZeroHeight(ch[i]))
        return ch[i];
      if (ch[i] == first)
        return;
    }
    return false;
  }

  function hasFloatOrPositionedAfterLastInFlowChild(element) {
    var last = getLastInFlowElement(element), reWS = /^\s*$/g;
    if (!last)
      return false;
    var ch = element.children;
    for (var i = ch.length - 1, j = 0; i >= j; i--) {
      if (!isInFlow(ch[i]))
        return ch[i];
      if (hasPureFloatOrPositioned(ch[i]) && isZeroHeight(ch[i]))
        return ch[i];
      if (ch[i].innerText.match(reWS))
        return ch[i];
      if (ch[i] == last)
        return;
    }
    return false;
  }

  function isInFlow(element) {
    if (!element)
      return null;
    var pos = chrome_comp.getComputedStyle(element).position,
        fl = chrome_comp.getComputedStyle(element).float,
        dis = chrome_comp.getComputedStyle(element).display;
    return (pos != 'absolute') && (pos != 'fixed') && (fl == 'none') &&
        (dis != 'none');
  }

  function getFirstInFlowElement(element) {
    var ch = element.childNodes, reWS = /^\s*$/g, reNBSP = /\u00a0/g;
    if (!element.firstElementChild)
      return null;
    for (var i = 0, j = ch.length; i < j; i++) {
      var nv = ch[i].nodeValue;
      if (ch[i].nodeType == 3) {
        if (!nv.match(reWS))
          return null;
        if (nv.match(reNBSP))
          return null;
      } else if (ch[i].nodeType == 1) {
        if (!isInFlow(ch[i]))
          continue;
        if (isInFlow(ch[i]))
          return ch[i];
      }
    }
    return null;
  }

  function getLastInFlowElement(element) {
    var ch = element.childNodes, reWS = /^\s*$/g, reNBSP = /\u00a0/g;
    if (!element.lastElementChild)
      return null;
    for (var i = ch.length - 1, j = 0; i >= j; i--) {
      var nv = ch[i].nodeValue;
      if (ch[i].nodeType == 3) {
        if (!nv.match(reWS))
          return null;
        if (nv.match(reNBSP))
          return null;
      } else if (ch[i].nodeType == 1) {
        if (!isInFlow(ch[i]))
          continue;
        if (isInFlow(ch[i]))
          return ch[i];
      }
    }
    return null;
  }

  function hasPureFloatOrPositioned(element) {
    var ch = element.children;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (!isInFlow(ch[i])) {
        return true;
      }
      if (isZeroHeight(ch[i])) {
        return hasPureFloatOrPositioned(ch[i]);
      }
      return false;
    }
  }

  function isZeroHeight(element) {
    return element.offsetHeight == 0;
  }

  function isBlockFormattingContext(element) {
    var display = window.chrome_comp.getComputedStyle(element).display,
        cssFloat = window.chrome_comp.getComputedStyle(element).float,
        position = window.chrome_comp.getComputedStyle(element).position,
        overflow = window.chrome_comp.getComputedStyle(element).overflow,
        overflowX = window.chrome_comp.getComputedStyle(element).overflowX,
        overflowY = window.chrome_comp.getComputedStyle(element).overflowY;
    return (display == 'inline-block') || (display == 'table') ||
      (display == 'table-cell') || (display == 'table-caption') ||
      (position == 'absolute') || (position == 'fixed') ||
      (overflow != 'visible') || (overflowX != 'visible') ||
      (overflowY != 'visible') || (cssFloat != 'none');
  }

  function hasTopBorderAndPadding(element) {
    var bt = parseInt(chrome_comp.getComputedStyle(element).borderTopWidth),
        pt = parseInt(chrome_comp.getComputedStyle(element).paddingTop);
    return (bt != 0) || (pt != 0);
  }

  function hasBottomBorderAndPadding(element) {
    var bb = parseInt(chrome_comp.getComputedStyle(element).borderBottomWidth),
        pb = parseInt(chrome_comp.getComputedStyle(element).paddingBottom);
    return (bb != 0) || (pb != 0);
  }

  function hasMarginTop(element) {
    return parseInt(chrome_comp.getComputedStyle(element).marginTop) != 0;
  }

  function hasMarginBottom(element) {
    return parseInt(chrome_comp.getComputedStyle(element).marginBottom) != 0;
  }

  function getPreviousCollapsing(element) {
    if (!hasMarginTop(element))
      return null;
    var el = element;
    while (el) {
      el = el.previousElementSibling;
      if (isInFlow(el)) {
        if (!isZeroHeight(el)) {
          if (hasMarginBottom(el))
            return el;
        }
      }
    }
  }

  function isFloating(element) {
    return chrome_comp.getComputedStyle(element).float != 'none';
  }

  function getFloatingBetweenMarginCollapsing(element) {
    var el = element;
    while (el) {
      el = el.nextElementSibling;
      if (!el)
        return null;
      if (isFloating(el))
        return el;
      if (isZeroHeight(el)) {
        if (hasPureFloatOrPositioned(el))
          return el;
      }
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if ((node.tagName == 'HTML') || (node.tagName == 'BODY'))
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (isBlockFormattingContext(node))
    return;

  if (!hasMarginTop(node) && !hasMarginBottom(node))
    return;

  if (chrome_comp.getComputedStyle(node).display == 'inline')
    return;

  if (hasTopBorderAndPadding(node) || hasBottomBorderAndPadding(node))
    return;

  var f = hasFloatOrPositionedBeforeFirstInFlowChild(node),
      l = hasFloatOrPositionedAfterLastInFlowChild(node);
  if (f && hasMarginTop(node))
    this.addProblem('RB8004', [f]);
  if (l && hasMarginBottom(node))
    this.addProblem('RB8004', [l]);

  //alert((getPreviousCollapsing(node)) ? getPreviousCollapsing(node).outerHTML : null);
  var prev = getPreviousCollapsing(node);
  if (prev && getFloatingBetweenMarginCollapsing(prev)) {
    this.addProblem('RB8004', [prev]);
  }




}
); // declareDetector

});

