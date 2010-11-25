// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'selectsValueAttributeWithoutItsValue',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 OPTION 元素，若其拥有 value 属性且 value 属性值为空字符串，同时其位于表单中，则发出警告。
 *
 * 【缺陷】
 * 无法区分 <option value> 和 <option value=""> 的情况，因为第一种在 Chrome 中会被修复为第二种
 *
 *【messages.json】
 * "HF9018": { "message": "IE 中 OPTION 元素设置了空的 value 属性时会将 OPTION 元素的内容文本作为 value 属性值提交到服务端 " },
 * "HF9018_suggestion": { "message": "在使用 OPTION 元素时避免出现其仅包含属性名、没有属性值的 value 属性的情况，若需要设定空的 value 属性值可以写做 <OPTION value=\"\">。" },
 */

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'OPTION')
    return;

  if ((node.hasAttribute('value')) && (node.getAttribute('value') == '') &&
      node.form) {
    this.addProblem('HF9018', [node]);
  }
}
); // declareDetector

});
