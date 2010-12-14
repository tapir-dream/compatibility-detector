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
    var parentElement = node.parentElement;
    var parentStyle = chrome_comp.getComputedStyle(parentElement);
    var definedWidth = chrome_comp.getDefinedStylePropertyByName(
        node, false, 'width');
    definedWidth = definedWidth || parseInt(node.getAttribute('width'), 10) | 0;
    if (parentStyle && parentStyle.display == 'table-cell' &&
        parentStyle.tableLayout == 'auto' && !definedWidth) {
      var oldParentClientRect = parentElement.getBoundingClientRect();
      var oldBodyClientRect = document.body.getBoundingClientRect();
      node.style.display ='none';
      if (oldBodyClientRect.width !=
            document.body.getBoundingClientRect().width ||
          oldParentClientRect.left !=
            parentElement.getBoundingClientRect().left)
        this.addProblem('BX1030', [node]);
      node.style.display = '';
    }
  }
}
); // declareDetector

});
