// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'replacedElementLineHeight',

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
  function testLineHeightChanged(nodeEl, refValue) {
    var oldInlineValue = nodeEl.style.lineHeight, newCompValue;
    nodeEl.style.lineHeight = 'normal';
    newCompValue = parseInt(chrome_comp.getComputedStyle(nodeEl).lineHeight);
    if (refValue == ((newCompValue) ? newCompValue : 'normal')) {
      nodeEl.style.lineHeight = (oldInlineValue) ? oldInlineValue : null;
      return false;
    } else {
      nodeEl.style.lineHeight = (oldInlineValue) ? oldInlineValue : null;
      return true;
    }
  }

  function testDefinedLineHeight(nodeEl, refValue) {
    var oldInlineValue = nodeEl.style.WebkitAppearance, newCompValue;
    nodeEl.style.WebkitAppearance = 'textfield';
    newCompValue = parseInt(chrome_comp.getComputedStyle(nodeEl).lineHeight);
    if (refValue == ((newCompValue) ? newCompValue : 'normal')) {
      nodeEl.style.WebkitAppearance = (oldInlineValue) ? oldInlineValue : null;
      return false;
    } else {
      nodeEl.style.WebkitAppearance = (oldInlineValue) ? oldInlineValue : null;
      return true;
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!chrome_comp.isReplacedElement(node))
    return;
  
  if (node.tagName != 'INPUT')
    return;
  
  var type = node.type.toLowerCase(),
      compLineHeight = parseInt(chrome_comp.getComputedStyle(node).lineHeight),
      compHeight = parseInt(chrome_comp.getComputedStyle(node).height);
  if (type == 'text' || type == 'password') {
    if (compLineHeight == compHeight) {
      if (testLineHeightChanged(node, 
          (compLineHeight) ? compLineHeight : 'normal')) {
        this.addProblem('RD1012', [node]);
      }
    }
  } else if (type == 'button' || type == 'submit' || type == 'reset') {
      if(testDefinedLineHeight(node, 
          (compLineHeight) ? compLineHeight : 'normal'))
        this.addProblem('RD1012', [node]);
  }
  
}
); // declareDetector

});

