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
 * @fileoverview Check if the default values of 'display' property on table like
 * elements are changed.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=72
 *
 * Some values including the string "table" of 'display' property are different
 * with the others, they cause an element to behave like a table element. In
 * HTML 4, the semantics of the various table elements (TABLE, CAPTION, THEAD,
 * TBODY, TFOOT, COL, COLGROUP, TH, and TD) are well-defined, and the CSS
 * 'display' property of the said elements may have been defined default value
 * by user agent. The CSS2.1 specification says that user agents may ignore
 * these 'display' property values for HTML table elements, since HTML tables
 * may be rendered using other algorithms intended for backwards compatible
 * rendering. But some browsers will not ignore these 'display' value for table
 * elements, and the table elements' behavior may changed after that.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'modifying_display_property_on_table_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  // Get the document mode in Chrome, we will use it later.
  this.documentModeInWebKit = chrome_comp.documentMode.WebKit;
  // This list contains all table like elements and its values which cannot
  // cause differences in all browsers.
  this.tableElementMap = {
    TABLE: {table: true, 'inline-table': true},
    TR: {'table-row': true},
    TD: {'table-cell': true},
    TH: {'table-cell': true},
    THEAD: {'table-header-group': true},
    TBODY: {'table-row-group': true},
    TFOOT: {'table-footer-group': true},
    CAPTION: {'table-caption': true},
    COL: {'table-column': true},
    COLGROUP: {'table-column-group': true}
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  var tagName = node.tagName;
  // Only check the visible table elements.
  if (!(tagName in this.tableElementMap))
    return;
  // The 'display' property values for the TABLE, TD and TH elements cannot be
  // modified when Chrome is Quirks Mode.
  if (this.documentModeInWebKit == 'Q' &&
     (tagName == 'TABLE' || tagName == 'TD' || tagName == 'TH'))
    return;
  var display = chrome_comp.getComputedStyle(node).display;
  // The 'display' property value is not the default value.
  if (!(display in this.tableElementMap[tagName]))
    this.addProblem('RE8015', {
      nodes: [node],
      details: tagName + ' { display: ' + display + '; }'
    });
}
); // declareDetector

});
