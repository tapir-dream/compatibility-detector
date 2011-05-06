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
 * @fileoverview Checking unselectable attribute of IE.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=47
 *
 * The 'unselectable' attribute can avoid the element's content being selected
 * in IE and Opera.
 * The detector check all nodes, and do the following treatment:
 * 1. Filter text node and display none node.
 * 2. Check HTML tag 'unselectable' attribute value is on, and not set css
 *    '-web-user-select:none' property or not set js Event onselectstart.
 * 3. IF it has no js Event onselectstart, report a problem.
 */


addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'forbidden_content_selection',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.isForbiddenByEvent = function(node) {
    return node.onselectstart && node.onselectstart() == false;
  }

  this.isForbiddenByCssProperty = function(node) {
    return chrome_comp.getComputedStyle(node).webkitUserSelect == 'none';
  }

  this.isForbiddenByAttribute = function(node) {
    return (node.getAttribute('unselectable') || '').toLowerCase() == 'on';
  }
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (this.isForbiddenByEvent(node))
    return;

  if (this.isForbiddenByAttribute(node) !=
      this.isForbiddenByCssProperty(node))
    this.addProblem('BX2050', {
      nodes: [node],
      details: 'unselectable = ' + node.getAttribute('unselectable') +
          ', -webkit-user-select = ' +
          chrome_comp.getComputedStyle(node).webkitUserSelect +
          ', onselectstart = ' + node.onselectstart
    });
}
); // declareDetector

});
