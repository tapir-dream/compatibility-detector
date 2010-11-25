// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'staticPosition',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有遵循静态位置定位的绝对定位元素
 * 得到其自身静态时的 display 特性值，以及其上一个非空白节点的 display 特性值，若出现如 RCA 中的差异则发出警告
 *
 *【缺陷】
 * 
 */


function checkNode(node, additionalData) {
  function isStaticPosition(element) {
    var top = chrome_comp.getComputedStyle(element).top,
        right = chrome_comp.getComputedStyle(element).right,
        bottom = chrome_comp.getComputedStyle(element).bottom,
        left = chrome_comp.getComputedStyle(element).left;
    return (top == 'auto') && (right == 'auto') && (bottom == 'auto') &&
        (left == 'auto');
  }

  function isPositioned(element) {
    var pos = chrome_comp.getComputedStyle(element).position;
    return (pos == 'absolute') || (pos == 'fixed');
  }

  function getPreviousSiblingType(element) {
    var prev = element.previousSibling;
    if (!prev)
      return;
    while (prev.nodeType == 3 && /^\s+$/g.test(prev.nodeValue)) {
      prev = prev.previousSibling;
    }
    var dis = chrome_comp.getComputedStyle(prev).display,
        cssFloat = chrome_comp.getComputedStyle(prev).float;
    if (prev.nodeType == 3) {
      return 'inline';
    } else if (prev.nodeType == 1) {
      if (cssFloat != 'none')
        return 'float';
      var blockList = ['table', 'block', 'list-item'];
      if (blockList.indexOf(dis) != -1)
        return 'block';
      if (dis == 'inline')
        return 'inline';
      if (dis == 'inline-block')
        return 'inline-block';
    }
  }

  function getType(element) {
    var dis = getStaticDisplayValue(element),
        cssFloat = chrome_comp.getComputedStyle(element).float;
    if (element.nodeType == 1) {
      if (cssFloat != 'none')
        return 'float';
      var blockList = ['table', 'block', 'list-item'];
      if (blockList.indexOf(dis) != -1)
        return 'block';
      if (dis == 'inline')
        return 'inline';
      if (dis == 'inline-block')
        return 'inline-block';
    }
  }

  function getStaticDisplayValue(element) {
    var pos = element.style.position;
    element.style.position = 'static !important';
    var staticDis = chrome_comp.getComputedStyle(element).display;
    element.style.position = null;
    element.style.position = (pos) ? pos : null;
    return staticDis;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (!isPositioned(node))
    return;

  if (!isStaticPosition(node))
    return;

  var prevType = getPreviousSiblingType(node),
      type = getType(node);
  if (!type || !prevType)
    return;

  switch (prevType) {
    case 'inline':
      if (type == 'block' || type == 'inline-block')
        this.addProblem('RM8012', [node]);
      break;
    case 'block':
      return;
    case 'inline-block':
      if (type == 'block' || type == 'inline-block')
        this.addProblem('RM8012', [node]);
      break;
    case 'float':
      this.addProblem('RM8012', [node]);
      break;
  }
}
); // declareDetector

});

