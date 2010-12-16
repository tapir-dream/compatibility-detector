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

'word_wrap_spaces',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  // Get the default value of display
  function getDefaultDisplay(element) {
    var temp = element.cloneNode(false);
    temp.style.display = 'none !important';
    document.body.appendChild(temp);
    var elementFloat = temp.style.float;
    var elementPosition = temp.style.position;
    var elementDisplay = temp.style.display;
    temp.style.float = 'none !important';
    temp.style.position = 'static !important';
    temp.style.display = '';
    var defaultDisplay = chrome_comp.getComputedStyle(temp).display;
    document.body.removeChild(temp);
    temp = null;
    return defaultDisplay;
  }
  var style = chrome_comp.getComputedStyle(node);
  var nodeDisplay = style.display;
  var nextSibling = node.nextSibling;
  var previousSibling = node.previousSibling;
  var previousreg = /^[\u0020\u0009]/g;
  var nextreg = /[\u0020\u0009]$/g;

  // If a block element and its display set none
  if (nodeDisplay == 'none' && getDefaultDisplay(node) == 'block') {
    // If the element's nextSibling is text node and
    // previousSibling is not text node
    if (nextSibling && nextSibling.nodeType == 3 && previousSibling &&
        previousSibling.nodeType !=3) {
      // If the element's nextSibling is beginning with whitespace or tab ,
      //point out this problem
      if (previousreg.test(nextSibling.nodeValue))
        this.addProblem('RT1008', [node]);
     }
  }
  // If a inline element or a input element with type set hidden
  if ((node.tagName == 'INPUT' && node.type == 'hidden') ||
      (getDefaultDisplay(node) == 'inline' && nodeDisplay == 'none')) {
    // If the element's nextSibling is text node and
    // previousSibling is text node
    if (nextSibling && nextSibling.nodeType == 3 && previousSibling &&
        previousSibling.nodeType == 3) {
      // If the element's nextSibling and  previousSibling are beginning with
      // whitespace or tab , point out this problem
      if (previousreg.test(nextSibling.nodeValue)
         && nextreg.test(previousSibling.nodeValue))
        this.addProblem('RT1008', [node]);
    }
  }
}
); // declareDetector

});
