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
 * @fileoverview: Check non-replaced inline element's height and width
 * settings only take effect in quirks mode in IE problems.
 * 
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=91
 *
 * Check document mode, when in quirks mode and the node is inline
 * non-replaced elements, if it sets width or height, there may be a problem.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'inline_no_relpace_width_height',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  // TODO: check for Chrome / IE inconsistence for document.compatMode
  this.inStandardsMode = !chrome_comp.inQuirksMode();
},

function checkNode(node, context) {
  if (this.inStandardsMode)
    return;
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  if (chrome_comp.getComputedStyle(node).display == 'inline' &&
      !chrome_comp.isReplacedElement(node)) {
    var specifiedStyle = chrome_comp.getSpecifiedValue(node); 
    if (specifiedStyle.width != 'auto' || specifiedStyle.height != 'auto')
      this.addProblem('RD1014', [node]);
  }
}
); // declareDetector

});