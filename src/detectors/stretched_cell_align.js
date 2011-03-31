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
 * @fileoverview Check if a table cell is stretched and its width's specified
 *  value is smaller than the computed value.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=35
 *
 * When we set the width for a table cell, it does not mean that the value will
 * be used. The cell's width may be computed as another value, for reasons such
 * as: the table's width is larger, or the content inside the cell is too wide.
 * When a cell is stretched, and its computed width is bigger than the specified
 * value(which is not auto), the content width in the cell will be limited to
 * the specified value in IE6, IE7 and IE8(Q).
 *
 * 1. Check all table cells whose width is set(not 'auto') and is not a
 *    percentage value.
 * 2. Get the value of 'text-align', because we do not consider the
 *    left-aligned elements.
 * 3. If the cell is stretched by the table and not by its contents, and
 *    contains inflow content, we report this as a problem.
 */

addScriptToInject(function() {

function isPercentageString(str) {
  return str.slice(-1) == '%';
}

// TODO: put this into framework
function isCellStretchedByTable(cell) {
  var table = cell.offsetParent;
  var oldInlineTableWidth = table.style.width;
  var oldCellOffsetWidth = cell.offsetWidth;

  // Set table's width to 0px, so that the cell will not be stretched.
  table.style.width = '0px !important';
  var newCellOffsetWidth = cell.offsetWidth;

  // Restore table's inline width.
  table.style.width = null;
  table.style.width = oldInlineTableWidth;

  return oldCellOffsetWidth == newCellOffsetWidth;
}

/**
 * Whether there is inflow content in the child elements.
 * Ignore absolute/fixed positioned elements and float elements.
 */
function hasInflowContent(element) {
  var childNodes = element.childNodes;
  // Check direct child text nodes.
  for (var i = 0, len = childNodes.length; i < len; ++i) {
    var childNode = childNodes[i];
    if (childNode.nodeType == Node.TEXT_NODE) {
      if (!/^\s+$/g.test(childNode.nodeValue))
        return true;
    }
  }
  // Check child element nodes.
  for (var i = 0, len = childNodes.length; i < len; ++i) {
    var childNode = childNodes[i];
    if (childNode.nodeType == Node.ELEMENT_NODE) {
      var style = chrome_comp.getComputedStyle(childNode);
      if (style.position == 'absolute' || style.position == 'fixed' ||
          style.float != 'none' || style.display == 'none')
        continue;
      // TODO: check for visibility
      var result = hasInflowContent(childNode);
      if (result)
        return true;
    }
  }
  return false;
}

chrome_comp.CompDetect.declareDetector(

'stretched_cell_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'TD' && node.tagName != 'TH')
    return;

  var specifiedValue = chrome_comp.getSpecifiedValue(node);
  var specifiedWidthStr = specifiedValue.width;
  if (!specifiedWidthStr || specifiedWidthStr == 'auto' ||
      isPercentageString(specifiedWidthStr))
    return;

  var computedWidth = parseInt(chrome_comp.getComputedStyle(node).width, 10);
  var specifiedWidth = parseInt(specifiedWidthStr, 10);
  // TODO: use SHRESHOLD here
  if ((computedWidth <= specifiedWidth))
    return;

  var textAlign = chrome_comp.getComputedStyle(node).textAlign;
  if (!textAlign || textAlign.indexOf('left') != -1 ||
      textAlign.indexOf('auto') != -1)
    return;

  if (!isCellStretchedByTable(node) && hasInflowContent(node)) {
    this.addProblem('RE8014', {
      nodes: [node],
      details: 'specifiedWidth=' + specifiedWidth + ', computedWidth=' +
          computedWidth
    });
  }
}

); // declareDetector

});
