// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'fontSizeStretching',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 非替换行内 元素内的行内元素
 * 若其 font-size 特性计算值大于 其父元素的则发出警告
 *
 */


function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;
  
  if (chrome_comp.getComputedStyle(node).display != 'inline')
    return;
  
  var fontSize = parseInt(chrome_comp.getComputedStyle(node).fontSize),
      children = node.children, chFontSize;
  for (var i = 0, j = children.length; i < j; i++) {
    chFontSize = parseInt(chrome_comp.getComputedStyle(children[i]).fontSize);
    if ((chFontSize > fontSize) && 
        (chrome_comp.getComputedStyle(children[i]).display != 'none'))
      this.addProblem('RD1011', [children[i]]);
  }
  

  
  
}
); // declareDetector

});

