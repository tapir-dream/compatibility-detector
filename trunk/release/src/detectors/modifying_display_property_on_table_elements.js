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

'modifying_display_property_on_table_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType || (node.tagName != 'TABLE' &&
      node.tagName != 'TR' && node.tagName != 'TD' && node.tagName != 'TH' &&
      node.tagName != 'THEAD' && node.tagName != 'TBODY' &&
      node.tagName != 'TFOOT' && node.tagName != 'CAPTION' &&
      node.tagName != 'COL' && node.tagName != 'COLGROUP'))
    return;

  var map = {
    'TABLE': ['table', 'inline-table', 'none'],
    'TR': ['table-row', 'none'],
    'TD': ['table-cell', 'none'],
    'TH': ['table-cell', 'none'],
    'THEAD': ['table-header-group', 'none'],
    'TBODY': ['table-row-group', 'none'],
    'TFOOT': ['table-footer-group', 'none'],
    'CAPTION': ['table-caption', 'none'],
    'COL': ['table-column', 'none'],
    'COLGROUP': ['table-column-group', 'none']
  };
  var computedDisplay = window.chrome_comp.getComputedStyle(node).display;

  if (map[node.tagName].indexOf(computedDisplay) == -1)
    this.addProblem('RE8015', [node]);
}
); // declareDetector

});
