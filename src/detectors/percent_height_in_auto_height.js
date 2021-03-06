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

addScriptToInject(function() {

function getRealComputedHeight(element) {
  var x = element.cloneNode(false);
  x.style.display = 'none !important';
  var parent = element.parentElement;
  if (!parent)
    return;
  if (parent.lastElementChild === element)
    parent.appendChild(x);
  else
    parent.insertBefore(x, element);
  var height = chrome_comp.getComputedStyle(x).height;
  parent.removeChild(x);
  x = null;
  return height;
}

function isPercentageHeight(height) {
  return height.slice(-1) == '%';
}

function isTable(element) {
  return chrome_comp.getComputedStyle(element).display == 'table';
}

function isBlockFormattingContext(element) {
  var style = chrome_comp.getComputedStyle(element);
  var display = style.display;
  var cssFloat = style.float;
  var position = style.position;
  var overflow = style.overflow;
  var overflowX = style.overflowX;
  var overflowY = style.overflowY;
  return (display == 'inline-block') || (display == 'table') ||
    (display == 'table-cell') || (display == 'table-caption') ||
    (position == 'absolute') || (position == 'fixed') ||
    (overflow != 'visible') || (overflowX != 'visible') ||
    (overflowY != 'visible');
}

function getContainingBlock(element) {
  var position = chrome_comp.getComputedStyle(element).position;
  if (element == document.documentElement)
    return null;
  if (position == 'fixed')
    return null;
  if (position == 'absolute')
    return element.offsetParent;
  var nod = element;
  while (nod) {
    if (nod == document.body) return document.documentElement;
    if (nod.parentNode) nod = nod.parentNode;
    if (chrome_comp.getComputedStyle(nod).display ==
        'block' || isBlockFormattingContext(nod)) {
      return nod;
    }
  }
  return null;
}

chrome_comp.CompDetect.declareDetector(

'percent_height_in_auto_height',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      // Firefox Standard mode RE8010 issue is ignored.
      !chrome_comp.inQuirksMode())
    return;

  if (node.tagName == 'SCRIPT')
    return;

  var realHeight = getRealComputedHeight(node);
  if (realHeight == undefined)
    return;
  if (!isPercentageHeight(realHeight))
    return;
  var cb = getContainingBlock(node);
  if (!cb)
    return;
  while (cb) {
    if (realHeight != 'auto' && cb.tagName != 'BODY')
      return;
    if (cb.tagName == 'BODY' && realHeight == 'auto')
      return;
    cb = getContainingBlock(cb);
  }
alert(444);
  var oldHeight = parseInt(chrome_comp.getComputedStyle(node).height);
  var inlineHeight = node.style.height;
  node.style.height = 'auto !important';
  var newHeight = parseInt(chrome_comp.getComputedStyle(node).height);
  node.style.height = null;
  node.style.height = (inlineHeight) ? inlineHeight : null;
  if (oldHeight != newHeight)
    this.addProblem(isTable(node) ? 'RE8010' : 'RD8026', [node]);
}
); // declareDetector

});
