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
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=56
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

function hasHorizontalBorder(element) {
  var style = chrome_comp.getComputedStyle(element);
  var borderRight = parseInt(style.borderRightWidth, 10);
  var borderLeft = parseInt(style.borderLeftWidth, 10);
  return borderRight || borderLeft;
}

function hasVerticalBorder(element) {
  var style = chrome_comp.getComputedStyle(element);
  var borderTop = parseInt(style.borderTopWidth, 10);
  var borderBottom = parseInt(style.borderBottomWidth, 10);
  return borderTop || borderBottom;
}

function hasHorizontalPadding(element) {
  var style = chrome_comp.getComputedStyle(element);
  var paddingRight = parseInt(style.paddingRight, 10);
  var paddingLeft = parseInt(style.paddingLeft, 10);
  return paddingRight || paddingLeft;
}

function hasVerticalPadding(element) {
  var style = chrome_comp.getComputedStyle(element);
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
function isBlockOrReplacedElement(styleObject, element) {
  if (!styleObject || typeof styleObject != 'object')
    return false;
  var display = styleObject.display;
  if (!display)
    return false;
  if ((display == 'inline' && !chrome_comp.isReplacedElement(element)) ||
      display == 'none' || chrome_comp.isTableElement(element))
    return false;
  return true;
}

/**
 * The 'auto' width and height do not have this compatibility issue. Since IE
 * in Quirks Mode includes the content, padding and borders within a specified
 * width or height, if an element does not have the horizontal padding and
 * borders, in other words, the horizontal content box and border box are
 * overlaps, and the same on vertical.
 */
function hasPaddingOrBorderWithNonAutoWidthAndHeight(styleObject, element) {
  if (!styleObject || typeof styleObject != 'object')
    return false;
  var width = styleObject.width;
  var height = styleObject.height;
  if (!width || !height)
    return false;
  var hasHorizontalProblem = width != 'auto' &&
      (hasHorizontalPadding(element) || hasHorizontalBorder(element));
  var hasVerticalProblem = height != 'auto' &&
      (hasVerticalPadding(element) || hasVerticalBorder(element));
  if (hasHorizontalProblem || hasVerticalProblem)
    return true;
  // TODO: Do consider the container stretched by its children when IE is Quirks
  // Mode.
  return false;
}

/**
 * Check If the iframe has padding because the 'width' and 'height' of the
 * IFRAME elements apply on padding box when IE is Quirks Mode.
 * @param {object} element the DOM element to test
 * @return {object} an object storing if the element is an iframe element and
 *     has padding.
 */
function checkPaddingOnIframe(element) {
  var result = {isIframe: false, hasPadding: false};
  if (element.tagName != 'IFRAME')
    return result;
  result.isIframe = true;
  result.hasPadding = hasHorizontalPadding(element) ||
      hasVerticalPadding(element);
  return result;
}

/**
 * Some authors may use CSS3 box-sizing property to make the values of width and
 * height apply on border box in WebKit browsers. So we must ignore this
 * situation. We should also consider -webkit-box-sizing property for the older
 * Chrome.
 */
function isBoxSizingOnBorderBox(element) {
  var boxSizing = chrome_comp.getComputedStyle(element).boxSizing;
  var webkitBoxSizing = chrome_comp.getComputedStyle(element).webkitBoxSizing;
  if (boxSizing == 'border-box' || webkitBoxSizing == 'border-box')
    return true;
  return false;
}

chrome_comp.CompDetect.declareDetector(

'document_type_and_boxsizing',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  // Save some important values for detecting each node here.
  this.doctypeInIE = chrome_comp.documentMode.IE;
  this.doctypeInWebKit = chrome_comp.documentMode.WebKit;

  // Detect HG8001 issue. More information about the DTD, please refer to the
  // documentMode part in framework_shared.js.
  if (chrome_comp.documentMode.hasCommentBeforeDTD)
    this.addProblem('HG8001');

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
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var tagName = node.tagName;

  // Only check when IE is Quirks Mode.
  if (!this.isIEInQuirksMode)
    return;

  var specifiedValue = chrome_comp.getSpecifiedValue(node);

  // The 'width' and 'height' of images apply on the content box in all
  // browsers. In following cases, there are no differences.
  if (tagName == 'IMG')
    return;

  if (!isBlockOrReplacedElement(specifiedValue, node))
    return;
  if (!hasPaddingOrBorderWithNonAutoWidthAndHeight(specifiedValue, node))
    return;

  var details = '{width: ' + specifiedValue.width +
      ';\n border-left-width: ' + specifiedValue.borderLeftWidth +
      ';\n padding-left: ' + specifiedValue.paddingLeft +
      ';\n padding-right: ' + specifiedValue.paddingRight +
      ';\n border-right-width: ' + specifiedValue.borderRightWidth + ';\n\n' +
      'height: ' + specifiedValue.height +
      ';\n border-top-width: ' + specifiedValue.borderTopWidth +
      ';\n padding-top: ' + specifiedValue.paddingTop +
      ';\n padding-bottom: ' + specifiedValue.paddingBottom +
      ';\n border-bottom-width: ' + specifiedValue.borderBottomWidth + ';}';

  var iframePadding = checkPaddingOnIframe(node);
  if (iframePadding.isIframe) {
    if (iframePadding.hasPadding)
      this.addProblem('RD8001', {nodes: [node], details: details});
    return;
  }

  if (isBoxSizingOnBorderBox(node))
    return;

  // Here the node's 'box-sizing' in WebKit is content box.
  if (!chrome_comp.isReplacedElement(node)) {
    this.addProblem('RD8001', {nodes: [node], details: details});
  } else {
    // the OBJECT and EMBED are quite stange, the 'width' and 'height' apply to
    // border-box subtracting the scrollbar's size. So If there are OBJECT and
    // EMBED set 'width' or 'height' and borders or padding, we should report
    // this issue.
    if (tagName == 'OBJECT' || tagName == 'EMBED') {
      this.addProblem('RD8001', {nodes: [node], details: details});
    } else {
      // For other replaced elements, we report the issue when Chrome is
      // Standards Mode and '-webkit-box-sizing:content-box', because the
      // 'width' and 'height' apply to border-box for these elements in IE's
      // Quirks Mode.
      if (this.doctypeInWebKit == 'S')
        this.addProblem('RD8001', {nodes: [node], details: details});
    }
  }
}
); // declareDetector

});