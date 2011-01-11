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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'inline_no_relpace_width_height',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  //check document type
  if (document.compatMode == 'CSS1Compat')
    return;

  if (Node.ELEMENT_NODE != node.nodeType ||
      !chrome_comp.isInlineNoReplacedElement(node))
    return;

  var width =
      chrome_comp.getDefinedStylePropertyByName(node, true, 'width');
  var height =
      chrome_comp.getDefinedStylePropertyByName(node, true, 'height');

  if((width && width != 'auto') || (height && height != 'auto')){
    var display=chrome_comp.getComputedStyle(node).display;
    if(display == 'inline')
      this.addProblem('RD1014', [node]);
  }
}
); // declareDetector

});