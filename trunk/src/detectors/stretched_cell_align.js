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

function getRealComputedWidth(element) {
  var inlineDisplay = element.style.display;
  element.style.display = 'none !important';
  var width = chrome_comp.getComputedStyle(element).width;
  element.style.display = null;
  element.style.display = (inlineDisplay) ? inlineDisplay : null;
  return width;
}

function isStretched(element) {
  var table = element.offsetParent;
  var inlineWidth = table.style.width;
  var oldWidth = element.offsetWidth;
  table.style.width = '0px !important';
  var newWidth = element.offsetWidth;
  table.style.width = null;
  table.style.width = (inlineWidth) ? inlineWidth : null;
  return oldWidth == newWidth;
}

function isPercentageWidth(element) {
  var inlineDisplay = element.style.display;
  element.style.display = 'none !important';
  var width = chrome_comp.getComputedStyle(element).width;
  element.style.display = null;
  element.style.display = (inlineDisplay) ? inlineDisplay : null;
  return width.slice(-1) == '%';
}

function hasBackground(element) {
  var style = chrome_comp.getComputedStyle(element);
  if ((!style.backgroundColor || style.backgroundColor == 'transparent' ||
      style.backgroundColor == chrome_comp.COLOR_TRANSPARENT) &&
      (!style.backgroundImage || style.backgroundImage == 'none'))
    return false;
  return true;
}

chrome_comp.CompDetect.declareDetector(

'stretched_cell_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

 if (node.tagName != 'TD' && node.tagName != 'TH')
    return;

  if (getRealComputedWidth(node) == 'auto')
    return;

  if (isPercentageWidth(node))
    return;

  var usedWidth = parseInt(chrome_comp.getComputedStyle(node).width, 10);
  var computedWidth = parseInt(getRealComputedWidth(node), 10);
  var textAlign = chrome_comp.getComputedStyle(node).textAlign;
  if ((usedWidth < computedWidth))
    return;
  if ((textAlign.indexOf('left') != -1) && !hasBackground(node))
    return;

  if (!isStretched(node) || (hasBackground(node)))
    this.addProblem('RE8014', [node]);
}
); // declareDetector

});
