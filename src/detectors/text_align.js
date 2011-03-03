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
 * @fileoverview One detector implementation for checking influence of the
 * 'text-align' property on the block level elements.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=34
 *
 * The 'text-align' property can apply to all kinds of elements including the
 * block level elements in W3C CSS 1 specification which IE6, IE7 and IE8
 * quirks mode follow, but in CSS2.1 specification, it changes to applying to
 * only the inline level elements or contents. So, this property can apply to
 * the block level elements in IE6/7/8.
 *
 * The detector check all nodes, and do the following treatment:
 * 1. Ignore all text nodes, invisible elements and the elements having no
 *    parent.
 * 2. Check the elements set the 'text-align' property, and it is not empty
 *    node, its offsetHeight is bigger than 0.
 * 3. Check for child elements whose width is less than the parent.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'text_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var style = chrome_comp.getComputedStyle(node);
  var display = style.display;
  var textAlign = style.textAlign;
  var direction = style.direction;
  var THRESHOLD = 1;
  if ((display == 'block' || display == 'inline-block' ||
          display == 'table-cell') &&
      (textAlign == 'center' ||
          (direction == 'ltr' && textAlign == 'right') ||
          (direction == 'rtl' && textAlign == 'left'))) {
    var containerWidth = parseInt(style.width, 10);
    var child = node.firstElementChild;
    while (child) {
      var childStyle = chrome_comp.getComputedStyle(child);
      if (child.offsetHeight > 0 &&
          childStyle.innerText != '' &&
          childStyle.display == 'block' &&
          childStyle.float == 'none' &&
          (childStyle.position == 'static' ||
              childStyle.position == 'relative')) {
        var childWidth = child.offsetWidth +
            parseInt(childStyle.marginLeft, 10) +
            parseInt(childStyle.marginRight, 10);
        if (childWidth < containerWidth - THRESHOLD) {
          // If child's width is smaller than container's width,
          // it may be aligned differently in IE.
          this.addProblem('RT8003', {
            nodes: [node, child],
            details: 'container width: ' + containerWidth +
            ', child element width: '+ childWidth
          });
          return;
        }
      }
      child = child.nextElementSibling;
    }
  }
}
); // declareDetector

});
