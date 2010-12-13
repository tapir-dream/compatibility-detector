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

'fieldset_width',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      node.tagName != 'FIELDSET')
    return;

  function affectsInlineSibling(node, prevOrNext) {
    while (node) {
      var sibling = prevOrNext ? node.previousSibling : node.nextSibling;
      if (!sibling) {
        node = node.parentNode;
        if (node && Node.ELEMENT_NODE == node.nodeType &&
            chrome_comp.getComputedStyle(node).display == 'inline')
          continue;
        return false;
      }
      if (Node.TEXT_NODE == sibling.nodeType) {
        var text = sibling.textContent;
        if (text) {
          var whiteSpace = chrome_comp.getComputedStyle(node).whiteSpace;
          if (whiteSpace.substring(0, 3) == 'pre' &&
              '\r\n'.indexOf(prefOrNext ? text[text.length - 1] : text[0]) !=
                  -1)
            return false;
          if (chrome_comp.trim(text))
            return true;
        }
      } else if (Node.ELEMENT_NODE == sibling.nodeType) {
        if (sibling.tagName == 'BR')
          return false;
        var display = chrome_comp.getComputedStyle(sibling).display;
        if (display == 'block')
          return false;
        if (display != 'none')
          return true;
      }
      node = sibling;
    }
    return false;
  }

  var style = chrome_comp.getComputedStyle(node);
  if (style.display == 'block') {
    var width = chrome_comp.getDefinedStylePropertyByName(node, true, 'width');
    if (width && width != 'auto') {
      // IE(Q) mistakenly treats it as inline.
      if (affectsInlineSibling(node, true) || affectsInlineSibling(node, false))
        this.addProblem('HF1004', [node]);
    }
  }
}
); // declareDetector

});
