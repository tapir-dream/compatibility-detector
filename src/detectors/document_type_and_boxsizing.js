/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Check the real document mode in IE and WebKit browsers, and
 * the box which the 'width' and 'height' properties apply.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=57
 *
 * The comment or XML declaration before DTD will make the DTD be invalid in IE
 * so that the HTML document will be in quirks mode in IE. We must get the real
 * document mode in IE and WebKit first, and save this state because it is
 * useful in checkNode function. To improve the performance, the said steps have
 * to execute in the constructor function. Note that there are several strange
 * DTDs that have the document mode in IE and non-IE browser be different. We
 * must consider them.
 * Check the box which the 'width' and 'height' properties apply for all kinds
 * of elements according to the root cause article RD8001 (refer to
 * http://www.w3help.org/zh-cn/causes/RD8001).
 * We also must notice the -webkit-box-sizing property the author uses.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'document_type_and_boxsizing',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  var THRESHOLD = 10;
  // Save some important values for detecting each node here.
  this.doctypeInIE = chrome_comp.documentMode.IE;
  this.doctypeInWebKit = chrome_comp.documentMode.WebKit;

  // There is no difference in Standards Mode. We can not detect RD8001 issue
  // If the document mode is undefined in IE. More information about RD8001,
  // please refer to:
  // http://www.w3help.org/zh-cn/causes/RD8001
  // About IE box model bug:
  //  IE Quirks Mode: border-box                Others: content-box
  //
  //                                     ---------------------------------
  //                                     |            margin             |
  //                                     | ----------------------------- |
  //                                     | |          border           | |
  //   -------------------------         | | ------------------------- | |
  //   |        margin         |         | | |        padding        | | |
  //   | --------------------- |  -----  | | | --------------------- | | |
  //   | |      border       | |    |    | | | |      content      | | | |
  //   | | ----------------- | |    |    | | | |                   | | | |
  //   | | |    padding    | | |    2    | | | |                   | | | |
  //   | | | ------------- | | |    0    | | | |                   | | | |
  //   | | | |  content  | | | |    0    | | | |                   | | | |
  //   | | | |           | | | |    p    | | | |                   | | | |
  //   | | | |           | | | |    x    | | | |                   | | | |
  //   | | | ------------- | | |    |    | | | |                   | | | |
  //   | | ----------------- | |    |    | | | |<======150px======>| | | |
  //   | --------------------- |  -----  | | | --------------------- | | |
  //   | |<======150px======>| |         | | ------------------------- | |
  //   -------------------------         | ----------------------------- |
  //                                     ---------------------------------
  // IE box model bug is a software bug in the implementation of CSS in earlier
  // versions of IE. IE6 and newer are not affected in their Standards Mode,
  // but for compatibility reasons, the bug is still present when a page is
  // rendered in Quirks Mode. If doctypeInIE is undefined, in this case, we are
  // not sure that IE is rendering in quirks mode. So ignore it.
  // More information refer to:
  // http://en.wikipedia.org/wiki/Internet_Explorer_box_model_bug
  this.isIEInQuirksMode = this.doctypeInIE && !(this.doctypeInIE == 'S' &&
      this.doctypeInWebKit == 'S');

  this.reportProblem = function(difference, node, details) {
    if (difference >= THRESHOLD)
      this.addProblem('RD8001', {
        nodes: [node],
        details: details
      });
  }

  this.hasHorizontalBorder = function(style) {
    var borderRight = parseInt(style.borderRightWidth, 10);
    var borderLeft = parseInt(style.borderLeftWidth, 10);
    return borderRight || borderLeft;
  }

  this.hasVerticalBorder = function(style) {
    var borderTop = parseInt(style.borderTopWidth, 10);
    var borderBottom = parseInt(style.borderBottomWidth, 10);
    return borderTop || borderBottom;
  }

  this.hasHorizontalPadding = function(style) {
    var paddingRight = parseInt(style.paddingRight, 10);
    var paddingLeft = parseInt(style.paddingLeft, 10);
    return paddingRight || paddingLeft;
  }

  this.hasVerticalPadding = function(style) {
    var paddingTop = parseInt(style.paddingTop, 10);
    var paddingBottom = parseInt(style.paddingBottom, 10);
    return paddingTop || paddingBottom;
  }

  /**
   * Do not consider the non-replaced inline elements, table elements and the
   * invisible elements, because:
   * 1. The 'width' and 'height' can not apply to the non-replaced inline
   *    elements, table rows, and row groups. Refer to:
   *    http://www.w3.org/TR/CSS21/visudet.html#the-width-property
   * 2. The visual layout of table contents is different from the visual layout
   *    of others. It has the particular width and height algorithms. We need to
   *    detect the table elements separately. Refer to:
   *    http://www.w3.org/TR/CSS21/tables.html#table-layout
   * 3. Since a display of 'none' causes an element to not appear, its
   *    descentant elements do not generate any boxes either, so for these
   *    elements, we do not need to detect. Refer to:
   *    http://www.w3.org/TR/CSS21/visuren.html#display-prop
   */
  this.isBlockOrReplacedElement = function(style, element) {
    var display = style.display;
    if ((display == 'inline' && !chrome_comp.isReplacedElement(element)) ||
        display == 'none' || chrome_comp.isTableElement(element))
      return false;
    return true;
  }

  /**
   * Some authors may use CSS3 box-sizing property to make the values of width
   * and height apply on border box in WebKit browsers. So we must ignore this
   * situation. We should also consider -webkit-box-sizing property for the
   * older Chrome.
   */
  this.isBoxSizingOnBorderBox = function(styleObject) {
    var boxSizing = styleObject.boxSizing;
    var webkitBoxSizing = styleObject.webkitBoxSizing;
    if (boxSizing == 'border-box' || webkitBoxSizing == 'border-box')
      return true;
    return false;
  }

  /**
   * The 'auto' width and height do not have this compatibility issue. Since IE
   * in Quirks Mode includes the content, padding and borders within a specified
   * width or height, if an element does not have the horizontal padding and
   * borders, in other words, the horizontal content box and border box are
   * overlaps, and the same on vertical.
   */
  this.hasPaddingOrBorderWithNonAutoWidthAndHeight = function(computedStyle,
      specifiedWidth, specifiedHeight) {
    if (!specifiedWidth ||
        !specifiedHeight ||
        chrome_comp.isAutoOrNull(specifiedWidth) ||
        chrome_comp.isAutoOrNull(specifiedHeight))
      return false;
    var hasHorizontalProblem = this.hasHorizontalPadding(computedStyle) ||
        this.hasHorizontalBorder(computedStyle);
    var hasVerticalProblem = this.hasVerticalPadding(computedStyle) ||
        this.hasVerticalBorder(computedStyle);
    if (hasHorizontalProblem || hasVerticalProblem)
      return true;
    // TODO: Do consider the container stretched by its children when IE is
    // Quirks Mode.
    return false;
  }

},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var tagName = node.tagName;

  // Only check when IE is Quirks Mode.
  if (!this.isIEInQuirksMode)
    return;

  var specifiedWidth = chrome_comp.getSpecifiedStyleValue(node, 'width');
  var specifiedHeight = chrome_comp.getSpecifiedStyleValue(node, 'height');
  var computedStyle = chrome_comp.getComputedStyle(node);

  // The 'width' and 'height' of images apply on the content box in all
  // browsers. In following cases, there are no differences.
  if (tagName == 'IMG')
    return;

  // Only check the block or replaced element.
  if (!this.isBlockOrReplacedElement(computedStyle, node))
    return;
  if (!this.hasPaddingOrBorderWithNonAutoWidthAndHeight(computedStyle,
      specifiedWidth, specifiedHeight))
    return;

  var details = '{ width: ' + specifiedWidth +
      ';\n    border-left-width: ' + computedStyle.borderLeftWidth +
      ';\n    padding-left: ' + computedStyle.paddingLeft +
      ';\n    padding-right: ' + computedStyle.paddingRight +
      ';\n    border-right-width: ' + computedStyle.borderRightWidth + ';\n' +
      'height: ' + specifiedHeight +
      ';\n    border-top-width: ' + computedStyle.borderTopWidth +
      ';\n    padding-top: ' + computedStyle.paddingTop +
      ';\n    padding-bottom: ' + computedStyle.paddingBottom +
      ';\n    border-bottom-width: ' + computedStyle.borderBottomWidth + '; }';

  // Check If the iframe has padding because the 'width' and 'height' of the
  // IFRAME elements apply on padding box when IE is Quirks Mode.
  if (tagName == 'IFRAME') {
    if (this.hasHorizontalPadding(computedStyle) ||
        this.hasVerticalPadding(computedStyle))
      this.addProblem('RD8001', {
        nodes: [node],
        details: details
      });
    return;
  }

  if (this.isBoxSizingOnBorderBox(computedStyle))
    return;

  // Here the node's 'box-sizing' in WebKit is content box.
  var layoutBoxes = chrome_comp.getLayoutBoxes(node);
  var differeceInHorizontal =
      (layoutBoxes.borderBox.right - layoutBoxes.borderBox.left) -
      (layoutBoxes.contentBox.right - layoutBoxes.contentBox.left);
  var differeceInVertical =
      (layoutBoxes.borderBox.bottom - layoutBoxes.borderBox.top) -
      (layoutBoxes.contentBox.bottom - layoutBoxes.contentBox.top);
  var difference = Math.max(differeceInHorizontal, differeceInVertical);
  if (!chrome_comp.isReplacedElement(node)) {
    this.reportProblem(difference, node, details);
  } else {
    if (tagName == 'OBJECT' || tagName == 'EMBED') {
      // The OBJECT and EMBED are quite strange, the 'width' and 'height' apply
      // to border-box subtracting the scrollbar's size. So If there are OBJECT
      // and EMBED set 'width' or 'height' and borders or padding, we may report
      // this issue.
      this.reportProblem(difference, node, details);
    } else {
      // For other replaced elements, we may report the issue when Chrome is
      // Standards Mode and '-webkit-box-sizing:content-box', because the
      // 'width' and 'height' apply to border-box for these elements in IE's
      // Quirks Mode.
      if (this.doctypeInWebKit == 'S') {
        this.reportProblem(difference, node, details);
      }
    }
  }
}
); // declareDetector

});