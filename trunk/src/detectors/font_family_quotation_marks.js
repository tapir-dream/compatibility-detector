// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'fontFamilyQuotationMarks',

chrome_comp.CompDetect.ScanDomBaseDetector,

/*【思路】
 * 获取到元素计算后的 font-family 特性的值
 * 尝试将获取到的值转为代码执行，若报错则退出，若不报错则证明这个代码是由 若是则发出警告
 *
 */

null,

function checkNode(node, context) {
  function isCommaInQuotationMarks(string) {
    try {
      var s = new Function('return [' + string + ']')();
      if (s.length > 1)
        return false;
      if (s[0].split(',').length <= 1)
        return false;
      return s;
    } catch (e) {
      return false;
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var ff = chrome_comp.getComputedStyle(node).fontFamily;
  if (isCommaInQuotationMarks(ff))
    this.addProblem('RY1001', [node]);

}
); // declareDetector

});

