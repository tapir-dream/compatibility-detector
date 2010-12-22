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

// One detector implementation for checking the CSS margin property which 
// affects the center-aligned table element by HTML align attribute.
// @author : luyuan.china@gmail.com
// @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=4
//
// The align attribute of table elements make the table itself align center
// being relative to its containing block. In non-IE browsers, it will be
// transformed to CSS property - 'margin-left:auto' and 'margin-right:auto'.
// So the detector first check the center-aligned table elements by HTML align
// attribute, ignoring the empty table element and invisible table (the width
// or height is zero).
//
// Record the inline style value of 'margin-left' and 'margin-right', then
// get the absolute left position of the table (called original position).
// Now set the inline 'margin-left' and 'margin-right' properties be 'auto' for
// table, it would be best to use !important to make its specificity be the
// highest, then also get the absolute left position (called new position).
// Restore the 'margin-left' and 'margin-right' properties of the table, and if
// the new position is different from the original position, we think that the
// CSS margin property which affects the center-aligned table element by HTML // align attribute.


addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'table_margin_affects_align_center',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      node.tagName != 'TABLE')
    return;

  if (chrome_comp.getAttributeLowerCase(node, 'align') != 'center')
    return;

  if (node.offsetWidth == 0 || node.offsetHeight == 0)
    return;

  if (node.innerText == '')
    return;

  var inlineMarginLeft = node.style.marginLeft;
  var inlineMarginRight = node.style.marginRight;
  var left = node.getBoundingClientRect().left;
  node.style.marginLeft = 'auto !important';
  node.style.marginRight = 'auto !important';
  var newLeft = node.getBoundingClientRect().left;
  node.style.marginLeft = null;
  node.style.marginLeft = (inlineMarginLeft) ? inlineMarginLeft : null;
  node.style.marginRight = null;
  node.style.marginRight = (inlineMarginRight) ? inlineMarginRight : null;
  if ((left != newLeft) && (newLeft != left + 1))
    this.addProblem('RX8004', [node]);
}
); // declareDetector

});
