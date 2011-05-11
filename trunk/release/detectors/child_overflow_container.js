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
 * @fileoverview Check the contents overflow the container.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=36
 *
 * In IE6 IE7(Q) IE8(Q), if an element's size is not big enouth to contain its
 * child elements, and its specified value of 'overflow-x' or 'overflow-y' is
 * 'visible', the element's size will be stretch by these child elements.
 * We check every element whether its content is overflow from it, and on the
 * overflow direction, the overflow property is setted by 'visible', if so,
 * report a problem.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'child_overflow_container',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.THRESHOLD_X = 20;
  this.THRESHOLD_Y = this.THRESHOLD_X / 2;

  // TODO: Move this function into framework.
  this.getVisuallyNextElementSibling = function(element) {
    var nextElement = element;
    while (nextElement = nextElement.nextElementSibling) {
      var style = chrome_comp.getComputedStyle(nextElement);
      if (style.display != 'none' &&
          (style.position != 'absolute' ||
              style.position == 'absolute' &&
                  style.top == 'auto' && style.right == 'auto' &&
                  style.bottom == 'auto' && style.left == 'auto'))
        return nextElement;
    }
    return null;
  };

  /**
   * Merge two arrays into one, and remove any duplicate values.
   * @param {array} arrayA Array you wang to merge.
   * @param {array} arrayB Array you wang to merge.
   * @return {array} The new array which merged from arrayA and arrayB.
   */
  this.mergeArrays = function(arrayA, arrayB) {
    var i = arrayB.length;
    while (i--) {
      var item = arrayB[i];
      if (arrayA.indexOf(item) == -1)
        arrayA.push(item);
    }
    return arrayA;
  };
}, // constructor

function checkNode(node, context) {
  if (node.nodeType != Node.ELEMENT_NODE || context.isDisplayNone())
    return;

  if (chrome_comp.isReplacedElement(node) || chrome_comp.isTableElement(node) ||
      node.tagName == "HTML" || node.tagName == "BODY")
    return;

  var nodeStyle = chrome_comp.getComputedStyle(node);
  if (nodeStyle.display == 'inline')
    return;

  var overflowX =
      chrome_comp.getSpecifiedStyleValue(node, 'overflow-x') || 'visible';
  var overflowY =
      chrome_comp.getSpecifiedStyleValue(node, 'overflow-y') || 'visible';
  var doHorizontalCheck = overflowX == 'visible';
  var doVerticalCheck = overflowY == 'visible';
  if (!doHorizontalCheck && !doVerticalCheck)
    return;

  // These child elements will stretch current node.
  var childrenOverflowHorizontally = [];
  var childrenOverflowVertically = [];

  // If contentBoxInIE is different with contentBoxInChrome, problem detected.
  var contentBoxInChrome = chrome_comp.getLayoutBoxes(node).contentBox;
  var contentBoxInIE = {
    top: contentBoxInChrome.top,
    right: contentBoxInChrome.right,
    bottom: contentBoxInChrome.bottom,
    left: contentBoxInChrome.left
  };

  var children = node.children;
  for (var i = 0, c = children.length; i < c; ++i) {
    var child = children[i];
    var childIsOverflowInHorizontal = false;
    var childIsOverflowInVertical = false;
    var childStyle = chrome_comp.getComputedStyle(child);
    var childDisplay = childStyle.display;
    var childPosition = childStyle.position;
    // Absolutely positioned element will not stretch its parent element.
    // Inline element will not have much impact on the layout.
    if (childDisplay == 'none' || childDisplay == 'inline' ||
        childPosition == 'absolute')
      continue;
    var childMarginBox = chrome_comp.getLayoutBoxes(child).marginBox;
    // Relatively positioned element will stretch its parent element, like it
    // has no offset (dosn't setted 'top', 'right', 'bottom', 'left'). So adjust
    // its coordinates is necessary.
    // If its 'top' and 'bottom' is both setted, 'bottom' will be ignored.
    // If its 'left' and 'right' is both setted, 'right' will be ignored when
    // its container block's direction is 'ltr', or 'left' will be ignored when
    // its container block's direction is 'rtl'.
    if (childPosition == 'relative') {
      var specifiedTop = chrome_comp.getSpecifiedStyleValue(child, 'top');
      var specifiedRight = chrome_comp.getSpecifiedStyleValue(child, 'right');
      var specifiedBottom = chrome_comp.getSpecifiedStyleValue(child, 'bottom');
      var specifiedLeft = chrome_comp.getSpecifiedStyleValue(child, 'left');
      var offsetX = 0;
      var offsetY = 0;
      if (specifiedRight)
        offsetX = -parseInt(childStyle.right);
      if (specifiedLeft && (nodeStyle.direction == 'ltr' || !specifiedRight))
        offsetX = parseInt(childStyle.left);
      if (specifiedBottom)
        offsetY = -parseInt(childStyle.bottom);
      if (specifiedTop)
        offsetY = parseInt(childStyle.top);
      childMarginBox.top -= offsetY;
      childMarginBox.right -= offsetX;
      childMarginBox.bottom -= offsetY;
      childMarginBox.left -= offsetX;
    }
    if (doHorizontalCheck) {
      // For "direction:rtl".
      if (childMarginBox.left < contentBoxInIE.left - this.THRESHOLD_X) {
        childIsOverflowInHorizontal = true;
        contentBoxInIE.left = childMarginBox.left;
      }
      if (childMarginBox.right > contentBoxInIE.right + this.THRESHOLD_X) {
        childIsOverflowInHorizontal = true;
        contentBoxInIE.right = childMarginBox.right;
      }
    }
    if (doVerticalCheck) {
      // The top edge will only be stretch if child node's margin-top is not
      // collapsed with its parent element in IE. In fact, if this happens, the
      // bottom edge will be bigger in IE, but not top edge be smaller.
      if (childMarginBox.top < contentBoxInIE.top - this.THRESHOLD_Y) {
        // If margin collapsed in IE, continue.
        if ((Math.ceil(contentBoxInChrome.top - childMarginBox.top) ==
                parseInt(childStyle.marginTop)) &&
            parseInt(nodeStyle.paddingTop) == 0 &&
            parseInt(nodeStyle.borderTopWidth) == 0 &&
            !chrome_comp.hasLayoutInIE(node)) {
          continue;
        }
        childIsOverflowInVertical = true;
        contentBoxInIE.top = childMarginBox.top;
      }
      if (childMarginBox.bottom > contentBoxInIE.bottom + this.THRESHOLD_Y) {
        // If margin collapsed in IE, continue.
        if (Math.ceil(childMarginBox.bottom - contentBoxInChrome.bottom) ==
                parseInt(childStyle.marginBottom) &&
            parseInt(nodeStyle.paddingBottom) == 0 &&
            parseInt(nodeStyle.borderBottomWidth) == 0 &&
            !chrome_comp.hasLayoutInIE(node)) {
          continue;
        }
        childIsOverflowInVertical = true;
        contentBoxInIE.bottom = childMarginBox.bottom;
      }
    }
    if (childIsOverflowInHorizontal) {
      childrenOverflowHorizontally.push(child);
    }
    if (childIsOverflowInVertical) {
      childrenOverflowVertically.push(child);
    }
  }

  var widthInChrome = chrome_comp.util.width(contentBoxInChrome);
  var heightInChrome = chrome_comp.util.height(contentBoxInChrome);
  var widthInIE = chrome_comp.util.width(contentBoxInIE);
  var heightInIE = chrome_comp.util.height(contentBoxInIE);

  // No problem.
  if (widthInChrome == widthInIE && heightInChrome == heightInIE)
    return;

  // Check whether has visually affect, and filter affected elements.
  // If this node has no border and background, do more check.
  // TODO: Do more check in parent element: floats/absolutely positioned...
  if (!chrome_comp.hasBorder(node) && !chrome_comp.hasBackground(node)) {
    var nextElement = this.getVisuallyNextElementSibling(node);
    // Has visually next sibling element, if the next sibling element's vertical
    // position is the same position in IE, don't report problem, because there
    // has no visually difference in this case.
    if (nextElement) {
      var nextElementMarginBox =
          chrome_comp.getLayoutBoxes(nextElement).marginBox;
      if (childrenOverflowVertically.length &&
          nextElementMarginBox.top >= contentBoxInIE.bottom +
              parseInt(nodeStyle.marginBottom) +
              parseInt(nodeStyle.paddingBottom) - this.THRESHOLD_Y)
        childrenOverflowVertically.length = 0;
    }
    // Element's height is 0, or has no visually next sibling element, these
    // cases is generally caused by forget to clear floats, if this node is not
    // overflow from its parent element's content box in IE, don't report
    // problem too.
    if (heightInChrome == 0 || !nextElement) {
      var parent = node.parentElement;
      var parentContentBox = chrome_comp.getLayoutBoxes(parent).contentBox;
      if (childrenOverflowHorizontally.length &&
          contentBoxInIE.left - parseInt(nodeStyle.marginLeft) -
              parseInt(nodeStyle.paddingLeft) >= parentContentBox.left -
              this.THRESHOLD_X &&
          contentBoxInIE.right + parseInt(nodeStyle.marginRight) +
              parseInt(nodeStyle.paddingRight) <= parentContentBox.right +
              this.THRESHOLD_X)
        childrenOverflowHorizontally.length = 0;
      if (childrenOverflowVertically.length &&
          contentBoxInIE.top - parseInt(nodeStyle.marginTop) -
              parseInt(nodeStyle.paddingTop) >= parentContentBox.top -
              this.THRESHOLD_Y &&
          contentBoxInIE.bottom + parseInt(nodeStyle.marginBottom) +
              parseInt(nodeStyle.paddingBottom) <= parentContentBox.bottom +
              this.THRESHOLD_Y)
        childrenOverflowVertically.length = 0;
    }
  }

  var affectedElements = this.mergeArrays(childrenOverflowHorizontally,
      childrenOverflowVertically);
  if (affectedElements.length == 0)
    return;

  // The first highlight element is the stretched element.
  affectedElements.unshift(node);
  var details = "Content box's size in Chrome: " +
      widthInChrome + ' * ' + heightInChrome + ', in IE: ' +
      widthInIE + ' * ' + heightInIE + '.';
  this.addProblem('RD1002', {
    nodes: affectedElements,
    details: details
  });
}
); // declareDetector

});
