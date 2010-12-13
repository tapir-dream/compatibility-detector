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

'static_position_after_inline',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isVerticalStaticPosition(nodeEl) {
    /*var inlineTop = nodeEl.style.top,
        inlineBottom = nodeEl.style.bottom,
        oldCompTop = parseInt(chrome_comp.getComputedStyle(nodeEl).top),
        oldCompBottom = parseInt(chrome_comp.getComputedStyle(nodeEl).bottom);
    nodeEl.style.top = 'auto';
    nodeEl.style.bottom = 'auto';
    var compTop = parseInt(chrome_comp.getComputedStyle(nodeEl).top),
        compBottom = parseInt(chrome_comp.getComputedStyle(nodeEl).bottom),
        ret = (oldCompTop == compTop) && (oldCompBottom == compBottom);
    alert(oldCompTop + '\n' + compTop);
    nodeEl.style.top = (inlineTop) ? inlineTop : null;
    nodeEl.style.bottom = (inlineBottom) ? inlineBottom : null;*/
    var top = chrome_comp.getComputedStyle(nodeEl).top,
        bottom = chrome_comp.getComputedStyle(nodeEl).bottom;
    return (top == 'auto') && (bottom == 'auto');
  }
  
  function isAbsolutelyPositioned(nodeEl) {
    var pos = chrome_comp.getComputedStyle(nodeEl).position;
    return (pos == 'absolute') || (pos == 'fixed');
  }
  
  function isHidden(nodeEl) {
    return (chrome_comp.getComputedStyle(nodeEl).display == 'none') ||
        (chrome_comp.getComputedStyle(nodeEl).visibility == 'hidden');
  }

  function hasInlinePreviousSibling(nodeEl) {
    var nod = nodeEl, reWS = /^\s*$/;
    while (nod) {
      nod = nod.previousSibling;
      if (!nod)
        return null;
      if (nod.nodeType == 3) {
        if (reWS.test(nod.nodeValue))
          continue;
        return !reWS.test(nod.nodeValue);
      } else if (nod.nodeType == 1) {
        return chrome_comp.getComputedStyle(nod).display == 'inline'
      }
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!isAbsolutelyPositioned(node))
    return;
  
  if (isHidden(node))
    return;
  
  if (!isVerticalStaticPosition(node))
    return;

  if (hasInlinePreviousSibling(node))
    this.addProblem('RD8019', [node]);
  
  
}
); // declareDetector

});

