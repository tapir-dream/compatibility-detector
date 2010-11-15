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
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      // Firefox Standard mode RE8010 issue is ignored.
      !chrome_comp.inQuirksMode())
    return;

  if (chrome_comp.startsBlockBox(node)) {
    var height = chrome_comp.getDefinedStylePropertyByName(node, false,
        'height');
    if (height && height[height.length - 1] == '%') {
      var container = chrome_comp.getContainingBlock(node);
      var containerDisplay = chrome_comp.getComputedStyle(container).display;
      // Here omit the cases that node is in a table (or a table cell) to
      // simplify the algorithm.
      if (containerDisplay.substring(0, 5) != 'table') {
        var containerHeight = chrome_comp.getDefinedStylePropertyByName(
            container, true, 'height');
        if (!containerHeight || containerHeight == 'auto') {
          this.addProblem(node.tagName == 'TABLE' ? 'RE8010' : 'RD8026',
              [node, container]);
        }
      }
    }
  }
}
); // declareDetector

});
