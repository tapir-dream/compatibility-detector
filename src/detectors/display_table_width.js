/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'display_table_width',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {

  function isTableElementWidthAuto(nodeEl) {

    var div = document.createElement('div');
    var td = document.createElement('td');
    var tr = document.createElement('tr');

    div.style.width = '1000000px';
    div.style.height = '20px';
    td.appendChild(div);
    tr.appendChild(td);
    nodeEl.appendChild(tr);

    var inlineTableLayout = nodeEl.style.tableLayout;
    var computedTableLayout = chrome_comp.getComputedStyle(nodeEl).tableLayout;
    var oldWidth = nodeEl.offsetWidth;

    nodeEl.style.tableLayout =
      (computedTableLayout == 'auto') ? 'fixed !important' : 'auto !important';

    newWidth = nodeEl.offsetWidth;
    nodeEl.style.tableLayout = null;
    nodeEl.style.tableLayout = (inlineTableLayout) ? inlineTableLayout : null;

    if (!nodeEl.getAttribute('style'))
      nodeEl.removeAttribute('style');

    nodeEl.removeChild(tr);
    return (oldWidth == newWidth) ? 'auto' : nodeEl.offsetWidth + 'px';
  }

  function isDisplayTableWidthAuto(nodeEl) {
    var div = document.createElement('div');
    var td = document.createElement('div');
    var tr = document.createElement('div');

    div.style.width = '1000000px';
    div.style.height = '20px';
    td.appendChild(div);
    td.display = 'table-cell';
    tr.appendChild(td);
    tr.display = 'table-row';
    nodeEl.appendChild(tr);

    var inlineTableLayout = nodeEl.style.tableLayout;
    var computedTableLayout = chrome_comp.getComputedStyle(nodeEl).tableLayout;
    var oldWidth = nodeEl.offsetWidth;

    nodeEl.style.tableLayout =
      (computedTableLayout == 'auto') ? 'fixed !important' : 'auto !important';

    newWidth = nodeEl.offsetWidth;
    nodeEl.style.tableLayout = null;
    nodeEl.style.tableLayout = (inlineTableLayout) ? inlineTableLayout : null;

    if (!nodeEl.getAttribute('style'))
      nodeEl.removeAttribute('style');

    nodeEl.removeChild(tr);
    return (oldWidth == newWidth) ? 'auto' : nodeEl.offsetWidth + 'px';
  }

  function findLastCellInFirstRow(nodeEl) {
    var row = nodeEl.rows[0];
    return row.cells[row.cells.length - 1];
  }

  function isBorderHorizontalZero(nodeEl) {
    var br = parseInt(chrome_comp.getComputedStyle(nodeEl).borderRightWidth);
    var bl = parseInt(chrome_comp.getComputedStyle(nodeEl).borderLeftWidth);
    return (br == 0) && (bl == 0);
  }

  function getTableCellBorder(row) {
    var ch = row.children;
    var list = [];
    for (var i = 0, j = ch.length; i < j; i++) {
      if (chrome_comp.getComputedStyle(ch[i]).display == 'table-cell')
        list.push(ch[i]);
    }
    var firstLeft = parseInt(chrome_comp.getComputedStyle(
            list[0]).borderLeftWidth,10);
    var lastRight = parseInt(chrome_comp.getComputedStyle(
            list[list.length - 1]).borderRightWidth,10);

    return { left : firstLeft, right : lastRight };
  }

  function hasBorder(nodeEl) {
    function hasCellBorder(row) {
      var ch = row.children
      var list = [];
      for (var i = 0, j = ch.length; i < j; i++) {
        if (chrome_comp.getComputedStyle(ch[i]).display == 'table-cell')
          list.push(ch[i]);
      }
      var firstLeft = parseInt(chrome_comp.getComputedStyle(
              list[0]).borderLeftWidth,10),
          lastRight = parseInt(chrome_comp.getComputedStyle(
              list[list.length - 1]).borderRightWidth,10);
      return (firstLeft != 0) || (lastRight != 0);
    }

    var tableBorderRightWidth =
            parseInt(chrome_comp.getComputedStyle(nodeEl).borderRightWidth,10);
    var tableBorderLeftWidth =
            parseInt(chrome_comp.getComputedStyle(nodeEl).borderLeftWidth,10);
    var ch = nodeEl.children;
    var list = [];
    var borderWidth;
    var maxLeft;
    var maxRight;
    var rowGroupDisplay =
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
          parseInt(chrome_comp.getComputedStyle(nodeEl).borderRightWidth,10);
    var tableBorderLeftWidth =
          parseInt(chrome_comp.getComputedStyle(nodeEl).borderLeftWidth,10);
    var ch = nodeEl.children;
    var list = [];
    var borderWidth;
    var maxLeft;
    var maxRight;
    var rowGroupDisplay =
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

    var lastCell = findLastCellInFirstRow(node);
    var firstCell = node.rows[0].cells[0];
    var lastCellBorderRightWidth =
          parseInt(chrome_comp.getComputedStyle(lastCell).borderRightWidth,10);
    var firstCellBorderLeftWidth =
          parseInt(chrome_comp.getComputedStyle(lastCell).borderLeftWidth,10);
    var tableBorderRightWidth =
          parseInt(chrome_comp.getComputedStyle(node).borderRightWidth,10);
    var tableBorderLeftWidth =
          parseInt(chrome_comp.getComputedStyle(node).borderLeftWidth,10);
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
