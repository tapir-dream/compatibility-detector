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
 * @fileoverview: One detector implementation for checking the HTML marginwidth
 * and marginheight attribute for FRAME and IFRAME elements.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=109
 *
 * HTML marginwidth and marginheight is % Pixels type in HTML 4 DTD
 * % Pixels is NUMBER tokens
 * NUMBER tokens must contain at least one digit ([0-9]) in SGML basic types
 *
 * Therefore, the detection of elements attribute values to determine
 * whether there can be potential problems.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'frame_margin',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.propertyValueRegExp_ = /(^\d+$)|(^\s*$)|^null$/;
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'FRAME' && node.tagName != 'IFRAME')
    return;

  if (!this.propertyValueRegExp_.test(node.getAttribute('marginwidth')))
    this.addProblem('HM1002', [node]);
  if (!this.propertyValueRegExp_.test(node.getAttribute('marginheight')))
    this.addProblem('HM1002', [node]);
}
); // declareDetector

});
