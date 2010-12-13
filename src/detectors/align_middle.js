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

var VALID_ALIGN_MIDDLE_TAGS = {
  IMG: true,
  OBJECT: true,
  APPLET: true,
  EMBED: true,
  IFRAME: true,
  HR: true
};

chrome_comp.CompDetect.declareDetector(

'align_middle',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getAttributeLowerCase(node, 'align') == 'middle' &&
      !VALID_ALIGN_MIDDLE_TAGS.hasOwnProperty(node.tagName))
    this.addProblem('HA1003', [node]);
}
); // declareDetector

});
