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

chrome_comp.CompDetect.declareDetector(

'img_padding',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType ||
      !chrome_comp.inQuirksMode() ||
      node.tagName != 'IMG')
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);
  if (parseInt(computedStyle.paddingLeft) ||
      parseInt(computedStyle.paddingTop) ||
      parseInt(computedStyle.paddingRight) ||
      parseInt(computedStyle.paddingBottom))
    this.addProblem('RX1010', [node]);
}
); // declareDetector

});
