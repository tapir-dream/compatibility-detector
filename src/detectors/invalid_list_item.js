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
 * @fileoverview: One detector implementation for checking 'IE6 IE7 IE8 (Q)
 *  will ignore LI DD DT element end tag' problems
 *
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=8
 *
 * Check each node, when the node is LI DT DD,
 * then check the next node, if the next node is a text node,
 * there may be a problem.
 * If the next node is not LI DT DD node and is a visible node,
 * there may be a problem.
 */

addScriptToInject(function() {

  var VALID_LIST_NEXT_TAGS;
  VALID_LIST_NEXT_TAGS = {
    LI: ['LI'],
    DT: ['DT', 'DD'],
    DD: ['DT', 'DD']
  };

  chrome_comp.CompDetect.declareDetector(

    'invalid_list_item',

    chrome_comp.CompDetect.ScanDomBaseDetector,

    null, // constructor

    function checkNode(node, context) {
      if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
        return;

      var validNextTags = VALID_LIST_NEXT_TAGS[node.tagName];
      var whiteSpacePre =
          chrome_comp.getComputedStyle(node).whiteSpace == 'pre';
      // Find first valid or invalid visible sibling.
      if (validNextTags instanceof Array) {
        for (var sibling = node.nextSibling; sibling;
             sibling = sibling.nextSibling) {
          switch (sibling.nodeType) {
            case Node.TEXT_NODE:
              var text = sibling.nodeValue;
              if ((text && whiteSpacePre) || chrome_comp.trim(text)) {
                this.addProblem('HY1005', [sibling]);
                return;
              }
              break;
            case Node.ELEMENT_NODE:
              if (validNextTags.indexOf(sibling.tagName) != -1)
                return;
              if (chrome_comp.getComputedStyle(sibling).display != 'none') {
                this.addProblem('HY1005', [sibling]);
                return;
              }
              break;
          }
        }
      }
    }
    ); // declareDetector

});
