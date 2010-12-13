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

'positioned_by_inline_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  /*function isShrinkToFit(node) {
    var width = window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'width');
    if (width && width != 'auto') return;
    var position = window.chrome_comp.getComputedStyle(node).position,
        cssFloat = window.chrome_comp.getComputedStyle(node)['float'],
        inlineBlock = window.chrome_comp.getComputedStyle(node).display,
        isAbsPosition = (position == 'absolute') || (position == 'fixed'),
        isFloat = (cssFloat == 'left') || (cssFloat == 'right'),
        isInlineBlock = inlineBlock == 'inline-block';
    return isAbsPosition || isFloat || isInlineBlock;
  }*/

  if (Node.ELEMENT_NODE != node.nodeType ||
      window.chrome_comp.getComputedStyle(node).display != 'inline')
    return;
  if (window.chrome_comp.getComputedStyle(node).position != 'relative')
    return;
  for (var i = 0, j = node.getElementsByTagName('*'), k = j.length; i < k; 
      i++) {
    var pos = window.chrome_comp.getComputedStyle(j[i]).position,
        isCB = (pos == 'absolute' && j[i].offsetParent == node);
    if (!isCB) continue;
    this.addProblem('RM1020', [j[i]]);
  }
}
); // declareDetector

});

