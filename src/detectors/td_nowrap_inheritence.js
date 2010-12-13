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

function isNowrapInherited(element) {
  if (chrome_comp.getComputedStyle(element).whiteSpace != 'nowrap')
    return;
  var table = element.offsetParent;
  var tableInlineWhiteSpace = table.style.whiteSpace;
  table.style.whiteSpace = 'pre-line !important';
  var computedWhiteSpace = chrome_comp.getComputedStyle(element).whiteSpace;
  table.style.whiteSpace = null;
  table.style.whiteSpace =
      (tableInlineWhiteSpace) ? tableInlineWhiteSpace : null;
  return computedWhiteSpace == 'pre-line';
}

function isChildrenAffectedByCellsWhiteSpace(element) {
  if (chrome_comp.getComputedStyle(element).whiteSpace != 'nowrap')
    return;
  var inlineWhiteSpace = element.style.whiteSpace;
  var op = element.offsetParent;
  var inlineTableWhiteSpace = op.style.whiteSpace;
  var oldWidth = element.offsetWidth;
  element.style.whiteSpace = 'normal !important';
  op.style.whiteSpace = 'normal !important';
  var newWidth = element.offsetWidth;
  element.style.whiteSpace = null;
  element.style.whiteSpace = (inlineWhiteSpace) ? inlineWhiteSpace : null;
  op.style.whiteSpace = null;
  op.style.whiteSpace = (inlineTableWhiteSpace) ? inlineTableWhiteSpace : null;
  return oldWidth != newWidth;
}

function isAutoWidth(element) {
  if (chrome_comp.getComputedStyle(element).display == 'none')
    return chrome_comp.getComputedStyle(element).width == 'auto';
  var inlineDisplay = element.style.display;
  element.style.display = 'none !important';
  var width = chrome_comp.getComputedStyle(element).width;
  element.style.display = null;
  element.style.display = (inlineDisplay) ? inlineDisplay : null;
  return width == 'auto';
}

chrome_comp.CompDetect.declareDetector(

'td_nowrap_inheritence',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if ((node.tagName != 'TH') && (node.tagName != 'TD'))
    return;

  if (isAutoWidth(node)) {
    if (isNowrapInherited(node)) {
      if (isChildrenAffectedByCellsWhiteSpace(node))
        this.addProblem('RX1003', [node]);
    }
  } else {
    if (chrome_comp.getComputedStyle(node).whiteSpace == 'nowrap') {
      if (isChildrenAffectedByCellsWhiteSpace(node))
        this.addProblem('RX1003', [node]);
    }
  }
}
); // declareDetector

});
