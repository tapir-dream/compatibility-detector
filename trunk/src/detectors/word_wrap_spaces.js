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

'word_wrap_spaces',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var style = chrome_comp.getComputedStyle(node);
  var nodeDisplay = style.display;
  var nextSibling = node.nextSibling;
  var previousSibling = node.previousSibling;
  var previousreg = /^[\u0020\u0009]/g;
  var nextreg = /[\u0020\u0009]$/g;

  var blockLikeInIE = ['HTML', 'BODY', 'TABLE', 'LI', 'HR', 'OL',
      'UL', 'MARQUEE', 'DIR', 'MENU', 'PRE', 'CENTER', 'P', 'DIV', 'NOFRAMES',
      'DL', 'DD', 'DT', 'FORM', 'FRAMESET', 'ADDRESS', 'BLOCKQUOTE', 'H1',
      'H2', 'H3', 'H4', 'H5', 'H6', 'FRAME'];
  var defaultDisplayNone = ['BASE', 'HEAD', 'META', 'NOFRAMES', 'NOSCRIPT',
      'PARAM', 'SCRIPT', 'STYLE', 'TITLE'];

  // If a block element and its display set none
  if (nodeDisplay == 'none' && blockLikeInIE.indexOf(node.tagName)!=-1) {
    if(node.parentElement.lastElementChild &&
        node.parentElement.lastElementChild == node)
      return;
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
      (blockLikeInIE.indexOf(node.tagName) == -1 &&
      defaultDisplayNone.indexOf(node.tagName) == -1 && nodeDisplay == 'none'))
    {
    if(node.form != null)
      return;
    if(node.parentElement.lastElementChild &&
        node.parentElement.lastElementChild == node)
      return;
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
