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
 * @fileoverview Check if there is percentage width's element in the
 * containing block being using shrink-to-fit width.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=6
 *
 * In CSS2.1 specification, a floating or absolutely positioned or the inline
 * block element will use the shrink-to-fit width if its 'width' is computed as
 * 'auto'. Calculation of the shrink-to-fit width will refer to its contents,
 * and if it contains the children elements setting percentage width, the result
 * is not defined in the specification explicitly. Thus, each browser will
 * render differently, and this issue also involves the almost standards mode.
 *
 * We check the elements using shrink-to-fit width, ignoring the replaced
 * elements and the root element.
 * Determine the element using available width as its shrink-to-fit width, we
 * must ignore such elements because there is no difference in this case.
 * Then get all percentage width descendants. if the length of the result is
 * larger than 0, we continue.
 * Ignore the absolutely positioned and invisible elements, then record the
 * offset width of present descendant, setting its width property to 'auto',
 * and record the new offset width. If the new value is different from the old
 * one, we consider that there may have the compatibility issue.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'shrink_to_fit_percentage_child',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  this.isInlineElement = function(element) {
    return chrome_comp.getComputedStyle(element).display == 'inline';
  }

  /**
   * Determine if an element whose width is shrink-to-fit is using the
   * containing block's available width. About shrink-to-fit refer to
   * http://www.w3.org/TR/CSS21/visudet.html#shrink-to-fit-float
   * @param {Node} element the DOM node to test.
   * @return {boolean} true if using available width.
   */
  this.isUsingAvailableWidth = function(element) {
    // Cache the original width and the inline position style of the element.
    var width = element.offsetWidth;
    var inlinePositionValue = element.style.getPropertyValue('position');
    var inlinePositionPriority = element.style.getPropertyPriority('position');
    // The fixed positioned element's width is also shrink-to-fit, and its
    // available width is the viewport's width. So offsetWidth looks like the
    // preferred width now.
    element.style.setProperty('position', 'fixed', 'important');
    var preferredWidth = element.offsetWidth;
    // Restore the inline position style of the element.
    element.style.removeProperty('position');
    if (inlinePositionValue) {
      element.style.setProperty('position', inlinePositionValue,
          inlinePositionPriority);
    }
    // width is the original width of the element in the layout.
    // preferredWidth is the width of the element when there is no any other
    // element to astrict it in the horizontal direction.
    // So if preferredWidth is larger than width, it means that the element's
    // shrink-to-fit width is using the containing block's available width.
    return preferredWidth > width;
  }

  this.isPercentageWidthAndNotOneHundredPercent = function(width) {
    return width.slice(-1) == '%' && width != '100%';
  }

  /**
   * Get the visible children elements whose width are percentage unit.
   * @param {Node} element the DOM node to test.
   * @return {Array} the array including visible percentage width child element.
   */
  this.getAllPercentageWidthDescendant = function(element) {
    var children = element.children;
    var descendantList = [];
    for (var i = 0, j = children.length; i < j; ++i) {
      if (!chrome_comp.isElementTrulyDisplayable(children[i]))
        continue;
      var width = chrome_comp.getSpecifiedStyleValue(children[i], 'width');
      if (chrome_comp.isAutoOrNull(width) &&
          !chrome_comp.isShrinkToFit(children[i]) &&
          !chrome_comp.hasLayoutInIE(children[i]) &&
          chrome_comp.getComputedStyle(children[i]).display == 'block') {
        descendantList = descendantList.concat(
            this.getAllPercentageWidthDescendant(children[i]));
      }
      if (!width)
        continue;
      if (this.isPercentageWidthAndNotOneHundredPercent(width)) {
        descendantList.push(children[i]);
      }
    }
    return descendantList;
  }

},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var tagName = node.tagName;
  var SKIPPING_ELEMENT_LIST = {
    HTML: true,
    BODY: true,
    MARQUEE: true
  };
  if (tagName in SKIPPING_ELEMENT_LIST)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;
  if (chrome_comp.isTableElement(node))
    return;
  if (this.isInlineElement(node))
    return;
  if (!chrome_comp.isShrinkToFit(node))
    return;
  if (this.isUsingAvailableWidth(node))
    return;

  var descendantList = this.getAllPercentageWidthDescendant(node);
  if (descendantList.length < 1)
    return;
  for (var i = 0, j = descendantList.length; i < j; i++) {
    var style = chrome_comp.getComputedStyle(descendantList[i]);
    // Do not check the absolutely positioned element.
    if (style.position == 'fixed' || style.position == 'absolute')
      continue;
    // Do not check the invisible element.
    if (descendantList[i].offsetWidth == 0 ||
        descendantList[i].offsetHeight == 0)
      continue;
    // Cache the original width of the current descendant child element and its
    // inline width style.
    var oldWidth = descendantList[i].offsetWidth;
    var inlineWidthValue = descendantList[i].style.getPropertyValue('width');
    var inlineWidthPriority =
        descendantList[i].style.getPropertyPriority('width');
    // In this case, IE8(S) and other non-IE browsers will treat the percentage
    // width as 'auto' first, and after calculating the available width of its
    // shrink-to-fit containing block, then calculating the computed width
    // according to.its percentage width and the containing block's available
    // width.
    descendantList[i].style.setProperty('width', 'auto', 'important');
    var newWidth = descendantList[i].offsetWidth;
    // Restore the inline width style.
    descendantList[i].style.removeProperty('width');
    if (inlineWidthValue)
      descendantList[i].style.setProperty('width', inlineWidthValue,
          inlineWidthPriority);
    // If we set 'width' to 'auto' and there is no difference between the
    // old offsetWidth and the new offsetWidth, we consider that there is no
    // compatibility issue.
    if (oldWidth != newWidth) {
      var details = node.tagName +
          ((node.id) ? '[id="' + node.id + '"]' : '') +
          ((node.className) ? '[class="' + node.className + '"]' : '') +
          ' ---> ' + descendantList[i].tagName + ' { width: ' +
          chrome_comp.getSpecifiedStyleValue(descendantList[i], 'width') + ' }';
      this.addProblem('RX8017', {
        nodes: [descendantList[i], node],
        details: details
      });
    }
  }
}
); // declareDetector

});
