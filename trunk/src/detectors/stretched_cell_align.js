/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

function getCellsSetWidth(element) {
  var inlineTableLayout = element.style.tableLayout;
  var inlineWidth = element.style.width;
  element.style.tableLayout = 'fixed !important';
  element.style.width = '0px !important';
  var rows = element.rows;
  var nonAutoCellList = [];
  var rowsDisplay = [];
  for (var i = 0, j = rows.length; i < j; i++) {
    var cells = rows[i].cells;
    for (var m = 0, n = cells.length; m < n; m++) {
      if (cells[m].offsetWidth > 0) {
        nonAutoCellList.push({ node: cells[m], width: cells[m].offsetWidth });
      }
    }
    rowsDisplay[i] = rows[i].style.display;
    rows[i].style.display = 'none !important';
  }
  for (var i = 0, j = rows.length; i < j; i++) {
    rows[i].style.display = null;
    rows[i].style.display = (rowsDisplay[i]) ? rowsDisplay[i] : null;
  }
  element.style.tableLayout = null;
  element.style.tableLayout = (inlineTableLayout) ? inlineTableLayout: null;
  element.style.width = null;
  element.style.width = (inlineWidth) ? inlineWidth : null;
  return nonAutoCellList;
}

function isStretched(element) {
  var table = element.offsetParent;
  var inlineWidth = table.style.width;
  var oldWidth = element.offsetWidth;
  table.style.width = '0px !important';
  var newWidth = element.offsetWidth;
  table.style.width = null;
  table.style.width = (inlineWidth) ? inlineWidth : null;
  return oldWidth == newWidth;
}

function isPercentageWidth(element) {
  var inlineDisplay = element.style.display;
  element.style.display = 'none !important';
  var width = chrome_comp.getComputedStyle(element).width;
  element.style.display = null;
  element.style.display = (inlineDisplay) ? inlineDisplay : null;
  return width.slice(-1) == '%';
}

chrome_comp.CompDetect.declareDetector(

'stretched_cell_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'TABLE')
    return;
  var list = getCellsSetWidth(node);

  for (var i = 0, j = list.length; i < j; i++) {
    var width = parseInt(chrome_comp.getComputedStyle(list[i].node).width);
    var textAlign = chrome_comp.getComputedStyle(list[i].node).textAlign;
    //console.log(width+','+list[i].width)
    if (isPercentageWidth(list[i].node))
      continue;
<<<<<<< .mine
    if ((width > list[i].width + 1) && ((textAlign.indexOf('right') != -1) || 
    (textAlign.indexOf('center') != -1))) {
=======
    if ((width > list[i].width) && ((textAlign.indexOf('right') != -1) ||
        (textAlign.indexOf('center') != -1))) {
>>>>>>> .r159
      if (!isStretched(list[i].node))
      this.addProblem('RE8014', [list[i].node]);
    }
  }
}
); // declareDetector

});
