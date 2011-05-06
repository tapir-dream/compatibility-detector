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
 * @fileoverview Check FIELDSET elements whose specified 'width' is not 'auto
 * These elements will layout as inline elements in IE6/7/8(Q), but block
 * elements in other browsers.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=154
 *
 * This detector will do these things:
 * 1. Get a FIELDSET element which display is block and width is not 'auto'.
 * 2. Check if its previousSibling and nextSibling is not BR or block element.
 * 3. Check if its previousSibling and nextSibling's 'white-space' is 'pre',
 *    and contains CRLF character.
 * 4. Check if its parentElement is an inline element.
 * 5. Report a problem if at least one of step 3 - 5 is true.
 */


addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'fieldset_width',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  /**
   * Filter FIELDSET tag element previousSibling and nextSibling node.
   * If they can create new line, then no rendering differences.
   * For example: node style is block or table, node name is BR, the CRLF
   * char in the node whiteSpace style is pre (PRE tag).
   *
   * @param {Node} node
   * @param {boolean} isPrevSibling
   * @return {boolean}
   */
  this.affectsInlineSibling = function(node, isPrevSibling) {
    var sibling = isPrevSibling ? node.previousSibling : node.nextSibling;
    if (!sibling)
      return false;
    if (Node.TEXT_NODE == sibling.nodeType) {
      var text = sibling.nodeValue;
      if (text) {
        var whiteSpace = chrome_comp.getComputedStyle(node).whiteSpace;
        if (whiteSpace.indexOf('pre') == 0) {
          var siblingChar = isPrevSibling ? text[text.length - 1] : text[0];
          // CRLF char cause the text to newline in whiteSpace style is pre.
          // It do not rendering differences.
          if (siblingChar.charCodeAt(0) == 32 ||
              siblingChar.charCodeAt(0) == 10)
            return false;
        }
        if (chrome_comp.trim(text))
          return true;
      }
    }
    if (Node.ELEMENT_NODE == sibling.nodeType) {
      if (sibling.tagName == 'BR')
        return false;
      var display = chrome_comp.getComputedStyle(sibling).display;
      if (display == 'block' || display.indexOf('table') != -1)
        return false;
      if (display != 'none')
        return true;
    }
    return false;
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      node.tagName != 'FIELDSET')
    return;

  var style = chrome_comp.getComputedStyle(node);
  if (style.display == 'block') {
    var width = chrome_comp.getSpecifiedStyleValue(node, 'width');
    if (!chrome_comp.isAutoOrNull(width)) {
      // IE(Q) mistakenly treats it as inline.
      if (this.affectsInlineSibling(node, true) ||
          this.affectsInlineSibling(node, false) ||
          chrome_comp.getComputedStyle(node.parentElement).display == 'inline')
        this.addProblem('HF1004', [node]);
    }
  }
}
); // declareDetector

});
