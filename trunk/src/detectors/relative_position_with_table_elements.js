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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'relative_position_with_table_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor


function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  var tableStyle = ['table-cell', 'table-row', 'table-caption'];
  var dis = chrome_comp.getComputedStyle(node).display;
  var pos = chrome_comp.getDefinedStylePropertyByName(node, true,
      'position');
  var l = parseInt(chrome_comp.getDefinedStylePropertyByName(node, true,
      'left'), 10);
  var t = parseInt(chrome_comp.getDefinedStylePropertyByName(node, true,
      'top'), 10);
  if ((tableStyle.indexOf(dis) != -1) && (pos === 'relative') &&
      (l != 0 || t != 0)) {
    this.addProblem('RM8024', [node]);
  }
}
); // declareDetector

});

