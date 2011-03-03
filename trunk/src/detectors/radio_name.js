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
 * @fileoverview Check the HTML INPUT[type=radio] elements for all elements.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=106
 *
 * SGML basic types:
 * ID and NAME tokens must begin with a letter ([A-Za-z]) and may be followed
 * by any number of letters, digits ([0-9]), hyphens ("-"), underscores ("_"),
 * colons (":"), and periods (".").
 * Refer to: http://www.w3.org/TR/html4/types.html#type-cdata
 *
 * If you do not meet the above specifications, will result in all the
 * different browsers of INPUT[type=radio] select options.
 *
 * The detector checks all nodes, and do the following treatment:
 * 1. Check all INPUT[type=radio] element
 * 2. If not set HTML name attribute, So have differences in all browsers.
 * 3. If name value is not SGML basic types of NAME tokens, So have
      differences in all browsers.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'radio_name',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.propertyValueRegExp_ =
      /^[A-Za-z][\w\-\:\.]*$/;
},

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'INPUT')
    return;

  var inputTypeValue = node.getAttribute('type');

  if (inputTypeValue != 'radio')
    return;

  // Check <input type='radio' /> format
  if (!node.hasAttribute('name')) {
    this.addProblem('HF9009', [node]);
    return;
  }

  // Check <input type='radio' name /> format
  var inputNameValue = node.getAttribute('name');
  if (inputNameValue == null) {
    this.addProblem('HF9009', [node]);
    return;
  }

  // Check name value is not SGML basic types
  if (!this.propertyValueRegExp_.test(inputNameValue))
    this.addProblem('HF9009', [node]);

}
); // declareDetector

});
