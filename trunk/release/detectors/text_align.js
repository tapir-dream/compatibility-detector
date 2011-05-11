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
 * @fileoverview Check the differences in performance of the 'text-align'
 * property on block level elements.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=34
 *
 * The 'text-align' property can apply to all kinds of elements including the
 * block level elements in W3C CSS 1 specification which IE6, IE7 and IE8
 * quirks mode follow, but in CSS2.1 specification, it changes to applying to
 * only the inline level elements or contents. So, this property can apply to
 * the block level elements in IE6/7/8.
 *
 * In CSS 1 specification, 'text-align' property describes how text is aligned
 * within the element, and all block-level elements in this element will be
 * affected.
 * IE6 IE7 IE8(Q) implemented in accordance with this specification.
 * In CSS2.1 specification, 'text-align' property describes how inline-level
 * content of a block container is aligned, so block-level elements in this
 * element will be affected.
 * IE8(S) Chrome implemented in accordance with this specification.
 *
 * This detector will check all nodes as the following:
 * 1. Ignore all text nodes, invisible elements and the elements having no
 *    parent.
 * 2. Ignore sub-elmement is have floats layout.
 * 3. Check the elements set the 'text-align' property, and it is not empty
 *    node, its offsetHeight is bigger than 0.
 * 4. Check for child elements whose width is less than the parent.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'text_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.THRESHOLD_OF_CENTER = 5;
  this.THRESHOLD_OF_LEFT = this.THRESHOLD_OF_CENTER;
  this.THRESHOLD_OF_RIGHT = this.THRESHOLD_OF_CENTER;
  this.THRESHOLD_OF_HEIGHT = 3;

  this.isVisibleElement = function(element) {
    if (element.tagName == 'BR')
      return false;
    if (chrome_comp.mayAffectNormalFlow(element) != 1)
      return false;
    if (!chrome_comp.hasBorder(element) &&
        !chrome_comp.hasBackground(element) &&
        element.innerText.trim() == '' &&
        element.offsetHeight <= this.THRESHOLD_OF_HEIGHT)
      return false;
    return true;
  };

  /**
   * @param {Element} node
   * @param {function(Element, Element, number)} isAligned
   * @param {number} threshold
   */
  this.checkChild = function (node, isAligned, threshold) {
    var child = node.firstElementChild;
    while (child) {
      if (!this.isVisibleElement(child) ||
          chrome_comp.isCenterAlignedByMarginAndWidth(child)) {
        child = child.nextElementSibling;
        continue;
      }
      if (chrome_comp.isMarginLeftAuto(child) ||
          chrome_comp.isMarginRightAuto(child)) {
        child = child.nextElementSibling;
        continue;
      }
      if (isAligned(node, child, threshold)) {
        child = child.nextElementSibling;
        continue;
      }
      var containerContentWidth = chrome_comp.util.width(
          chrome_comp.getLayoutBoxes(node).contentBox);
      var childMarginBoxWidth = chrome_comp.util.width(
          chrome_comp.getLayoutBoxes(child).marginBox);
      this.addProblem('RT8003', {
        nodes: [node, child],
        // TODO: localize
        details: 'container element content box width: ' +
            containerContentWidth + 'px' +
            ', child element maring box width: ' +
            childMarginBoxWidth + 'px'
      });
      child = child.nextElementSibling;
    }
  };

},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var style = chrome_comp.getComputedStyle(node);
  var display = style.display;
  var textAlign = style.textAlign;
  var direction = style.direction;
  var CHECK_DISPLAY_LIST = {
    block: true,
    'inline-block': true,
    'table-cell': true,
    'list-item': true
  };

  if (!(display in CHECK_DISPLAY_LIST))
    return;

  if (chrome_comp.hasVisibleFloatingChild(node))
    return;

  if (textAlign == 'center') {
    this.checkChild(node, chrome_comp.isVisuallyCenterAligned,
        this.THRESHOLD_OF_CENTER);
    return;
  }

  if (direction == 'ltr' && textAlign == 'right') {
    this.checkChild(node, chrome_comp.isVisuallyRightAligned,
        this.THRESHOLD_OF_RIGHT);
    return;
  }

  if (direction == 'rtl' && textAlign == 'left') {
    this.checkChild(node, chrome_comp.isVisuallyLeftAligned,
        this.THRESHOLD_OF_LEFT);
    return;
  }

}
); // declareDetector

});
