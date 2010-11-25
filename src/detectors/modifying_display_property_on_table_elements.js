// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'modifyingDisplayPropertyOnTableElements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*
 *【思路】
 * 检测所有表格类元素，检测其 'display' 特性的值是否为 'none' 及其原生默认值，若不是则发出警告
 *
 *【缺陷】
 * 某些表格类元素可能在设定为其他表格类 'display' 特性值后其特性并不发生改变
 *
 *【messages.json】
 * "RE8015": { "message": "IE 中 TABLE 等表格类元素的 'display' 特性的值被设置为 'table'、'inline-table' 之外的其他合法值后其 TABLE 特性不受影响" },
 * "RE8015_suggestion": { "message": "避免改变表格类元素的默认 'display' 特性。若需要隐藏某个表格类元素，即设定其 'display' 特性为 'none'，之后需要恢复其的可视状态，可以为其设定一个非法的 'display' 特性的值，如：TR.style.display = \"\";" },
 *
 */


function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType || (node.tagName != 'TABLE' &&
      node.tagName != 'TR' && node.tagName != 'TD' && node.tagName != 'TH' &&
      node.tagName != 'THEAD' && node.tagName != 'TBODY' &&
      node.tagName != 'TFOOT' && node.tagName != 'CAPTION' &&
      node.tagName != 'COL' && node.tagName != 'COLGROUP'))
    return;

  var map = {
    'TABLE': ['table', 'inline-table', 'none'],
    'TR': ['table-row', 'none'],
    'TD': ['table-cell', 'none'],
    'TH': ['table-cell', 'none'],
    'THEAD': ['table-header-group', 'none'],
    'TBODY': ['table-row-group', 'none'],
    'TFOOT': ['table-footer-group', 'none'],
    'CAPTION': ['table-caption', 'none'],
    'COL': ['table-column', 'none'],
    'COLGROUP': ['table-column-group', 'none']
  }
  var computedDisplay = window.chrome_comp.getComputedStyle(node).display;
  if (map[node.tagName].indexOf(computedDisplay) == -1) {
    this.addProblem('RE8015', [node]);
  }
}
); // declareDetector

});

