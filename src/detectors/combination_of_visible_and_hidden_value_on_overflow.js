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
 * @fileoverview Check combination of visible and hidden value on overflow.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=23
 *
 * If one of an element's specified values of 'overflow-x' and 'overflow-y' is
 * 'visible' and the other is 'hidden', and its content overflow from its
 * content box at the 'visible' direction, the element will generate a scroll
 * bar at this direction in Chrome, but not in IE.
 * First, find the element whose 'overflow-x' and 'overflow-y' combines with
 * 'visible' and 'hidden', and then check whether the content is overflow at the
 * 'visible' direction, if so, report a problem.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'combination_of_visible_and_hidden_value_on_overflow',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {

}, // constructor

function checkNode(node, context) {
  if (node.nodeType != Node.ELEMENT_NODE || context.isDisplayNone())
    return;

  if (node.clientWidth == 0 || node.clientHeight == 0 ||
      chrome_comp.isReplacedElement(node) || chrome_comp.isTableElement(node) ||
      node.tagName == "HTML" || node.tagName == "BODY")
    return;

  // IE and Chrome will have differences only when the specified value of
  // 'overflow-x' and 'overflow-y' combines with 'visible' and 'hidden'.
  var overflowX =
      chrome_comp.getSpecifiedStyleValue(node, 'overflow-x') || 'visible';
  var overflowY =
      chrome_comp.getSpecifiedStyleValue(node, 'overflow-y') || 'visible';
  if ((overflowX == 'hidden' && overflowY == 'visible') ||
      (overflowX == 'visible' && overflowY == 'hidden')) {
    // Contents must overflow at the 'visible' direction.
    if ((overflowX == 'visible' && node.scrollWidth > node.clientWidth) ||
        (overflowY == 'visible' && node.scrollHeight > node.clientHeight)) {
      this.addProblem('RV1001', [node]);
    }
  }
}
); // declareDetector

});
