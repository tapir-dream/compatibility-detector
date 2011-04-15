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
  var affectedElements = [];

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
    var childIsOverflow = false;
    var childStyle = chrome_comp.getComputedStyle(child);
    var display = childStyle.display;
    var position = childStyle.position;
    // Absolutely positioned element will not stretch its parent element.
    // Inline element will not have much impact on the layout.
    if (display == 'none' || display == 'inline' || position == 'absolute')
      continue;
    var childMarginBox =
        chrome_comp.getLayoutBoxes(child).marginBox;
    // Relatively positioned element will stretch its parent element, like it
    // has no offset (dosn't setted 'top', 'right', 'bottom', 'left'). So adjust
    // its coordinates is necessary.
    // If its 'top' and 'bottom' is both setted, 'bottom' will be ignored.
    // If its 'left' and 'right' is both setted, 'right' will be ignored when
    // its container block's direction is 'ltr', or 'left' will be ignored when
    // its container block's direction is 'rtl'.
    if (position == 'relative') {
      var specifiedTop =
          chrome_comp.getSpecifiedStyleValue(child, 'top');
      var specifiedRight =
          chrome_comp.getSpecifiedStyleValue(child, 'right');
      var specifiedBottom =
          chrome_comp.getSpecifiedStyleValue(child, 'bottom');
      var specifiedLeft
          = chrome_comp.getSpecifiedStyleValue(child, 'left');
      var offsetX = 0;
      var offsetY = 0;
      if (specifiedRight)
        offsetX = -parseInt(childStyle.right);
      if (specifiedLeft &&
          (nodeStyle.direction == 'ltr' || !specifiedRight))
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
      if(childMarginBox.left < contentBoxInIE.left) {
        childIsOverflow = true;
        contentBoxInIE.left = childMarginBox.left;
      }
      if(childMarginBox.right > contentBoxInIE.right) {
        childIsOverflow = true;
        contentBoxInIE.right = childMarginBox.right;
      }
    }
    if (doVerticalCheck) {
      // The top edge will only be stretch if child node's margin-top is not
      // collapsed with its parent element in IE. In fact, if this happens, the
      // bottom edge will be bigger in IE, but not top edge be smaller.
      if(childMarginBox.top < contentBoxInIE.top) {
        // If margin collapsed in IE, continue.
        if((Math.ceil(contentBoxInChrome.top - childMarginBox.top) ==
                parseInt(childStyle.marginTop)) &&
            parseInt(nodeStyle.paddingTop) == 0 &&
            parseInt(nodeStyle.borderTopWidth) == 0 &&
            !chrome_comp.hasLayoutInIE(node)) {
          continue;
        }
        childIsOverflow = true;
        contentBoxInIE.top = childMarginBox.top;
      }
      if(childMarginBox.bottom > contentBoxInIE.bottom) {
        // If margin collapsed in IE, continue.
        if((Math.ceil(childMarginBox.bottom - contentBoxInChrome.bottom) ==
                parseInt(childStyle.marginBottom)) &&
            parseInt(nodeStyle.paddingBottom) == 0 &&
            parseInt(nodeStyle.borderBottomWidth) == 0 &&
            !chrome_comp.hasLayoutInIE(node)) {
          continue;
        }
        childIsOverflow = true;
        contentBoxInIE.bottom = childMarginBox.bottom;
      }
    }
    if (childIsOverflow)
      affectedElements.push(child);
  }

  if (affectedElements.length == 0)
    return;

  // The first highlight element is the stretched element.
  affectedElements.unshift(node);
  var details = "Content box's size in Chrome: " +
      chrome_comp.util.width(contentBoxInChrome) + ' * ' +
      chrome_comp.util.height(contentBoxInChrome) + ', in IE: ' +
      chrome_comp.util.width(contentBoxInIE) + ' * ' +
      chrome_comp.util.height(contentBoxInIE) + '.';
  this.addProblem('RD1002', {
    nodes: affectedElements,
    details: details
  });
}
); // declareDetector

});
