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

chrome_comp.CompDetect.declareDetector(

'haslayout_in_shrink_to_fit',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isWidthAuto(element) {
    var inlineDisplay = element.style.display;
    element.style.display = 'none !important';
    var width = chrome_comp.getComputedStyle(element).width;
    element.style.display = null;
    element.style.display = (inlineDisplay) ? inlineDisplay : null;
    return width == 'auto';
  }

  function isShrinkToFit(element) {
    if (!isWidthAuto(element))
      return false;
    var cssFloat = chrome_comp.getComputedStyle(element).float;
    var pos = chrome_comp.getComputedStyle(element).position;
    var dis = chrome_comp.getComputedStyle(element).display;
    return (pos == 'absolute' || pos == 'fixed') ||
           (cssFloat != 'none') || (dis == 'inline-block');
  }

  function isInlineElement(element) {
    return chrome_comp.getComputedStyle(element).display == 'inline';
  }

  function allWidthAutoLayoutChildren(element) {
    var ch = element.children;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (isInlineElement(element))
        continue;
      if (!isWidthAuto(ch[i]))
        return false;
      if (chrome_comp.hasLayoutInIE(element)) {
        if (!allWidthAutoLayoutChildren(ch[i]))
          return false;
      }
    }
    return true;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (chrome_comp.getComputedStyle(node).display.indexOf('inline') != -1)
    return;

  if (chrome_comp.getComputedStyle(node).display.indexOf('table') != -1)
    return;

  if (!isShrinkToFit(node))
    return;

  if (allWidthAutoLayoutChildren(node))
    this.addProblem('RD8023', [node]);

}
); // declareDetector

});

