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
 * @fileoverview: One detector implementation for checking that the
 * 'text-decoration' property which Text decorations visible difference in
 * browsers.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=29
 *
 * In W3C CSS 2.1 specification, the description aboout the inheritence of the
 * 'text-decoration' property is not very clear.
 *
 * This makes the realization of different browsers may arise in specific
 * differences.
 * The detector checks all nodes, and do the following treatment:
 * 1. Filter all text nodes, invisible nodes and the nodes which have no parent
 *    element.
 * 2. Filter quirks mode on the 'position: absolute' and 'position: fixed'
 *    elements.
 * 3. Filter the element set 'top' and 'left' properties less than -100,
 *    because they may be invisible.
 * 4. At last, report the issue according to WebkitTextDecorationsInEffect
 *    property.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'text_decoration_propagation',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  if (!node.parentNode)
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);
  var display = computedStyle.display;
  var threshold = -100;

  var position = computedStyle.position;
  // All browsers propagates decoration into absolute positioned block in
  // Quirks mode.
  if (position == 'absolute' || position == 'fixed') {
    if (chrome_comp.inQuirksMode())
      return;
    if ((parseInt(computedStyle.top, 10) | 0) < threshold ||
       (parseInt(computedStyle.left, 10) | 0) < threshold)
      return;
  } else if (display != 'inline-table' && display != 'inline-block') {
    return;
  }

  if ((parseInt(computedStyle.textIndent, 10) | 0) < threshold)
    return;

  if (!node.innerText)
    return;

  var parentComputedStyle = chrome_comp.getComputedStyle(node.parentNode);
  if (parentComputedStyle.WebkitTextDecorationsInEffect != 'none')
    this.addProblem('RT3002', [node]);
}
); // declareDetector

});
