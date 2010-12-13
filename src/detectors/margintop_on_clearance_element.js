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

'margin_top_on_clearance_element',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function getContainingBlock(nodeEl) {
    var position = window.chrome_comp.getComputedStyle(nodeEl).position;
    if (nodeEl == document.documentElement || position == 'fixed')
      return null;
    if (position == 'absolute')
      return nodeEl.offsetParent;
    var nod = nodeEl;
    while (nod) {
      if (nod == document.body)
        return document.documentElement;
      if (nod.parentNode)
        nod = nod.parentNode;
      if (window.chrome_comp.getComputedStyle(nod).display == 'block' ||
          window.chrome_comp.getComputedStyle(nod).display == 'list-item' ||
          isBlockFormattingContext(nod))
        return nod;
    }
    return null;
  }

  function isBlockFormattingContext(nodeEl) {
    var computedStyle = window.chrome_comp.getComputedStyle(nodeEl);
    var display = computedStyle.display;
    var cssFloat = computedStyle.float;
    var position = computedStyle.position;
    var overflow = computedStyle.overflow;
    var overflowX = computedStyle.overflowX;
    var overflowY = computedStyle.overflowY;
    return (display == 'inline-block') || (display == 'table') ||
           (display == 'table-cell') || (display == 'table-caption') ||
           (position == 'absolute') || (position == 'fixed') ||
           (overflow != 'visible') || (overflowX != 'visible') ||
           (overflowY != 'visible');
  }

  function getBoundaryClearanceSpacing(nodeEl, start, protection) {
    var oldTop;
    var newTop
    var computedMarginTop =
      parseInt(chrome_comp.getComputedStyle(nodeEl).marginTop) | 0;
    var i = start;
    var definedMarginTop = nodeEl.style.marginTop;
    while (true) {
      i++;
      oldTop = nodeEl.getBoundingClientRect().top;
      nodeEl.style.marginTop = i + 'px';
      newTop = nodeEl.getBoundingClientRect().top;
      if (newTop > oldTop) {
        nodeEl.style.marginTop = (definedMarginTop) ? definedMarginTop : null;
        return --i;
      }
      if (protection && i == protection | 0) {
        nodeEl.style.marginTop = (definedMarginTop) ? definedMarginTop : null;
        return i;
      }
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).clear == 'none')
    return;

  var compMarginTop = parseInt(chrome_comp.getComputedStyle(node).marginTop);
  var nodeTop = node.getBoundingClientRect().top;
  var containingBlockTop =
      getContainingBlock(node).getBoundingClientRect().top;
  var startTop = compMarginTop - nodeTop - containingBlockTop;
  var boundaryTop;
  if (compMarginTop == 0)
    return;
  boundaryTop = getBoundaryClearanceSpacing(node, startTop, 10000);

  if (compMarginTop < boundaryTop) {
    this.addProblem('RM8006', [node]);
  }
}
); // declareDetector

});
