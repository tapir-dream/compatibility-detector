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

  var tagList = ['IMG', 'OBJECT', 'IFRAME', 'TABLE', 'APPLET', 'EMBED'];
  var display = chrome_comp.getComputedStyle(node).display;
  if (display == 'inline' || display == 'table')
    return;
  var children = node.children;
  var nodeListLeft = [];
  var nodeListRight = [];
  for (var i = 0, j = children.length; i < j; i++) {
    if (tagList.indexOf(children[i].tagName) != -1) {
      var align = children[i].align.toLowerCase();
      if (align == 'left')
        nodeListLeft.push({
          node: children[i],
          alignment: children[i].align.toLowerCase(),
          rect: children[i].getBoundingClientRect()
        });
      if (align == 'right')
        nodeListRight.push({
          node: children[i],
          alignment: children[i].align.toLowerCase(),
          rect: children[i].getBoundingClientRect()
        });
    }
  }
  //console.log(nodeList);
  if (nodeListLeft.length + nodeListRight.length < 2)
    return;
  var right = node.getBoundingClientRect().right;
  var inlineWidth = node.style.width;
  var oldWidth = chrome_comp.getComputedStyle(node).width;
  var newWidth = 1000000;
  node.style.width = newWidth + 'px !important';
  if (nodeListLeft.length > 0) {
    for (var m = 0, n = nodeListLeft.length; m < n; m++) {
      nodeListLeft[m].newRect = nodeListLeft[m].node.getBoundingClientRect();
      if (nodeListLeft[m].rect.top == nodeListLeft[m].newRect.top)
        continue;
      if (nodeListLeft[m].alignment == 'left') {
        if (nodeListLeft[m].rect.left == nodeListLeft[m].newRect.left) {
          var prev = nodeListLeft[m].node.previousSibling;
          if (prev) {
            if (prev.nodeType == 3) {
              if (/^\s+$/g.test(prev.nodeValue)) {
                prev = prev.previousSibling;
              } else {
                continue;
              }
            }
            if (prev.nodeType == 1) {
              if (chrome_comp.getComputedStyle(prev).display == 'inline')
                continue;
            }
          }
        } else {
          this.addProblem('RX8015', [nodeListLeft[m].node]);
        }
      }
    }
  }
  //node.style.width = null;
  //node.style.width = (inlineWidth) ? inlineWidth : null;
  console.log(nodeListRight);
  var inlinePosition = node.style.position;
  var inlineLeft = node.style.left;
  var oldMarginLeft = chrome_comp.getComputedStyle(node).marginLeft;
  var left = node.getBoundingClientRect().left - oldMarginLeft + oldWidth - newWidth;
  node.style.position = 'fixed !important';
  node.style.left = left + 'px';
  if (nodeListRight.length > 0) {
    for (var m = 0, n = nodeListRight.length; m < n; m++) {
      nodeListRight[m].newRect = nodeListRight[m].node.getBoundingClientRect();
      if (nodeListRight[m].rect.top == nodeListRight[m].newRect.top)
        continue;
      if (nodeListRight[m].alignment == 'right') {
        var newRight = node.getBoundingClientRect().right;
        if ((nodeListRight[m].rect.right) == (nodeListRight[m].newRect.right)) {
          var prev = nodeListRight[m].node.previousSibling;
          if (prev) {
            if (prev.nodeType == 3) {
              if (/^\s+$/g.test(prev.nodeValue)) {
                prev = prev.previousSibling;
              } else {
                continue;
              }
            }
            if (prev.nodeType == 1) {
              if (chrome_comp.getComputedStyle(prev).display == 'inline')
                continue;
            }
          }
        } else {
          this.addProblem('RX8015', [nodeListRight[m].node]);
        }
      }
    }
  }
  node.style.width = null;
  node.style.width = (inlineWidth) ? inlineWidth : null;
  node.style.position = null;
  node.style.position = (inlinePosition) ? inlinePosition : null;
  node.style.left = null;
  node.style.left = (inlineLeft) ? inlineLeft : null;
  
  









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
