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

'disabled_attribute',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.hasAttribute('disabled')) {
    var tagName = node.tagName;
    var isOpt = tagName == 'OPTGROUP' || tagName == 'OPTION';
    var isFormElement = (tagName == 'BUTTON' ||
                         tagName == 'INPUT' ||
                         tagName == 'OPTGROUP' ||
                         tagName == 'OPTION' ||
                         tagName == 'SELECT' ||
                         tagName == 'TEXTAREA');
    if (isOpt)
      this.addProblem('HF3013', [node]);
    else if (tagName != 'BUTTON' && tagName != 'INPUT' &&
               tagName != 'SELECT' && tagName != 'TEXTAREA' &&
	       //filter empty element and img element
	       tagName != 'IMG' && node.innerText.trim().length > 0)
         this.addProblem('HF3005', [node]);
  }
}
); // declareDetector

});
