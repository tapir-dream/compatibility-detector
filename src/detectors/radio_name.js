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

'radio_name',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor


function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'INPUT')
    return;

  var inputTypeValue = node.getAttribute('type');
  var propertyValueRegExp_ = /^[A-Za-z0-9]$|^[A-Za-z0-9][A-Za-z0-9\-\_\:\b]+$/;
  var inputNameValue = node.getAttribute('name');

  if (inputTypeValue != 'radio')
    return;

  if (!propertyValueRegExp_.test(inputNameValue))
    this.addProblem('HF9009', [node]);

}
); // declareDetector

});
