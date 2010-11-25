// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'borderSpacingBetweenMultipleTableRowGroups',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 TABLE 元素，判断其是否存在多个行组元素，若不是则停止检测
 * 检测 border-spacing 特性设定的垂直方向的值是否为正数，若是则发出警告
 *
 *【messages.json】
 * "RX1014": { "message": "Chrome Safari 中设定的单元格上下间隙会作用在 THEAD、TBODY、TFOOT 元素内部，某些情况下 THEAD、TBODY、TFOOT 元素之间会出现双倍间隙" },
 * "RX1014_suggestion": { "message": "CSS 规范并没有明确说明单元格间隙的作用位置以及行组元素对其的影响，所以为了避免差异应避免在包含 THEAD、TBODY、TFOOT 这类行组元素的表格内设定非 0 的单元格间隙 (cellsping 属性或 'border-spacing' 特性)。" },
 */


function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'TABLE')
    return;

  var borderSpacing = 
      window.chrome_comp.getComputedStyle(node).borderSpacing.split(' '),
    list = ['TBODY', 'TFOOT', 'THEAD'];
  for (var i = 0, rowGroupCount = 0, j = node.children.length; i < j; i++) {
    (list.indexOf(node.children[i].tagName) != -1) && (rowGroupCount++);
  }
  var vBorderSpacing = (borderSpacing[1]) ? (borderSpacing[1]) :
      (borderSpacing[0]);
  if (rowGroupCount > 1 && parseInt(vBorderSpacing) > 0) {
    this.addProblem('RX1014', [node]);
  }
}
); // declareDetector

});

