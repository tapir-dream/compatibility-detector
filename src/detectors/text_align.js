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

function constructor() {
  this.THRESHOLD_OF_CENTER = 5;
  this.THRESHOLD_OF_LEFT = this.THRESHOLD_OF_CENTER;
  this.THRESHOLD_OF_RIGHT = this.THRESHOLD_OF_CENTER;
  var This = this;

  /**
   * Detection center position to be rendered element, four parameters.
   *
   * containerRect.left
   * ^
   * |
   * |<---      containerRect.width     --->|
   * +--------------------------------------+
   * |        *expect render position       |
   * |        childRect.left                |
   * |    |<->|--->child margin<---|<->|    |
   * |    +---+--------------------+---+    |
   * |    |   |<--childRect.width->|   |    |
   * |    |   |                    |   |    |
   * |    +---+--------------------+---+    |
   * +--------------------------------------+
   *
   * If the element is center render, it position is:
   * render position = containerRect.left + (containerRect.width -
   *     (childRect.width + childMarginLeft + childMarginRight) / 2) +
   *     marginLeft;
   *
   * ps: nodeRect.width = node.offsetWidth =
   *     content width + padding width + border width
   *
   * child node actual render position is childRect.left.
   * so comparison the two values, then know whether is
   * the render exact position.
   *
   * @param {containerRect} Containing block rect data.
   * @param {childRect} Child element rect data.
   * @param {childSpecifiedStyle} Child element specified style data.
   * @param {containerComputedStyle} Containing block computed style data.
   * @return {boolean}
   */

  this.isCenterAligned = function(containerRect, childRect,
      childSpecifiedStyle, containerComputedStyle) {
    var actualChildCenterRenderPosition = childRect.left;
    var childMarginLeft = This.parseInt(childSpecifiedStyle.marginLeft);
    var childMarginRight = This.parseInt(childSpecifiedStyle.marginRight);
    var expectChildCenterRenderPosition = containerRect.left +
        Math.floor((containerRect.width - childRect.width -
        childMarginLeft - childMarginRight) / 2) + childMarginLeft;
    return Math.abs(actualChildCenterRenderPosition -
        expectChildCenterRenderPosition) <= This.THRESHOLD_OF_CENTER;
  };

  /**
   * Detection left position to be rendered element, four parameters.
   *
   * containerRect.left
   * ^
   * |  |<--      content width       -->|
   * |<---      containerRect.width     --->|
   * +--------------------------------------+
   * |      *expect render position         |
   * |      childRect.left                  |
   * |  |<->|--->child margin<---|<->|      |
   * |  +---+--------------------+---+      |
   * |  |   |    child node      |   |      |
   * |  |   |                    |   |      |
   * |  +---+--------------------+---+      |
   * +--------------------------------------+
   *
   * If the element is left render, it position is:
   * render position = containerRect.left + borderLeftWidth +
   *     containerPaddingLeft + childMarginLeft;
   *
   * child node actual render position is childRect.left.
   * so comparison the two values, then know whether is
   * the render exact position.
   *
   * @param {containerRect} Containing block rect data.
   * @param {childRect} Child element rect data.
   * @param {childSpecifiedStyle} Child element specified style data.
   * @param {containerComputedStyle} Containing block computed style data.
   * @return {boolean}
   */
  this.isLeftAligned = function(containerRect, childRect,
      childSpecifiedStyle, containerComputedStyle) {
    var containerBorderLeftWidth =
        This.parseInt(containerComputedStyle.borderLeftWidth);
    var containerPaddingLeft =
        This.parseInt(containerComputedStyle.paddingLeft);
    var childMarginLeft = This.parseInt(childSpecifiedStyle.marginLeft);
    var expectChildRightRenderPosition = containerRect.left +
        containerBorderLeftWidth + containerPaddingLeft + childMarginLeft;
    return Math.abs(childRect.left -
        expectChildRightRenderPosition) <= This.THRESHOLD_OF_LEFT;
  };

  /**
   * Detection right position to be rendered element, four parameters.
   *
   *                      containerRect.right
   *                                        ^
   * |  |<--      content width       -->|  |
   * |<---      containerRect.width     --->|
   * +--------------------------------------+
   * |         expect render position*      |
   * |                 childRect.right      |
   * |      |<->|--->child margin<---|<->|  |
   * |      +---+--------------------+---+  |
   * |      |   |    child node      |   |  |
   * |      |   |                    |   |  |
   * |      +---+--------------------+---+  |
   * +--------------------------------------+
   *
   * If the element is right render, it position is:
   * render position = containerRect.right - containerBorderRightWidth -
   *    containerPaddingRight - childMarginRight
   *    containerPaddingLeft + childMarginLeft;
   *
   * child node actual render position is childRect.left.
   * so comparison the two values, then know whether is
   * the render exact position.
   *
   * @param {containerRect} Containing block rect data.
   * @param {childRect} Child element rect data.
   * @param {childSpecifiedStyle} Child element specified style data.
   * @param {containerComputedStyle} Containing block computed style data.
   * @return {boolean}
   */
  this.isRightAligned = function(containerRect, childRect,
      childSpecifiedStyle, containerComputedStyle) {
    var containerWidth = containerRect.width;
    var containerBorderRightWidth =
        This.parseInt(containerComputedStyle.borderRightWidth);
    var containerPaddingRight =
        This.parseInt(containerComputedStyle.paddingRight);
    var childMarginRight = This.parseInt(childSpecifiedStyle.marginRight);
    var actualChildRightRenderPosition = childRect.right;
    var expectChildRightRenderPosition =
        containerRect.right - containerBorderRightWidth -
        containerPaddingRight - childMarginRight;
    return Math.abs(actualChildRightRenderPosition -
        expectChildRightRenderPosition) <= This.THRESHOLD_OF_RIGHT;
  };

  this.checkChild = function (node, isAligned) {
    var containerRect = node.getBoundingClientRect();
    var containerStyle = chrome_comp.getComputedStyle(node);
    var child = node.firstElementChild;
    while (child) {
      var childStyle = chrome_comp.getComputedStyle(child);
      var childSpecifiedStyle = chrome_comp.getSpecifiedValue(child);
      if (child.offsetHeight > 0 &&
          childStyle.innerText != '' &&
          childStyle.display == 'block' &&
          childStyle.float == 'none' &&
          (childStyle.position == 'static' ||
              childStyle.position == 'relative')) {
          var childRect = child.getBoundingClientRect();
          if (!isAligned(containerRect, childRect,
              childSpecifiedStyle, containerStyle)) {
            this.addProblem('RT8003', {
              nodes: [node, child],
              details: 'container width: ' + containerRect.width +
              ', child element width: '+ childRect.width
            });
            return;
          }
      }
      child = child.nextElementSibling;
    }
  };

  /**
   * Native paseInt function extends, one parameter.
   * object null funciton undefined boolean string will be converted to 0.
   * @param {jsValue}
   * @return {number}
   */
  this.parseInt = function(value) {
    if (!value)
      return 0;
    var result = parseInt(value, 10);
    if (isNaN(result))
      return 0;
    return result;
  };
},


function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var style = chrome_comp.getComputedStyle(node);
  var display = style.display;
  var textAlign = style.textAlign;
  var direction = style.direction;
  var BLOCK_DISPLAY_LIST = {
    block: true,
    'inline-block': true,
    'table-cell': true
  };

  if (!(display in BLOCK_DISPLAY_LIST))
    return;

  if (textAlign == 'center') {
    this.checkChild(node, this.isCenterAligned);
    return;
  }

  if (direction == 'ltr' && textAlign == 'right') {
    this.checkChild(node, this.isRightAligned);
    return;
  }

  if (direction == 'rtl' && textAlign == 'left') {
    this.checkChild(node, this.isLeftAligned);
    return;
  }

}
); // declareDetector

});
