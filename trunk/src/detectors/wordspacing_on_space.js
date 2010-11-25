// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'wordSpacingOnSpace',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 word-spacing 特性值不为 0 或 normal 的，且其内部包含纯文本节点的非替换元素
 * 若文本节点中包含 &nbsp; 或者连表意空格则发出警告
 *
 *【缺陷】
 * 
 */


function checkNode(node, additionalData) {
  function hasTextNode(element) {
    var ch = element.childNodes, has = false, list = [];
    for (var i = 0, j = ch.length; i < j; i++) {
      if (ch[i].nodeType == 3) {
        has = has || true;
        list.push(ch[i]);
      }
    }
    return { list : list, has : has }
  }

  function isSetWordSpacing(element) {
    return parseInt(chrome_comp.getComputedStyle(element).wordSpacing) != 0;
  }

  function hasNonBreakingSpace(string) {
    return /\u00a0/g.test(string);
  }
  
  function hasIdeographicSpace(string) {
    var res = string.match(/\u3000/g);
    return res && res.length > 0;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (!isSetWordSpacing(node))
    return;

  var textNode = hasTextNode(node);
  if (!textNode.has)
    return;

  for (var i = 0, j = textNode.list.length; i < j; i++) {
    if (hasNonBreakingSpace(textNode.list[i].nodeValue) || 
        hasIdeographicSpace(textNode.list[i].nodeValue))
      this.addProblem('RT2013', [node]);
  }
}
); // declareDetector

});

