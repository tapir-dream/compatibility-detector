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

'td_nowrap_inheritence',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      (node.tagName != 'TD' && node.tagName != 'TH'))
    return;

  if (node.innerText &&
      chrome_comp.getComputedStyle(node).whiteSpace == 'nowrap' &&
      (node.hasAttribute('width') ||
       chrome_comp.getDefinedStylePropertyByName(node, true, 'width') ||
       chrome_comp.getDefinedStylePropertyByName(node, true, 'white-space') !=
           'nowrap'))
    this.addProblem('RX1003', [node]);
}
); // declareDetector

});
