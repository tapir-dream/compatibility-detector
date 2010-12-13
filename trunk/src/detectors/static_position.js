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

'static_position',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isStaticPosition(element) {
    var top = chrome_comp.getComputedStyle(element).top,
        right = chrome_comp.getComputedStyle(element).right,
        bottom = chrome_comp.getComputedStyle(element).bottom,
        left = chrome_comp.getComputedStyle(element).left;
    return (top == 'auto') && (right == 'auto') && (bottom == 'auto') &&
        (left == 'auto');
  }

  function isPositioned(element) {
    var pos = chrome_comp.getComputedStyle(element).position;
    return (pos == 'absolute') || (pos == 'fixed');
  }

  function getPreviousSiblingType(element) {
    var prev = element.previousSibling;
    if (!prev)
      return;
    while (prev.nodeType == 3 && /^\s+$/g.test(prev.nodeValue)) {
      prev = prev.previousSibling;
    }
    var dis = chrome_comp.getComputedStyle(prev).display,
        cssFloat = chrome_comp.getComputedStyle(prev).float;
    if (prev.nodeType == 3) {
      return 'inline';
    } else if (prev.nodeType == 1) {
      if (cssFloat != 'none')
        return 'float';
      var blockList = ['table', 'block', 'list-item'];
      if (blockList.indexOf(dis) != -1)
        return 'block';
      if (dis == 'inline')
        return 'inline';
      if (dis == 'inline-block')
        return 'inline-block';
    }
  }

  function getType(element) {
    var dis = getStaticDisplayValue(element),
        cssFloat = chrome_comp.getComputedStyle(element).float;
    if (element.nodeType == 1) {
      if (cssFloat != 'none')
        return 'float';
      var blockList = ['table', 'block', 'list-item'];
      if (blockList.indexOf(dis) != -1)
        return 'block';
      if (dis == 'inline')
        return 'inline';
      if (dis == 'inline-block')
        return 'inline-block';
    }
  }

  function getStaticDisplayValue(element) {
    var pos = element.style.position;
    element.style.position = 'static !important';
    var staticDis = chrome_comp.getComputedStyle(element).display;
    element.style.position = null;
    element.style.position = (pos) ? pos : null;
    return staticDis;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (!isPositioned(node))
    return;

  if (!isStaticPosition(node))
    return;

  var prevType = getPreviousSiblingType(node),
      type = getType(node);
  if (!type || !prevType)
    return;

  switch (prevType) {
    case 'inline':
      if (type == 'block' || type == 'inline-block')
        this.addProblem('RM8012', [node]);
      break;
    case 'block':
      return;
    case 'inline-block':
      if (type == 'block' || type == 'inline-block')
        this.addProblem('RM8012', [node]);
      break;
    case 'float':
      this.addProblem('RM8012', [node]);
      break;
  }
}
); // declareDetector

});

