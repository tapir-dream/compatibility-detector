/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'border_spacing_between_multiple_table_row_groups',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'TABLE')
    return;

  var borderSpacing =
      chrome_comp.getComputedStyle(node).borderSpacing.split(' ');
  var list = ['TBODY', 'TFOOT', 'THEAD'];

  for (var i = 0, rowGroupCount = 0, j = node.children.length; i < j; i++) {
    if (list.indexOf(node.children[i].tagName) != -1)
      rowGroupCount++;
  }

  var vBorderSpacing = borderSpacing[1] || borderSpacing[0];

  if (rowGroupCount > 1 && parseInt(vBorderSpacing) > 0) {
    this.addProblem('RX1014', [node]);
  }
}
); // declareDetector

});

