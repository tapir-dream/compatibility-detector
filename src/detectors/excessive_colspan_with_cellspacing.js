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

'excessive_colspan_with_cellspacing',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  function hasCellspacing(element) {
    var borderSpacing = chrome_comp.getComputedStyle(element).borderSpacing;
    return parseInt(borderSpacing.split(' ')[0], 10);
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'TABLE')
    return;

  if (!hasCellspacing(node))
    return;

  for (var i = 0, max, list = [], j = node.rows.length; i < j; i++) {
    list[i] |= 0;
    for (var m = 0, n = node.rows[i].cells.length; m < n; m++) {
      list[i] += node.rows[i].cells[m].colSpan | 0;
      if (i > 0) {
        if (list[i] > max)
          this.addProblem('HE1005', [node.rows[i].cells[m]]);
        max = Math.max(max, list[i]);
      } else
          max = list[i];
      if (node.rows[i].cells[m].rowSpan > 1) {
        for (var a = 1, b = node.rows[i].cells[m].rowSpan; a <= b; a++)
          list[i + a - 1] = 1;
      }
    }
  }
}
); // declareDetector

});

