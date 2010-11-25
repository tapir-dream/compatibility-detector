// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'scriptsSrcAttributeWithoutItsValue',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*
 *【思路】
 * 检测所有 src 属性值为空的 SCRIPT 的元素
 * 判断其内是否有非空白符的文本内容，若是则发出警告
 *
 *【缺陷】
 * 没有考虑 SCRIPT 标签内存在执行后不对页面产生任何影响的内容，如注释
 *
 *
 *【messages.json】
 * "HS9001": { "message": "IE Opera 中 src 属性为空的 SCRIPT 元素内的脚本不会被忽略，且内联脚本可以通过修改其所在 SCRIPT 元素的 src 属性引入新的外部脚本文件" },
 * "HS9001_suggestion": { "message": "不在设定了 src 属性的 SCRIPT 元素内编写脚本。" },
 *
 */


function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'SCRIPT')
    return;

  if ((node.hasAttribute('src')) && (node.getAttribute('src') == '') &&
      node.text.trim() != '') {
    this.addProblem('HS9001', [node]);
  }
}
); // declareDetector

});

