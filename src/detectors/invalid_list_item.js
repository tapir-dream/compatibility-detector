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

/**
 * @fileoverview: Check problem of IE6 IE7 IE8(Q) will ignore LI DD DT element's
 * end tag.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=8
 *
 * Find nodes whose name is one of LI DT DD, then check its next sibling node,
 * if there is a text node, or the node has a invalid tag name, report problem.
 * The DOM tree will be different between IE6 IE7 IE8(Q) and other browsers.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'invalid_list_item',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.VALID_LIST_NEXT_TAGS = {
    LI: ['LI'],
    DT: ['DT', 'DD'],
    DD: ['DT', 'DD']
  };
}, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  // Find list element.
  var tagName = node.tagName;
  if (!this.VALID_LIST_NEXT_TAGS.hasOwnProperty(tagName))
    return;

  var validNextTags = this.VALID_LIST_NEXT_TAGS[tagName];
  var whiteSpaceIsPre =
      chrome_comp.getComputedStyle(node.parentElement).whiteSpace == 'pre';
  var details = null;

  // Check the found list element's next visible sibling node.
  for (var sibling = node.nextSibling; sibling; sibling = sibling.nextSibling) {
    switch (sibling.nodeType) {
      case Node.TEXT_NODE:
        // If the text node is not blank, or the text node's style 'white-space'
        // is 'pre', report problem.
        var text = sibling.nodeValue;
        if ((text && whiteSpaceIsPre) || chrome_comp.trim(text)) {
          details = tagName + ' + TEXT_NODE';
        }
        break;
      case Node.ELEMENT_NODE:
        // Met a valid list element, stop checking.
        var siblingTagName = sibling.tagName;
        if (validNextTags.indexOf(siblingTagName) != -1)
          return;
        // Met a visible element.
        if (chrome_comp.getComputedStyle(sibling).display != 'none') {
          details = tagName + ' + ' + siblingTagName;
        }
        break;
    }
    // Problem detected.
    if (details) {
      this.addProblem('HY1005', {
        nodes: [sibling],
        details: details
      });
      return;
    }
  }
}
); // declareDetector

});
