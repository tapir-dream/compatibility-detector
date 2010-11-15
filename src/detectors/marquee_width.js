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

'marquee_width',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName == 'MARQUEE') {
    var parentNode = node.parentNode;
    var parentStyle = chrome_comp.getComputedStyle(parentNode);
    if (parentStyle && parentStyle.display == 'table-cell') {
      var definedWidth = chrome_comp.getDefinedStylePropertyByName(
          node, false, 'width');
      if (!definedWidth || definedWidth == 'auto') {
        var oldWidth = parentNode.offsetWidth;
        // \u2060 is word joiner which has zero width but can prevent the
        // table cell from becoming a blank cell whose width is always zero.
        var textNode = document.createTextNode('\u2060');
        parentNode.replaceChild(textNode, node);
        if (parentNode.offsetWidth < oldWidth)
          this.addProblem('BX1030', [node]);
        parentNode.replaceChild(node, textNode);
      }
    }
  }
}
); // declareDetector

});
