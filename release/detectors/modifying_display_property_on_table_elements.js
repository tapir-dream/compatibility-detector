/**
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

/**
 * @fileoverview Check if the default values of 'display' property on table like
 * elements are changed.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=72
 *
 * Some values including the string "table" of 'display' property are different
 * with the others, they cause an element to behave like a table element. In
 * HTML 4, the semantics of the various table elements (TABLE, CAPTION, THEAD,
 * TBODY, TFOOT, COL, COLGROUP, TH, and TD) are well-defined, and the CSS
 * 'display' property of the said elements may have been defined default value
 * by user agent. The CSS2.1 specification says that user agents may ignore
 * these 'display' property values for HTML table elements, since HTML tables
 * may be rendered using other algorithms intended for backwards compatible
 * rendering. But some browsers will not ignore these 'display' value for table
 * elements, and the table elements' behavior may be changed after that.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'modifying_display_property_on_table_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  // Determine the severity level when reporting the issue.
  this.THRESHOLD = 5;
  // Get the document mode in Chrome, we will use it later.
  this.documentModeInWebKit = chrome_comp.documentMode.WebKit;
  // This list contains all table like elements and its values which cannot
  // cause differences in all browsers.
  this.TABLE_ELEMENT_MAP = {
    TABLE: {table: true, 'inline-table': true},
    TR: {'table-row': true},
    TD: {'table-cell': true},
    TH: {'table-cell': true},
    TBODY: {'table-row-group': true},
    THEAD: {'table-header-group': true},
    TFOOT: {'table-footer-group': true}
  };
  /**
   * Determine if 2 arrays (one or two dimensional array) are the same perfectly
   * (including the structure and the content) and get the max difference
   * between the arrays.
   * @param {Array} array1 the first array.
   * @param {Array} array2 the second array.
   * @return {number} the max difference.
   */
  this.getDifferenceBetweenArrays = function(array1, array2) {
    var maxDifference = 0;
    var difference = 0;
    for (var i = 0, j = array1.length; i < j; ++i) {
      // Use this way to determine if the object is a pure array.
      if ((array1[i] instanceof Array) && (array2[i] instanceof Array)) {
        // The arrays are two dimensional array.
        for (var m = 0, n = array1[i].length; m < n; ++m) {
          if (array1[i][m] != array2[i][m]) {
            difference = Math.abs(array1[i][m] - array2[i][m]);
            maxDifference = Math.max(maxDifference, difference);
          }
        }
      } else if (array1[i] != array2[i]) {
        difference = Math.abs(array1[i] - array2[i]);
        maxDifference = Math.max(maxDifference, difference);
      }
    }
    return maxDifference;
  }
  /**
   * Determine if the problematic display property on the table element affects
   * the layout and get the severity level.
   * @param {Element} node the DOM node to test.
   * @return {number} the severity level.
   */
  this.getSeverityLevelIfAffectingLayout = function(node) {
    var severityLevel = -1;
    var tagName = node.tagName;
    // Webkit has bug. A table contains more than one cell, if we change the
    // display property of the cell, the table's layout may be rendered wrong.
    // So we ingore this situation.
    // Testcase is modifying_display_property_on_table_elements_webkit_bug.html
    if (tagName == 'TD' || tagName == 'TH') {
      var table = node.parentElement.offsetParent;
      if (!table || table.tagName != 'TABLE')
        return severityLevel;
      if (table.rows.length > 1)
        return severityLevel;
      if (table.rows.length > 0 && table.rows[0].cells.length > 1)
        return severityLevel;
    }
    // Cache the old offsetWidth and offsetHeight of the node.
    var oldOffsetWidth = node.offsetWidth;
    var oldOffsetHeight = node.offsetHeight;
    // For the TR and TABLE elements, we should record their cells' offsetWidth
    // into the array first.
    var oldCellsWidthArray = [];
    var oldCellsHeightArray = [];
    if (tagName == 'TR') {
      for (var i = 0, len = node.cells.length; i < len; ++i) {
        oldCellsWidthArray.push(node.cells[i].offsetWidth);
        oldCellsHeightArray.push(node.cells[i].offsetHeight);
      }
    }
    if (tagName == 'TABLE' || tagName == 'TBODY' || tagName == 'TFOOT' ||
        tagName == 'THEAD') {
      for (var i = 0, len = node.rows.length; i < len; ++i) {
        var cellsWidth = [];
        var cellsHeight = [];
        for (var j = 0, length = node.rows[i].cells.length; j < length; ++j) {
          cellsWidth.push(node.rows[i].cells[j].offsetWidth);
          cellsHeight.push(node.rows[i].cells[j].offsetHeight);
        }
        oldCellsWidthArray.push(cellsWidth);
        oldCellsHeightArray.push(cellsHeight);
      }
    }
    // Back up the inline style and simulate display:table.
    var oldInlineDisplayValue = node.style.display;
    var displayValue = '';
    switch (tagName) {
      case 'TD':
      case 'TH':
        displayValue = 'table-cell';
        break;
      case 'TR':
        displayValue = 'table-row';
        break;
      case 'TABLE':
        displayValue =
            (chrome_comp.getComputedStyle(node).display.indexOf('inline') >= 0)
                ? 'inline-table'
                : 'table';
    }
    node.style.setProperty('display', displayValue, true);
    // Get the new information.
    var newOffsetWidth = node.offsetWidth;
    var newOffsetHeight = node.offsetHeight;
    // After modifying the style, we should record the cells' offsetWidth and
    // offsetHeight again.
    var newCellsWidthArray = [];
    var newCellsHeightArray = [];
    if (tagName == 'TR') {
      for (var i = 0, len = node.cells.length; i < len; ++i) {
        newCellsWidthArray.push(node.cells[i].offsetWidth);
        newCellsHeightArray.push(node.cells[i].offsetHeight);
      }
    }
    if (tagName == 'TABLE') {
      for (var i = 0, len = node.rows.length; i < len; ++i) {
        var cellsWidth = [];
        var cellsHeight = [];
        for (var j = 0, length = node.rows[i].cells.length; j < length; ++j) {
          cellsWidth.push(node.rows[i].cells[j].offsetWidth);
          cellsHeight.push(node.rows[i].cells[j].offsetHeight);
        }
        newCellsWidthArray.push(cellsWidth);
        newCellsHeightArray.push(cellsHeight);
      }
    }
    // Restore the inline style.
    node.style.display = null;
    node.style.display = (oldInlineDisplayValue) ? oldInlineDisplayValue : null;
    // Get the differences about the table.
    var offsetWidthDifference = Math.abs(oldOffsetWidth - newOffsetWidth);
    var offsetHeightDifference = Math.abs(oldOffsetHeight - newOffsetHeight);
    var maxWidthDifferenceInArrays =
        this.getDifferenceBetweenArrays(oldCellsWidthArray, newCellsWidthArray);
    var maxHeightDifferenceInArrays =
        this.getDifferenceBetweenArrays(oldCellsHeightArray,
        newCellsHeightArray);
    // If there is difference, we consider that the layout is affected. And if
    // the difference is more than the THRESHOLD, it should be error level,
    // otherwise it should be warning level. And -1 stands no difference.
    if (offsetWidthDifference >= this.THRESHOLD ||
        offsetHeightDifference >= this.THRESHOLD ||
        maxWidthDifferenceInArrays >= this.THRESHOLD ||
        maxHeightDifferenceInArrays >= this.THRESHOLD) {
      severityLevel = 9;
    } else if (offsetWidthDifference > 0 ||
        offsetHeightDifference > 0 ||
        maxWidthDifferenceInArrays > 0 ||
        maxHeightDifferenceInArrays > 0) {
      severityLevel = 1;
    }
    return severityLevel;
  }
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  var tagName = node.tagName;
  // Only check the visible table elements.
  if (!(tagName in this.TABLE_ELEMENT_MAP))
    return;
  // The 'display' property values for the TABLE, TD and TH elements cannot be
  // modified when Chrome is Quirks Mode.
  if (this.documentModeInWebKit == 'Q' &&
     (tagName == 'TABLE' || tagName == 'TD' || tagName == 'TH'))
    return;
  // Only check the element in normal flow.
  if (!chrome_comp.isInNormalFlow(node))
    return;
  var display = chrome_comp.getComputedStyle(node).display;
  // The 'display' property value is not the default value.
  if (display in this.TABLE_ELEMENT_MAP[tagName])
    return;
  // Ignore the invisible element.
  if (node.offsetWidth == 0 || node.offsetHeight == 0)
    return;
  var severityLevel = this.getSeverityLevelIfAffectingLayout(node);
  if (severityLevel != -1)
    this.addProblem('RE8015', {
      nodes: [node],
      severityLevel: severityLevel,
      details: tagName + ' { display: ' + display + '; }'
    });
}
); // declareDetector

});
