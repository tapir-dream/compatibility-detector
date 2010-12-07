/*
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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'shrink_to_fit_percentage_child',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {

  function isAutoWidth(element) {
    var inlineDisplay = element.style.display;
    element.style.display = 'none !important';
    var width = chrome_comp.getComputedStyle(element).width;
    element.style.display = null;
    element.style.display = (inlineDisplay) ? inlineDisplay : null;
    return width == 'auto';
  }

  function isShrinkToFit(element) {
    if (!isAutoWidth(element))
      return false;
    var style = chrome_comp.getComputedStyle(element);
    if ((style.float == 'none') && (style.display != 'inline-block') &&
        (style.position == 'static' || style.position == 'relative'))
      return false;
    return true;
  }

  function isPercentageWidth(element) {
    var inlineDisplay = element.style.display;
    element.style.display = 'none !important';
    var width = chrome_comp.getComputedStyle(element).width;
    element.style.display = null;
    element.style.display = (inlineDisplay) ? inlineDisplay : null;
    return width.slice(-1) == '%';
  }

  function getAllPercentageWidthDescendant(element) {
    var ch = element.children;
    var desceList = [];
    for (var i = 0, j = ch.length; i < j; i++) {
      if (!chrome_comp.isElementTrulyDisplayable(ch[i]))
        continue;
      if (isPercentageWidth(ch[i]))
        desceList.push(ch[i]);
    }
    return desceList;
  }

  function isUsingAvailableWidth(element) {
    var width = element.offsetWidth;
    var inlinePosition = element.style.position;
    element.style.position = 'fixed !important';
    var preferredWidth = element.offsetWidth;
    element.style.position = null;
    element.style.position = (inlinePosition) ? inlinePosition : null;
    //console.log(width+','+preferredWidth);
    return preferredWidth > width;
  }

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (!isShrinkToFit(node))
    return;

  if (node.tagName == 'MARQUEE')
    return;
  if (chrome_comp.isReplacedElement(node))
    return;

  if (isUsingAvailableWidth(node))
    return;

  var descendantList = getAllPercentageWidthDescendant(node);
  if (descendantList.length < 1)
    return;

  for (var i = 0, j = descendantList.length; i < j; i++) {
    var style = chrome_comp.getComputedStyle(descendantList[i]);
    if (style.display == 'inline')
      continue;
    var position = style.position;
    if (position == 'fixed' || position == 'absolute')
      continue;
    //var oldWidth = chrome_comp.getComputedStyle(descendantList[i]).width;
    var oldWidth = descendantList[i].offsetWidth;
    var inlineWidth = descendantList[i].style.width;
    descendantList[i].style.width = 'auto !important';
    //var newWidth = chrome_comp.getComputedStyle(descendantList[i]).width;
    var newWidth = descendantList[i].offsetWidth;
    descendantList[i].style.width = null;
    descendantList[i].style.width = (inlineWidth) ? inlineWidth : null;
    //console.log(newWidth+','+oldWidth);
    if (oldWidth != newWidth && oldWidth && newWidth) {
      //if (descendantList[i].offsetWidth && descendantList[i].offsetHeight)
      //if (!isUsingAvailableWidth(node))
        this.addProblem('RX8017', [descendantList[i]]);
    }
  }
}
); // declareDetector

});
