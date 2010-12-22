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
 
// One detector implementation for checking the elements of the 
// percentage width in the element using shrink-to-fit width.
// @author : luyuan.china@gmail.com
// @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=6
//
// In CSS2.1 specification, a floating or absolutely positioned or the inline
// block element will use the shrink-to-fit width if its 'width' is computed as
// 'auto'. Calculation of the shrink-to-fit width will refer to its contents,
// and if it contains the children elements setting percentage width, the result
// is not defined in the specification explicitly. Thus, each browser will
// render differently, and this issue also involves the almost standards mode.
//
// We check the elements using shrink-to-fit width, ignoring the replaced
// elements and the root element.
// Determine the element using available width as its shrink-to-fit width, we
// must ignore such elements because there is no difference in this case.
// Then get all percentage width descendants. if the length of the result is
// larger than 0, we continue.
// Ignore the absolutely positioned and invisible elements, then record the
// offset width of present descendant, setting its width property to 'auto',
// and record the new offset width. If the new value is different from the old
// one, we consider that there may have the compatibility issue.


addScriptToInject(function() {

function getRealComputedWidth(element) {
  var x = element.cloneNode(false);
  x.style.display = 'none !important';
  element.parentElement.appendChild(x);
  var width = chrome_comp.getComputedStyle(x).width;
  element.parentElement.removeChild(x);
  x = null;
  return width;
}

function isShrinkToFit(element) {
  var style = chrome_comp.getComputedStyle(element);
  if ((style.float == 'none') && (style.display != 'inline-block') &&
      (style.position == 'static' || style.position == 'relative'))
    return false;
  if (getRealComputedWidth(element) == 'auto')
    return true;
}

function isPercentageWidth(element) {
  var width = getRealComputedWidth(element)
  return width.slice(-1) == '%' && width != '100%';
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
  return preferredWidth > width;
}

function isVisible(element) {
  return element.offsetWidth && element.offsetHeight;
}

chrome_comp.CompDetect.declareDetector(

'shrink_to_fit_percentage_child',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName == 'MARQUEE' || node.tagName == 'HTML')
    return;
  
  if (!isShrinkToFit(node))
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
    var display = style.display;
    var cFloat = style['float'];
    var position = style.position;
    if (position == 'fixed' || position == 'absolute')
      continue;
    if (!isVisible(descendantList[i]))
      continue;
    var oldWidth = descendantList[i].offsetWidth;
    var inlineWidth = descendantList[i].style.width;
    descendantList[i].style.width = 'auto !important';
    var newWidth = descendantList[i].offsetWidth;
    descendantList[i].style.width = null;
    descendantList[i].style.width = (inlineWidth) ? inlineWidth : null;
    if (oldWidth != newWidth && oldWidth && newWidth) {
      this.addProblem('RX8017', [descendantList[i]]);
    }
  }
}
); // declareDetector

});
