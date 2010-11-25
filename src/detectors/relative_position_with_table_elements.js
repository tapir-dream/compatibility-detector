// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'relativePositionWithTableElements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*
 *【思路】
 * 检测所有 'display' 特性值为 'table-cell'、'table-row'、'table-caption' 的元素
 * 判断其 'position' 特性值是否为 'relative'，同时 'left' 和 'top' 特性是否不为 '0'，若是则发出警告
 *
 *【缺陷】
 * 没有考虑其他非 IE 浏览器中的差异，仅对 IE 与 Chrome 之间出现差异发出了警告
 *
 *【messages.json】
 * "RM8024": { "message": "各浏览器对除 TABLE 之外的表格类元素以及它们相对于 CSS 中 display 特性值的相对定位特性的支持存在差异" },
 * "RM8024_suggestion": { "message": "由于除 TABLE 之外的表格类元素以及它们相对于 CSS 中 display 特性值设定了相对定位后的效果 CSS2.1 规范中没有明确定义，而各浏览器的实现又存在很大差异。所以应避免为这些元素设定 'position:relative'。若需要实现如冻结表格行或列的效果，可以考虑使用绝对定位其他 TABLE 元素的方式模拟。" },
 *
 */

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  var tableStyle = ['table-cell', 'table-row', 'table-caption'],
    dis = window.chrome_comp.getComputedStyle(node).display,
    pos = window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'position'),
    l = parseInt(window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'left')),
    t = parseInt(window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'top'));
  if ((tableStyle.indexOf(dis) != -1) && (pos === 'relative') && 
      (l != 0 || t != 0) ) {
    this.addProblem('RM8024', [node]);
  } 	 
}
); // declareDetector

});

