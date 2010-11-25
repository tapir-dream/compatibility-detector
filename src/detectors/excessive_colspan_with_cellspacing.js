// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'excessiveColspanWithCellspacing',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有水平单元格间隙不为 0 的 TABLE 元素
 * 一行行检测其内单元格，若存在 colspan 属性过度设定的情况则发出警告。
 *
 */

function checkNode(node, context) {
  function hasCellspacing(element) {
    var borderSpacing = chrome_comp.getComputedStyle(element).borderSpacing;
    return parseInt(borderSpacing.split(' ')[0]);
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'TABLE')
    return;

  if (!hasCellspacing(node))
    return;

  for (var i = 0, max, list = [], j = node.rows.length; i < j; i++) {
    list[i] |= 0;
    for (var m = 0, n = node.rows[i].cells.length; m < n; m++) {
      list[i] += node.rows[i].cells[m].colSpan | 0;
      if (i > 0) {
        if (list[i] > max)
          this.addProblem('HE1005', [node.rows[i].cells[m]]);
        max = Math.max(max, list[i]);
      } else {
          max = list[i];
      }
      if (node.rows[i].cells[m].rowSpan > 1) {
        for (var a = 1, b = node.rows[i].cells[m].rowSpan; a <= b; a++) {
          list[i + a - 1] = 1;
        }
      }
    }
  }
}
); // declareDetector

});

