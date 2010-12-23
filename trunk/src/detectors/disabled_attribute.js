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

/**
 * @fileoverview: One detector implementation for checking the HTML disable
 * attribute for all elements.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=20
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=115
 *
 * The disabled attribute can set for a form control. The following elements
 * support the disabled attribute: BUTTON, INPUT, OPTGROUP, OPTION, SELECT, and
 * TEXTAREA. But IE6 and IE7 do not support the disable attribute for the
 * OPTGROUP and OPTION elements. And IE6, IE7 and IE8 support the disabled
 * attribute for some non-form elements such as anchors, and the attribute
 * can be inherited.
 * So the detector report the issues according to the said conditions.
 *
 * The detector checks all nodes, and do the following treatment:
 * 1. Filter all text nodes, and the node is not visible.
 * 2. Detect the presence of 'disabled' attribute of the tag.
 * 3. If the tagName is OPTION or OPTGROUP, that other browsers IE6 and IE7
 *    and the display is different.
 * 4. If the tagName is not BUTTON INPUT SELECT TEXTAREA and IMG,
 *    and the node in sub-tree have the text content, to that other browsers
 *    IE6 IE7 have the display different.
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
    if (isOpt) {
      this.addProblem('HF3013', [node]);
    } else if (tagName != 'BUTTON' && tagName != 'INPUT' &&
               tagName != 'SELECT' && tagName != 'TEXTAREA' &&
               // Filter empty element and img element
               tagName != 'IMG' && node.innerText.trim().length > 0) {
      this.addProblem('HF3005', [node]);
    }
  }
}
); // declareDetector

});
