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
 * @fileoverview: One detector implementation for checking problems about the
 * OBJECT elements.
 *
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=88
 *       https://code.google.com/p/compatibility-detector/issues/detail?id=125
 *       https://code.google.com/p/compatibility-detector/issues/detail?id=126
 */

addScriptToInject(function() {

function isAuto(element) {
  var inlineDisplay = element.style.display;
  element.style.display = 'none !important';
  var width = chrome_comp.getComputedStyle(element).width;
  var height = chrome_comp.getComputedStyle(element).height;
  element.style.display = null;
  element.style.display = (inlineDisplay) ? inlineDisplay : null;
  return (width == 'auto') || (height == 'auto');
}

chrome_comp.CompDetect.declareDetector(

'object_onerror',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'OBJECT')
    return;

  var supportedClassid = [
    'CLSID:D27CDB6E-AE6D-11CF-96B8-444553540000',
    'CLSID:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA',
    'CLSID:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B',
    'CLSID:166B1BCA-3F9C-11CF-8075-444553540000',
    'CLSID:6BF52A52-394A-11D3-B153-00C04F79FAA6',
    'CLSID:22D6F312-B0F6-11D0-94AB-0080C74C7E95'
  ];
  var classid = node.getAttribute('classid');
  var classidUpper = (classid) ? classid.toUpperCase() : '';
  var hasClassid = classid != '';
  var isSupportedClassid = supportedClassid.indexOf(classidUpper) != -1;
  var hasOnerror = node.getAttribute('onerror') || node.onerror;
  if (isSupportedClassid)
    this.addProblem('HO9006', [node]);
  if (hasOnerror && !isSupportedClassid)
    this.addProblem('BT2022', [node]);
  if (isAuto(node))
    this.addProblem('HO1007', [node]);
}
); // declareDetector

});
