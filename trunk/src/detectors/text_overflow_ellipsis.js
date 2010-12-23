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

/*
 * @fileoverview: One detector implementation for checking 'text-overflow: ellipsis can cause
 * compatibility issues' problems
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=30

 * 'text-overflow' is the new CSS3 feature, in draft form;
 * This feature can be applied to block-level elements,
 * inline elements and cells, when its value is 'ellipsis',
 * the text will be cut off with an ellipsis said.
 * Therefore, not all browsers support this new feature , such as Firefox.

 * When the trigger the following conditions may cause compatibility problems:
 * An element to set this feature,
 * Set the width of the element,
 * Set the overflow: hidden,
 * 'word-wrap' value is not a break-word.
*/


addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'text_overflow_ellipsis',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType ||context.isDisplayNone())
    return;
  // Recursively check if the length of sub-elements than the parent element
  function loopForNode(nodeElement, nodeWidth) {
    var node = nodeElement;
    if (node.childNodes.length > 0) {
      for(var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType != 3) {
          if (node.childNodes[i].childNodes.length == 1 &&
              node.childNodes[i].childNodes[0].nodeType == 3) {
            if (getComputedStyle(node.childNodes[i]).display == 'block' &&
                getComputedStyle(node.childNodes[i]).float == 'none') {
              var tempNode = node.childNodes[i].cloneNode(true);
              // To obtain the actual length of the block elements
              tempNode.style.float = 'left';
              document.body.appendChild(tempNode);
              childrenWidth = window.getComputedStyle(tempNode).width;
              // Remove the temporary elements
              document.body.removeChild(tempNode);
              if (parseInt(childrenWidth, 10) > parseInt(nodeWidth, 10)) {
                This.flag = true;
                return;
              }
            }
          }
          if (node.childNodes.length > 0)
            loopForNode(node.childNodes[i], nodeWidth, this.flag);
        }
      }
    }
  }
  // Check whether the element to set the width
  function isAutoWidth(element) {
    var inlineDisplay = element.style.display;
    element.style.display = 'none !important';
    var width = chrome_comp.getComputedStyle(element).width;
    element.style.display = null;
    element.style.display = (inlineDisplay) ? inlineDisplay : null;
    return width == 'auto';
  }
  var This = this;
  var style = chrome_comp.getComputedStyle(node);
  var textOverflow = style.textOverflow;
  var overflow = style.overflow;
  var wordWrap = style.wordWrap;

  if (style && textOverflow == 'ellipsis' && overflow == 'hidden' &&
      node.tagName != 'TD' && wordWrap != 'break-word' && !isAutoWidth(node)) {
    var nodeWidth = chrome_comp.getComputedStyle(node).width;
    This.flag = false;
    // When the length of sub-element is more than parent element ,point out
    // this problem
    loopForNode(node, nodeWidth);
    if (This.flag == true)
      this.addProblem('RT3005', [node]);
  }
}
); // declareDetector

});
