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
 * @fileoverview Check problems about 'border-spacing' property and cellspacing
 * attribute in the collapsing border model.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=24
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=119
 *
 * 'border-spacing' property specifies the horizontal and vertical distance
 * that separates adjoining cell borders. The effect of setting cellspacing
 * attribute is the same as set 'border-spacing' property. IE6 IE7 IE8(Q)
 * doesn't support 'border-spacing' property, and cellspacing attribute is
 * still works in the collapsing border model('border-collapse:collapse').
 *
 * First we check all 'display : table' and 'display : inline-table' elements,
 * then detect problems in two cases:
 * 1. table-like-element use collapsing border model. If the element has
 * attribute cellspacing and it's value is nonzero, then report problem RX1008.
 * 2. table-like-element use separated borders model. If the element has
 * attribute cellspacing and it's value is unequal to the value of
 * border-horizontal-spacing or border-vertical-spacing, then report problem
 * RE1020. If the table-like-element has no attribute cellspacing and the value
 * of 'border-horizontal-spacing' or 'border-vertical-spacing' greater than
 * 2px, then report problem RE1020(TABLE has 2px border-spacing default in IE
 * and omiting difference causes by 1px).
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'table_cellspacing_border_collapse',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.THRESHOLD_OF_COLLAPSE = 2;
  this.THRESHOLD_OF_SEPARATE = 5;
  this.reportProblemRE1020 = function(node, hSpacing, vSpacing) {
    this.addProblem('RE1020', {
      nodes: [node],
      details: 'hSpacing = ' + hSpacing + 'px' +
         ', vSpacing = ' + vSpacing + 'px'
    });
  }
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);
  var display = computedStyle.display;
  if (display == 'table' || display == 'inline-table') {
    var borderCollapse = computedStyle.borderCollapse;
    var cellspacing = node.getAttribute('cellspacing');
    switch (borderCollapse) {
      case 'collapse':
        if (chrome_comp.toInt(cellspacing) > this.THRESHOLD_OF_COLLAPSE &&
            node.childElementCount > 0) {
          this.addProblem('RX1008', {
            nodes: [node],
            details: 'cellspacing = ' + cellspacing
          });
        }
        break;
      case 'separate':
        var hSpacing = chrome_comp.toInt(
            computedStyle.WebkitBorderHorizontalSpacing, 10);
        var vSpacing = chrome_comp.toInt(
            computedStyle.WebkitBorderVerticalSpacing, 10);

        if (node.tagName == 'TABLE') {
          if (node.hasAttribute('cellspacing')) {
            var spacing = chrome_comp.toInt(node.getAttribute('cellspacing'));
            if (hSpacing != spacing || vSpacing != spacing) {
              this.reportProblemRE1020(node, hSpacing, vSpacing);
              return;
            }
          } else {
            // TABLE has 2px border-spacing default in IE and omiting
            // difference causes by 1px.
            if (hSpacing > this.THRESHOLD_OF_SEPARATE ||
                vSpacing > this.THRESHOLD_OF_SEPARATE) {
              this.reportProblemRE1020(node, hSpacing, vSpacing);
              return;
            }
          }
        // Other elements which set 'display:table' or 'display:inline-table'.
        } else {
          if (hSpacing > this.THRESHOLD_OF_SEPARATE ||
              vSpacing > this.THRESHOLD_OF_SEPARATE)
            this.reportProblemRE1020(node, hSpacing, vSpacing);
        }
        break;
    }
  }
}
); // declareDetector

});
