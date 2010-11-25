// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'emptyInlineBoxModel',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有带有非自闭和的行内非替换元素，若其内容为空（包括空白符），若其设定了宽度大于 0 的 border，以及在设定了宽度大于 0 的 padding 的情况下设定了背景，则发出警告
 * 检测 Q 以外的所有带有非自闭和的行内非替换元素，若其上一个兄弟节点是以空白符结尾的行内文本则发出警告
 *
 */


function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  var blockList = ['BR', 'IMG'];
  if (blockList.indexOf(node.tagName) != -1)
    return;

  if (chrome_comp.getComputedStyle(node).display != 'inline')
    return;

  var reWS = /^\s*$/, reWSEnd = /.+\s+$/, t = 'transparent';
  if (!reWS.test(node.textContent))
    return;
  var btw = parseInt(chrome_comp.getComputedStyle(node).borderTopWidth),
      brw = parseInt(chrome_comp.getComputedStyle(node).borderRightWidth),
      bbw = parseInt(chrome_comp.getComputedStyle(node).borderBottomWidth),
      blw = parseInt(chrome_comp.getComputedStyle(node).borderLeftWidth),
      btc = chrome_comp.getComputedStyle(node).borderTopColor,
      brc = chrome_comp.getComputedStyle(node).borderRightColor,
      bbc = chrome_comp.getComputedStyle(node).borderBottomColor,
      blc = chrome_comp.getComputedStyle(node).borderLeftColor,
      pt = parseInt(chrome_comp.getComputedStyle(node).paddingTop),
      pr = parseInt(chrome_comp.getComputedStyle(node).paddingRight),
      pb = parseInt(chrome_comp.getComputedStyle(node).paddingBottom),
      pl = parseInt(chrome_comp.getComputedStyle(node).paddingLeft),
      bi = chrome_comp.getComputedStyle(node).backgroundImage,
      bc = chrome_comp.getComputedStyle(node).backgroundColor;
  if (((btw || brw || bbw || blw) && (btc != t || brc != t || bbc != t || 
      blc != t)) || ((pt || pr || pb || pl) && (bi || bc != t))) {
    this.addProblem('RD3029', [node]);
  }
  var p = node.previousSibling;
  if (node.tagName == 'Q')
    return;
  if (!p)
    return;
  if (p.nodeType == 1) {
    if (chrome_comp.getComputedStyle(p).display == 'inline') {
      if (reWSEnd.test(p.textContent))
        this.addProblem('BW9012', [node]);
    }
  } else if (p.nodeType == 3) {
    if (reWSEnd.test(p.nodeValue))
      this.addProblem('BW9012', [node]);
  }
}
); // declareDetector

});

