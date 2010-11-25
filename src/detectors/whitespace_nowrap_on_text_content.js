// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'whiteSpaceNowrapOnTextContent',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 white-space 特性值不为 nowrap 的非替换元素
 * 查找其内连续紧密相连且设定了 white-space:nowrap 的行内元素，若存在其中某元素出现在包含块范围之外则发出警告
 *
 */


function checkNode(node, additionalData) {
  function isInlineContent(nodeEl) {
    if (nodeEl.nodeType == 3)
      return true;
    if (nodeEl.nodeType == 1) {
      var dis = chrome_comp.getComputedStyle(nodeEl).display,
          inlineList = ['inline', 'inline-block', 'inline-table'];
      if (inlineList.indexOf(dis) != -1)
        return true;
    }
    return false;
  }

  function isPureInlineElement(nodeEl) {
    if (nodeEl.nodeType == 3)
      return false;
    if (nodeEl.nodeType == 1) {
      var descendants = nodeEl.getElementsByTagName('*'),
          inlineList = ['inline', 'inline-block', 'inline-table'];
      for (var i = 0, j = descendants.length; i < j; i++) {
        if (chrome_comp.getComputedStyle(descendants[i]).display != 'inline')
          return false;
        if (chrome_comp.isReplacedElement(descendants[i]))
          return false;
      }
      return true;
    }
  }

  function isWhiteSpaceNowrap(nodeEl) {
    return chrome_comp.getComputedStyle(nodeEl).whiteSpace == 'nowrap';
  }

  function isOverflowCB(nodeElRect, CBRect) {
    if ((nodeElRect.left >= CBRect.right) || (nodeElRect.right <= CBRect.left))
      return true;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (isWhiteSpaceNowrap(node))
    return;

  var ch = node.childNodes, nodeBounding = node.getBoundingClientRect();
  for (var i = 1, j = ch.length; i < j; i++) {
    if (isInlineContent(ch[i]) && (isInlineContent(ch[i - 1]))) {
      if ((ch[i].nodeType != 1) || (ch[i - 1].nodeType != 1))
        continue;
      if (!isPureInlineElement(ch[i]) || !isPureInlineElement(ch[i - 1])) {
        if (!isWhiteSpaceNowrap(ch[i]) || !isWhiteSpaceNowrap(ch[i - 1]))
          continue;
        var chBounding = ch[i].getBoundingClientRect();
        if (isOverflowCB(chBounding, nodeBounding))
          this.addProblem('RT1012', [ch[i]]);
      }
    }
  }
}
); // declareDetector

});

