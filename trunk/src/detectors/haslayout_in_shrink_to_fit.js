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
 * @fileoverview Check whether a 'shrink-to-fit' element's width will be
 * stretched by its descendant hasLayout elements.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=67
 *
 * In IE6 IE7(Q) IE8(Q), if an element's width is 'shrink-to-fit', and it has a
 * descendant hasLayout, 'auto' width element (but not inline element, replaced
 * element or table element, and the hasLayout is not triggered by 'overflow'),
 * its width will be stretched. To facilitate description of it, we name that
 * element as 'InfluencingChildElement'. The InfluencingChildElement must not be
 * a floating element or a absolutely positioned element, because these two
 * types of elements' width is not 'auto'.
 * 1. Get a 'shrink-to-fit' width element, and check its child elements if there
 * is a InfluencingChildElement, if has, report problem.
 * 2. If has no such element, get a block-level child elements of it whose width
 * is 'auto', and find if there is a InfluencingChildElement in this element, if
 * so, report a problem.
 * 3. Continue do step 2, until no more element can be check, or problem
 * has been detected.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'haslayout_in_shrink_to_fit',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  /**
   * Get the InfluencingChildElement, if there is not a InfluencingChildElement,
   * return null.
   * @param {Element} element Target element.
   * @return {?Element} The InfluencingChildElement, if not exist, return null.
   */
  this.getInfluencingChildElement = function(element) {
    var children = element.children;

    for (var i = 0, length = children.length; i < length; i++) {
      var child = children[i];

      var computedStyle = chrome_comp.getComputedStyle(child);
      var display = computedStyle.display;
      var position = computedStyle.position;
      var float = computedStyle.float;
      if (display == 'none' || position == 'absolute' || position == 'fixed')
        float = 'none';

      if (display.indexOf('inline') > -1 ||
          chrome_comp.isReplacedElement(child) ||
          chrome_comp.isTableElement(child))
        continue;

      var widthIsSpedified =
          !chrome_comp.isAutoOrNull(chrome_comp.getSpecifiedStyleValue(child,
          'width'));
      var heightIsSpedified =
          !chrome_comp.isAutoOrNull(chrome_comp.getSpecifiedStyleValue(child,
          'height'));
      var zoomIsSpedified =
          chrome_comp.getSpecifiedStyleValue(child, 'zoom') != null;
      var floatIsSpedified = float != 'none';

      // If one of 'width' and 'float' is specified, the problem will not occur.
      if (widthIsSpedified || floatIsSpedified)
        continue;

      // The property 'height' or 'zoom' is specified is a necessary condition.
      if (heightIsSpedified || zoomIsSpedified)
        return child;

      // The element's width is 'auto' now, and the element itself has no
      // problem, then check its children.
      // If there is a InfluencingChildElement in its children, its width will
      // be stretched, and its ancestor 'shrink-to-fit' width element's width
      // will be stretched too.
      var influencingChildElement = this.getInfluencingChildElement(child);
      if (influencingChildElement)
        return influencingChildElement;
    }

    return null;
  };
}, // constructor

function checkNode(node, context) {
  if (context.isDisplayNone() || chrome_comp.isReplacedElement(node) ||
      chrome_comp.isTableElement(node) || !chrome_comp.isShrinkToFit(node))
    return;

  // Check whether the 'shrink-to-fit' width element has a bigger available
  // horizontal space.
  var nodeMarginBox =
      chrome_comp.getLayoutBoxes(node).marginBox;
  var containerContentBox =
      chrome_comp.getLayoutBoxes(
          chrome_comp.getContainingBlock(node)).contentBox;
  if (nodeMarginBox.right >= containerContentBox.right)
    return;

  // Get the InfluencingChildElement in node, if find one, report problem.
  var influencingChildElement = this.getInfluencingChildElement(node);
  if (influencingChildElement) {
    var details = 'The width of\n' +
        chrome_comp.ellipsize(influencingChildElement.outerHTML, 60) +
        '\nis not specified, that will make the width of\n' +
        chrome_comp.ellipsize(node.outerHTML, 60) +
        '\nbe stretched in IE6 IE7(Q) IE8(Q).';
    this.addProblem('RD8023', {
      nodes: [node, influencingChildElement],
      severityLevel: 1,
      details: details
    });
  }
}
); // declareDetector

});
