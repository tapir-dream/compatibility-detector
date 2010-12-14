/*
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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'background_disappear_without_hasLayout',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function getNextHasLayoutElement(nodeEl) {
    var nod = nodeEl;
    while (nod) {
      nod = nod.nextElementSibling;
      if (nod && chrome_comp.hasLayoutInIE(nod))
        return nod;
    }
  }

  function getNearestHasLayoutAncestor(nodeEl) {
    var nod = nodeEl;
    while (nod) {
      nod = nod.parentNode;
      if (nod && chrome_comp.hasLayoutInIE(nod))
        return nod;
    }
  }

  function hasOnlyFloat(nodeEl) {
    var ch = nodeEl.childNodes;
    var reWS = /^\s*$/;
    var last = nodeEl.lastElementChild;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (ch[i].nodeType == 1) {
        if (chrome_comp.getComputedStyle(ch[i]).clear != 'none' &&
            ch[i] == last)
          return true;
        if (chrome_comp.getComputedStyle(ch[i]).display != 'block')
          return false;
        if (chrome_comp.getComputedStyle(ch[i])['float'] == 'none')
          return false;
      }
      if (ch[i].nodeType == 3) {
        if (!reWS.test(ch[i].nodeValue))
          return false;
      }
    }
    return true;
  }

  function getNearestLesserWidthAncestor(nodeEl) {
    var parent = nodeEl.parentNode;
    var width = parseInt(chrome_comp.getComputedStyle(nodeEl).width, 10);
    var pWidth = parseInt(chrome_comp.getComputedStyle(parent).width, 10);
    return pWidth < width;
  }

  function hasClearanceSpacing(nodeEl) {
    var oldTop;
    var newTop;
    var inlineMarginTop = nodeEl.style.marginTop;
    nodeEl.style.marginTop = '-1px';
    oldTop = nodeEl.getBoundingClientRect().top;
    nodeEl.style.marginTop = '0px';
    newTop = nodeEl.getBoundingClientRect().top;
    nodeEl.style.marginTop = (inlineMarginTop) ? inlineMarginTop : null;
    return newTop == oldTop;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var clearDir = chrome_comp.getComputedStyle(node).clear;
  if (clearDir == 'none')
    return;
  if (!hasClearanceSpacing(node))
    return;
  if (!getNearestLesserWidthAncestor(node) && !hasOnlyFloat(node.parentNode))
    return;

  var cb = chrome_comp.getContainingBlock(node), cbBgColor, cbCbBgColor;
  cbBgColor = chrome_comp.getComputedStyle(cb).backgroundColor;
  cbBgImage = chrome_comp.getComputedStyle(cb).backgroundImage;
  if (cbBgColor == chrome_comp.COLOR_TRANSPARENT)
    return;
  if (cbBgImage) {
    this.addProblem('RM3007', [cb]);
  } else {
    if (chrome_comp.getComputedStyle(
        chrome_comp.getContainingBlock(cb)).backgroundColor != cbBgColor) {
      this.addProblem('RM3007', [cb]);
    }
  }
}
); // declareDetector

});
