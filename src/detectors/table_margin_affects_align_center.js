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

// One detector implementation for checking 'margin-left' and 'margin-right' 
// properties affecting the table element which is center alignment problems
// @author : luyuan.china@gmail.com
// @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=4
//

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
