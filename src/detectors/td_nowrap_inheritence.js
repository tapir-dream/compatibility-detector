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
  var autoCellList = [], nonAutoCellList = [];
  var rowsDisplay = [];
  for (var i = 0, j = rows.length; i < j; i++) {
    var cells = rows[i].cells;
    for (var m = 0, n = cells.length; m < n; m++) {
      if (cells[m].offsetWidth == 0) {
        autoCellList.push(cells[m]);
      } else {
        nonAutoCellList.push(cells[m]);
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
  return { auto: autoCellList, nonAuto: nonAutoCellList };
}

function isNowrapInherit(element) {
  if (element.tagName != 'TD' && element.tagName != 'TR')
    return;
  var table = element.offsetParent;
  var tableInlineWhiteSpace = table.style.whiteSpace;
  table.style.whiteSpace = 'pre-line !important';
  var computedWhiteSpace = chrome_comp.getComputedStyle(element).whiteSpace;
  table.style.whiteSpace = null;
  table.style.whiteSpace = 
      (tableInlineWhiteSpace) ? tableInlineWhiteSpace : null;
  return computedWhiteSpace == 'pre-line';
}


chrome_comp.CompDetect.declareDetector(

'td_nowrap_inheritence',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'TABLE')
    return;
  var list = getCellsSetWidth(node);
  var autoList = list.auto;
  var nonAutoList = list.nonAuto;
  console.log(autoList.length +',,,');
  for (var i = 0, j = autoList.length; i < j; i++) {
    if (chrome_comp.getComputedStyle(autoList[i]).whiteSpace == 'nowrap')
      if (isNowrapInherit(autoList[i]))
        this.addProblem('RX1003', [autoList[i]]);
  }
  for (var i = 0, j = nonAutoList.length; i < j; i++) {
    if (!isNowrapInherit(nonAutoList[i])) {
      this.addProblem('RX1003', [nonAutoList[i]]);
    }
  }
}
); // declareDetector

});
