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

'align_nowrap',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var hasLayoutParentInIE = context.getCurrentHasLayoutInIE();
  if (!hasLayoutParentInIE)
    return;

  var clearStyle = chrome_comp.getComputedStyle(node).clear;
  if (clearStyle == 'left')
    context.deleteValueInHasLayoutInIEStack('lastAlignLeftNode');
  if (clearStyle == 'right')
    context.deleteValueInHasLayoutInIEStack('lastAlignRightNode');
  if (clearStyle == 'both')
    context.clearValuesInHasLayoutInIEStack();

  var tagName = node.tagName;
  if ((node.align == 'left' || node.align == 'right') &&
      (tagName == 'IMG' || tagName == 'OBJECT' ||
       tagName == 'IFRAME' || tagName == 'TABLE')) {
    var lastAlignLeftNode =
        context.getValueInHasLayoutInIEStack('lastAlignLeftNode');
    var lastAlignRightNode =
        context.getValueInHasLayoutInIEStack('lastAlignRightNode');
    // Left of node smaller than right of the last align-left node means the
    // node is wrapped to a new line. This is not fully accurate because margins
    // are not considered.
    var wrapLeft = lastAlignLeftNode &&
        node.offsetLeft <
            lastAlignLeftNode.offsetLeft + lastAlignLeftNode.offsetWidth;
    var wrapRight = lastAlignRightNode &&
        node.offsetLeft + node.offsetWidth > lastAlignRightNode.offsetLeft;

    if (wrapLeft || wrapRight) {
      var div = document.createElement('div');
      div.style.float = wrapLeft ? 'left' : 'right';
      div.style.width = '0px';
      div.style.height = '0px';
      div.style.padding = '0px';
      div.style.margin = '0px';
      div.style.border = '0px';
      node.parentNode.insertBefore(div, node);
      if ((wrapLeft && node.offsetLeft < div.offsetLeft) ||
          (wrapRight && node.offsetLeft + node.offsetWidth > div.offsetLeft)) {
        this.addProblem('RX8015',
            [node, wrapLeft ? lastAlignLeftNode : lastAlignRightNode]);
      }
      node.parentNode.removeChild(div);
    }

    if (node.align == 'left')
      context.putValueInHasLayoutInIEStack('lastAlignLeftNode', node);
    else if (node.align == 'right')
      context.putValueInHasLayoutInIEStack('lastAlignRightNode', node);
  }

  function insertZeroSizeElement(float, before) {
  }
}
); // declareDetector

});
