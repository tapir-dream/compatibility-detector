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
 * @fileoverview Check if there is invisbile absolutely positioned element
 * overflowing the containing block which will establish the scroll bar.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=70
 *
 * In CSS2.1 specification, the overflow property specifies whether content of a
 * block container element is clipped when it overflows the element's box. It
 * affects the clipping of all of the element's content except any descendant
 * elements (and their respective content and descendants) whose containing
 * block is the viewport or an ancestor of the element.
 * But the specification does not describe if the descendants are invisble and
 * overflow the containing block, does the browsers need to establish the scroll
 * bar.
 *
 * So We check the invisible absolutely positioned elements and its containing
 * block. Get and compare their position rects, if there is such element, we
 * report the issue.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'invisible_element_overflow',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  // Only check the invisible elements.
  if (node.offsetWidth > 0 && node.offsetHeight > 0)
    return;
  // Only check the absolutely positioned elements.
  if (chrome_comp.getComputedStyle(node).position != 'absolute')
    return;
  var containingBlock = chrome_comp.getContainingBlock(node);
  if (!containingBlock)
    return;
  var containingBlockOverflow =
      chrome_comp.getComputedStyle(containingBlock).overflow;
  // Only check the containing block which will establish the scroll bar.
  if (containingBlockOverflow != 'auto' && containingBlockOverflow != 'scroll')
    return;

  var nodeRect = node.getBoundingClientRect();
  var containingBlockRect = containingBlock.getBoundingClientRect();
  // Determine if the node overflows by comparing its position with the
  // containing block's.
  if (nodeRect.top < containingBlockRect.top ||
      nodeRect.right > containingBlockRect.right ||
      nodeRect.bottom > containingBlockRect.bottom ||
      nodeRect.left < containingBlockRect.left)
    this.addProblem('BX8037', [node, containingBlock]);
}
); // declareDetector

});
