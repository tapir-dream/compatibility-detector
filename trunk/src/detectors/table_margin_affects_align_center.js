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
 * @fileoverview Check the CSS margin property which affects table element whose
 * HTML 'align' attribute is 'center'.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=4
 *
 * http://w3help.org/zh-cn/causes/RX8004
 * The align attribute of table elements make the table itself align center
 * being relative to its containing block. In non-IE browsers, it will be
 * transformed to CSS property - 'margin-left:auto' and 'margin-right:auto'.
 * So the detector first check the center-aligned table elements by HTML align
 * attribute, ignoring the empty table element and invisible table (the width
 * or height is zero).
 *
 * Record the inline style value of 'margin-left' and 'margin-right', then
 * get the absolute left position of the table (called original position).
 * Now set the inline 'margin-left' and 'margin-right' properties be 'auto' for
 * table, it would be best to use !important to make its specificity be the
 * highest, then also get the absolute left position (called new position).
 * Restore the 'margin-left' and 'margin-right' properties of the table, and if
 * the new position is different from the original position, we think that the
 * CSS margin property which affects the center-aligned table element by HTML
 * align attribute.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'table_margin_affects_align_center',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'TABLE' ||
      chrome_comp.getAttributeLowerCase(node, 'align') != 'center')
    return;

  if (node.offsetWidth == 0 || node.offsetHeight == 0 || node.innerText == '')
    return;

  // Save old style.
  var oldInlineMarginLeft = node.style.marginLeft;
  var oldInlineMarginRight = node.style.marginRight;
  var oldOffsetLeft = node.offsetLeft;

  // Change marginLeft/Right to auto.
  node.style.marginLeft = 'auto !important';
  node.style.marginRight = 'auto !important';
  var newOffsetLeft = node.offsetLeft;

  // Restore old style.
  // Must set marginLeft/Right to null first, or it will not change if the
  // old value is empty string.
  node.style.marginLeft = null;
  node.style.marginRight = null;
  node.style.marginLeft = oldInlineMarginLeft;
  node.style.marginRight = oldInlineMarginRight;

  // Check if table moves.
  var THRESHOLD = 5;
  if (Math.abs(oldOffsetLeft - newOffsetLeft) > THRESHOLD) {
    var severityLevel = 1;
    if (0 == oldOffsetLeft)
      severityLevel = 9;
    this.addProblem('RX8004', {
      nodes: [node],
      severityLevel: severityLevel,
      details: 'oldOffsetLeft=' + oldOffsetLeft +
               ', newOffsetLeft=' + newOffsetLeft
    });
  }
}

); // declareDetector

});
