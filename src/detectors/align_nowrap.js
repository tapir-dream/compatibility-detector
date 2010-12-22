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

// One detector implementation for checking the HTML align attribute for several
// elements transformed into floating element.
// @author : luyuan.china@gmail.com
// @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=5
//
// The align attribute for objects, images, tables, frames, etc., causes the 
// object to float to the left or right margin. Floating objects generally 
// begin a new line.
// In other word, the align attribute for the said elements will be transformed
// into CSS 'float' property in the corresponding direction.
//
// First, we ignore the inline and invisible elements. And get the children
// elements of the present checked element, recording the left-aligned and
// right-aligned said elements' information (the node object, its position and
// its alignment). If there are less then two elements satisfied with 
// conditions, we do not continue.
//
// Try to enlarge the width of the element, we get the new position of the
// elements satisfied with conditions. By comparing the changes in the
// position to determine that if there may have the compatibility issue.
// At last, restore the style of the element.



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
  if (display == 'inline' || display == 'none')
    return;

  var children = node.children;
  var nodeListLeft = [];
  var nodeListRight = [];

  for (var i = 0, j = children.length; i < j; i++) {
    if (tagList.indexOf(children[i].tagName) != -1) {
      var align = (children[i].align + '').toLowerCase();
      if (align == 'left')
        nodeListLeft.push({
          node: children[i],
          alignment: (children[i].align + '').toLowerCase(),
          rect: children[i].getBoundingClientRect()
        });
      if (align == 'right')
        nodeListRight.push({
          node: children[i],
          alignment: (children[i].align + '').toLowerCase(),
          rect: children[i].getBoundingClientRect()
        });
    }
  }

  if (nodeListLeft.length + nodeListRight.length < 2)
    return;

  var right = node.getBoundingClientRect().right;
  var left = node.getBoundingClientRect().left;
  var inlineWidth = node.style.width;
  var inlinePosition = node.style.position;
  var inlineLeft = node.style.left;
  var oldWidth = parseInt(chrome_comp.getComputedStyle(node).width, 10);
  var newWidth = 10000;

  if (node.tagName != 'TD' && node.tagName != 'TH')
    node.style.position = 'fixed !important';

  node.style.left = '0px';
  node.style.width = newWidth + 'px !important';

  var newLeft = node.getBoundingClientRect().left;
  var problemList = [];
  var mostTop = 0;
  var mostBottom = 0;

  if (nodeListLeft.length > 0) {
    for (var m = 0, n = nodeListLeft.length; m < n; m++) {
      nodeListLeft[m].newRect = nodeListLeft[m].node.getBoundingClientRect();
      mostTop = Math.min(mostTop, nodeListLeft[m].newRect.top);
      mostBottom = Math.max(mostBottom, nodeListLeft[m].newRect.bottom);
      if (nodeListLeft[m].rect.top == nodeListLeft[m].newRect.top)
        continue;
      if (nodeListLeft[m].alignment == 'left') {
        if (left - nodeListLeft[m].rect.left ==
            newLeft - nodeListLeft[m].newRect.left) {
          var prev = nodeListLeft[m].node.previousSibling;
          if (prev) {
            if (prev.nodeType == 3) {
              if (/^\s+$/g.test(prev.nodeValue)) {
                prev = prev.previousSibling;
              } else {
                continue;
              }
            }
            if (prev && prev.nodeType == 1) {
              if (chrome_comp.getComputedStyle(prev).display == 'inline')
                continue;
            }
          }
        } else {
          this.addProblem('RX8015',
              { nodes: [nodeListLeft[m].node], severityLevel: 1 });
        }
      }
    }
  }
  node.style.left = null;

  var oldMarginLeft = parseInt(chrome_comp.getComputedStyle(node).marginLeft);
  var left = node.getBoundingClientRect().left -
      oldMarginLeft + oldWidth - newWidth;

  node.style.left = left + 'px !important';
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
            if (prev && prev.nodeType == 1) {
              if (chrome_comp.getComputedStyle(prev).display == 'inline')
                continue;
            }
          }
          if (!(mostTop < nodeListRight[m].newRect.top &&
              nodeListRight[m].newRect < mostBottom))
            this.addProblem('RX8015',
                { nodes: [nodeListRight[m].node], severityLevel: 1 });
        } else {
          this.addProblem('RX8015',
              { nodes: [nodeListRight[m].node], severityLevel: 1 });
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
}
); // declareDetector

});
