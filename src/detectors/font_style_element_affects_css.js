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

'font_style_element_affects_css',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType ||
      context.isDisplayNone() ||
      !chrome_comp.mayAffectNormalFlow(node) ||
      chrome_comp.isReplacedElement(node))
    return;

  var tagName = node.tagName;
  if (tagName == 'BR' || tagName == 'HR')
    return;

  if (chrome_comp.getDefinedStylePropertyByName(node, false,
          'text-decoration') != 'none' || !node.textContent)
    return;

  var isUnderlineElement = (tagName == 'A' || tagName == 'U');
  var isStrikeElement = (!isUnderlineElement &&
                        (tagName == 'S' || tagName == 'STRIKE'));

  var decorationsInEffect =
      chrome_comp.getComputedStyle(node).WebkitTextDecorationsInEffect;
  var hasUnderline = decorationsInEffect.indexOf('underline') != -1;
  // Don't check line-through if the current node is not a strike element
  // because in IE only strike element's text-decoration:none affects CSS.
  var hasLineThrough = isStrikeElement &&
      decorationsInEffect.indexOf('line-through') != -1;

  for (var parent = node.parentNode;
       Node.ELEMENT_NODE == parent.nodeType && (hasUnderline || hasLineThrough);
       parent = parent.parentNode) {
    var parentDecorations =
        chrome_comp.getComputedStyle(parent).WebkitTextDecorationsInEffect;
    if (parentDecorations == 'none' ||
        // Some text decoration is not propagated from parent. Quit.
        parentDecorations.length > decorationsInEffect.length)
      return;

    // In IE 6/7/8(Q):
    // a) A's underline can be affected by any child with text-decoration: none
    // b) Any other underline can be affected by an A/U child with
    //    text-decoration: none
    // c) Any underline can be affected by an S or STRIKE child with
    //    text-decoration: none
    var parentTagName = parent.tagName;
    var parentHasUnderline = parentDecorations.indexOf('underline') != -1;
    var parentHasLineThrough = parentDecorations.indexOf('line-through') != -1;
    var parentDefinedDecoration = chrome_comp.getDefinedStylePropertyByName(
        parent, false, 'text-decoration');
    if ((hasUnderline && parentHasUnderline &&
         parentDefinedDecoration == 'underline' &&
         (parentTagName == 'A' && parent.hasAttribute('href')) || // a)
          isUnderlineElement) ||  // b)
        (hasLineThrough && parentHasLineThrough &&
         parentDefinedDecoration == 'line-through')) {  // c)
      this.addProblem('RX3007', [node, parent]);
      return;
    }
    hasUnderline = parentHasUnderline;
    hasLineThrough = parentHasLineThrough;
  }
}
); // declareDetector

});
