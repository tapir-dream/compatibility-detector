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

'percent_height_in_auto_height',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  function isAutoHeight(element) {
    var inlineDisplay = element.style.display;
    element.style.display = 'none !important';
    var height = chrome_comp.getComputedStyle(element).height;
    element.style.display = null;
    element.style.display = (inlineDisplay) ? inlineDisplay : null;
    return height == 'auto';
  }

  function isPercentageHeight(element) {
    var inlineDisplay = element.style.display;
    element.style.display = 'none !important';
    var height = chrome_comp.getComputedStyle(element).height;
    element.style.display = null;
    element.style.display = (inlineDisplay) ? inlineDisplay : null;
    return height.slice(-1) == '%';
  }

  function isTable(element) {
    return chrome_comp.getComputedStyle(element).display == 'table';
  }

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      // Firefox Standard mode RE8010 issue is ignored.
      !chrome_comp.inQuirksMode())
    return;

  if (!isPercentageHeight(node))
    return;
  var cb = chrome_comp.getContainingBlock(node);
  if (!cb)
    return;
  if (!isAutoHeight(cb) && cb.tagName != 'BODY')
    return;
  if (cb.tagName == 'BODY' && isAutoHeight(cb))
    return;

  var oldHeight = parseInt(chrome_comp.getComputedStyle(node).height);
  var inlineHeight = node.style.height;
  node.style.height = 'auto !important';
  var newHeight = parseInt(chrome_comp.getComputedStyle(node).height);
  node.style.height = null;
  node.style.height = (inlineHeight) ? inlineHeight : null;
  if (oldHeight != newHeight) {
    this.addProblem(isTable(node) ? 'RE8010' : 'RD8026', [node]);
  }
}
); // declareDetector

});