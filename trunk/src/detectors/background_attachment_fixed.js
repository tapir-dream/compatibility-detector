/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'background_attachment_fixed',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  // Check whether it is HTML or BODY element
  if (Node.ELEMENT_NODE != node.nodeType ||
      node.tagName == 'HTML' || node.tagName == 'BODY')
    return;
  // Get non-HTML BODY of the background-attachment property
  var background_attachment =
      chrome_comp.getDefinedStylePropertyByName(node, true, 
          'background-attachment');

  if (background_attachment == 'fixed')
    this.addProblem('RC3002', [node]);
}
); // declareDetector

});
