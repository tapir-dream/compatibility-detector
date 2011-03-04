/**
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

 /**
  * @fileoverview Check IE6 IE7 IE8 (Q) BUTTON tag type default value is not
  * submit
  *
  * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=90
  * WontFix
  *
  * Design:
  * Check each BUTTON node, if the node is in a form, and its type is not
  * set properly, there may be a problem.
  * Valid types are: submit, button, reset.
  *
  * But if there is onclick="javascript:return false", there will not be
  * compatibility issue. Have no good way to deal with it, mark as WontFix now.
  */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'button_type_form',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  // Check all BUTTON element
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'BUTTON')
    return;
  // Check the BUTTON element form attribute is present
  // If there exists a description of the FORM in BUTTON
  if (node.form != null) {
    this.addProblem('HF9015', [node]);
  }
}

); // declareDetector

});
