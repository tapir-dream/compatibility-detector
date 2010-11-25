// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'displayTableWidth',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有设定了宽度且 border-collapse:collapse 的 TABLE 元素，若存在最左边的单元格边框宽度大于表格左边框宽度或者最右边的单元格边框宽度大于表格右边框宽度的情况，则发出警告
 * 检测所有 display 特性值为 table 或 inline-table 的元素，对于分离边框模型，若表格存在左右边框则发出警告；对于重合边框模型，若各行最左边的单元格边框宽度大于表格左边框宽度或者最右边的单元格边框宽度大于表格右边框宽度则发出警告
 *
 */


function checkNode(node, additionalData) {
  function isTableElementWidthAuto(nodeEl) {
    var div = document.createElement('div'),
      td = document.createElement('td'),
      tr = document.createElement('tr');
    div.style.width = '1000000px';
    div.style.height = '20px';
    td.appendChild(div);
    tr.appendChild(td);
    nodeEl.appendChild(tr);
    var inlineTableLayout = nodeEl.style.tableLayout,
      computedTableLayout = chrome_comp.getComputedStyle(nodeEl).tableLayout,
      oldWidth = nodeEl.offsetWidth;
    nodeEl.style.tableLayout = (computedTableLayout == 'auto')
        ? 'fixed !important' 
        : 'auto !important';
    newWidth = nodeEl.offsetWidth;
    nodeEl.style.tableLayout = null;
    nodeEl.style.tableLayout = (inlineTableLayout) ? inlineTableLayout : null;
    (!nodeEl.getAttribute('style')) && (nodeEl.removeAttribute('style'));
    nodeEl.removeChild(tr);
    return (oldWidth == newWidth) ? 'auto' : nodeEl.offsetWidth + 'px';
  }

  function isDisplayTableWidthAuto(nodeEl) {
    var div = document.createElement('div'),
      td = document.createElement('div'),
      tr = document.createElement('div');
    div.style.width = '1000000px';
    div.style.height = '20px';
    td.appendChild(div);
    td.display = 'table-cell';
    tr.appendChild(td);
    tr.display = 'table-row';
    nodeEl.appendChild(tr);
    var inlineTableLayout = nodeEl.style.tableLayout,
      computedTableLayout = chrome_comp.getComputedStyle(nodeEl).tableLayout,
      oldWidth = nodeEl.offsetWidth;
    nodeEl.style.tableLayout = (computedTableLayout == 'auto')
        ? 'fixed !important' 
        : 'auto !important';
    newWidth = nodeEl.offsetWidth;
    nodeEl.style.tableLayout = null;
    nodeEl.style.tableLayout = (inlineTableLayout) ? inlineTableLayout : null;
    (!nodeEl.getAttribute('style')) && (nodeEl.removeAttribute('style'));
    nodeEl.removeChild(tr);
    return (oldWidth == newWidth) ? 'auto' : nodeEl.offsetWidth + 'px';
  }

  function findLastCellInFirstRow(nodeEl) {
    var row = nodeEl.rows[0];
    return row.cells[row.cells.length - 1];
  }

  function isBorderHorizontalZero(nodeEl) {
    var br = parseInt(chrome_comp.getComputedStyle(nodeEl).borderRightWidth),
        bl = parseInt(chrome_comp.getComputedStyle(nodeEl).borderLeftWidth);
    return (br == 0) && (bl == 0);
  }

  function getTableCellBorder(row) {
    var ch = row.children, list = [];
    for (var i = 0, j = ch.length; i < j; i++) {
      if (chrome_comp.getComputedStyle(ch[i]).display == 'table-cell')
        list.push(ch[i]);
    }
    var firstLeft = parseInt(chrome_comp.getComputedStyle(
            list[0]).borderLeftWidth),
        lastRight = parseInt(chrome_comp.getComputedStyle(
            list[list.length - 1]).borderRightWidth);
    return { left : firstLeft, right : lastRight }
  }

  function hasBorder(nodeEl) {
    function hasCellBorder(row) {
      var ch = row.children, list = [];
      for (var i = 0, j = ch.length; i < j; i++) {
        if (chrome_comp.getComputedStyle(ch[i]).display == 'table-cell')
          list.push(ch[i]);
      }
      var firstLeft = parseInt(chrome_comp.getComputedStyle(
              list[0]).borderLeftWidth),
          lastRight = parseInt(chrome_comp.getComputedStyle(
              list[list.length - 1]).borderRightWidth);
      return (firstLeft != 0) || (lastRight != 0);
    }
    
    var tableBorderRightWidth = 
            parseInt(chrome_comp.getComputedStyle(nodeEl).borderRightWidth),
        tableBorderLeftWidth = 
            parseInt(chrome_comp.getComputedStyle(nodeEl).borderLeftWidth),
        ch = nodeEl.children, list = [], borderWidth, maxLeft, maxRight,
        rowGroupDisplay = 
            ['table-row-group', 'table-header-group', 'table-footer-group'];
    if (tableBorderRightWidth || tableBorderLeftWidth)
      return true;
    for (var i = 0, j = ch.length; i < j; i++) {
      var dis = chrome_comp.getComputedStyle(ch[i]).display;
      if (rowGroupDisplay.indexOf(dis) != -1) {
        var chch = ch[i].children;
        for (var m = 0, n = chch.length; m < n; m++) {
          if (chrome_comp.getComputedStyle(chch[m]).display == 'table-row') {
            if (hasCellBorder(chch[m]))
              return true;
          }
        }
      }
      if (dis == 'table-row') {
        if (hasCellBorder(ch[i]))
          return true;
      }
    }
    return false;
  }

  function hasWiderCellBorder(nodeEl) {
    var tableBorderRightWidth = 
            parseInt(chrome_comp.getComputedStyle(nodeEl).borderRightWidth),
        tableBorderLeftWidth = 
            parseInt(chrome_comp.getComputedStyle(nodeEl).borderLeftWidth),
        ch = nodeEl.children, list = [], borderWidth, maxLeft, maxRight,
        rowGroupDisplay = 
            ['table-row-group', 'table-header-group', 'table-footer-group'];
    for (var i = 0, j = ch.length; i < j; i++) {
      var dis = chrome_comp.getComputedStyle(ch[i]).display;
      if (rowGroupDisplay.indexOf(dis) != -1) {
        var chch = ch[i].children;
        for (var m = 0, n = chch.length; m < n; m++) {
          if (chrome_comp.getComputedStyle(chch[m]).display == 'table-row') {
            borderWidth = getTableCellBorder(chch[m]);
            (!maxLeft) && (maxLeft = borderWidth.left);
            (!maxRight) && (maxRight = borderWidth.right);
            if ((maxLeft < borderWidth.left) || (maxRight < borderWidth.right))
              return true;
          }
        }
      }
      if (dis == 'table-row') {
        borderWidth = getTableCellBorder(ch[i]);
        (!maxLeft) && (maxLeft = borderWidth.left);
        (!maxRight) && (maxRight = borderWidth.right);
        if ((maxLeft < borderWidth.left) || (maxRight < borderWidth.right))
          return true;
      }
    }
    return false;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).display != 'table' &&
      chrome_comp.getComputedStyle(node).display != 'inline-table')
    return;
  
  
  if (node.tagName == 'TABLE') {
    if (isTableElementWidthAuto(node) == 'auto')
      return;
    if (chrome_comp.getComputedStyle(node).borderCollapse != 'collapse')
      return;
    var lastCell = findLastCellInFirstRow(node), 
        firstCell = node.rows[0].cells[0],
        lastCellBorderRightWidth = 
            parseInt(chrome_comp.getComputedStyle(lastCell).borderRightWidth),
        firstCellBorderLeftWidth =
            parseInt(chrome_comp.getComputedStyle(lastCell).borderLeftWidth),
        tableBorderRightWidth = 
            parseInt(chrome_comp.getComputedStyle(node).borderRightWidth),
        tableBorderLeftWidth = 
            parseInt(chrome_comp.getComputedStyle(node).borderLeftWidth);
    if ((lastCellBorderRightWidth > tableBorderRightWidth) || 
        (firstCellBorderLeftWidth > tableBorderLeftWidth))
      this.addProblem('RE8002', [node]);
  } else {
    if (isDisplayTableWidthAuto(node) == 'auto')
      return;
    if (chrome_comp.getComputedStyle(node).borderCollapse != 'collapse') {
      if (!isBorderHorizontalZero(node))
        this.addProblem('RE8002', [node]);
    } else {
      if (hasBorder(node))
        this.addProblem('RE8002', [node]);
    }
  }
}
); // declareDetector

});

