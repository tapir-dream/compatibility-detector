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
 * @fileoverview Check auto-width MARQUEE elements.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=13
 *
 * Check all MARQUEE elements.
 * Get the width of the parent element of the present MARQUEE element.
 * Ignore the MARQUEE element that do not in the table cell, and ignore the
 * table that is not in automatic table layout algorithm.
 * Record the rects of the parent element. Then, set the MARQUEE element
 * be invisible. If the rects of the parent elements are changed,
 * report the issue and restore the style of the MARQUEE element.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'marquee_width',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.canStretchAutoLayoutTable = function(node) {
    var computedStyle = chrome_comp.getComputedStyle(node);
    while (computedStyle.display != 'table' &&
        computedStyle.display != 'inline-table' &&
        node.tagName != 'BODY') {
      var width = chrome_comp.getSpecifiedStyleValue(node, 'width');
      var htmlAttributeWidth = node.getAttribute('width');
      if (chrome_comp.isAutoOrNull(width) && htmlAttributeWidth)
        width = htmlAttributeWidth;
      if (computedStyle.display == 'block' && width)
        return false;
      node = node.parentElement;
      computedStyle = chrome_comp.getComputedStyle(node);
    }

    // The node ancestor is table or inline talbe,
    // if the ancestor tableLayout style is the 'auto',
    // can stretch auto Layout, reutrn true.
    if (node.tagName != 'BODY')
      return computedStyle.tableLayout == 'auto';
    else
      return false;
  };

  this.addCustomProblem = function(node, level) {
    this.addProblem('BX1030', {
      nodes: [node],
      severityLevel: level,
      details: 'MARQUEE Tag width is: ' +
        node.offsetWidth + 'px'
    });
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'MARQUEE')
    return;

  var WARNING_THRESHOLD = 10;
  var ERROR_THRESHOLD =
      Math.max(WARNING_THRESHOLD, Math.floor(window.innerWidth / 10));
  var isRelativeWidth = false;
  var width = chrome_comp.getSpecifiedStyleValue(node, 'width');
  var htmlAttributeWidth = node.getAttribute('width');
  if (width == null && htmlAttributeWidth)
    width = htmlAttributeWidth;
  if (chrome_comp.isAutoOrNull(width) || width.indexOf('%') != -1)
    isRelativeWidth = true;

  // If a MARQUEE element's width is "auto" or a percentage length, and its
  // ancestor elements in a TABLE element whose width are "auto" or percentage
  // length too, and if the TABLE element's "table-layout" is "auto",
  // the actual width of these ancestor elements may be stretched by
  // the MARQUEE element in IE8(Q) Chrome, but not in IE6 IE7 IE8(Q).
  var parentElement = node.parentElement;
  if (this.canStretchAutoLayoutTable(parentElement) && isRelativeWidth) {
    var originalParentWidth = parentElement.offsetWidth;
    var oldDisplayStyle = node.style.display;
    node.style.display = 'none !important;';
    var changeWidth =
        Math.abs(originalParentWidth - parentElement.offsetWidth);
    node.style.display = null;
    node.style.display = oldDisplayStyle;
    if (changeWidth > ERROR_THRESHOLD) {
      this.addCustomProblem(node, 8);
    } else if (changeWidth > WARNING_THRESHOLD) {
      this.addCustomProblem(node, 1);
    }
  }
}
); // declareDetector

});
