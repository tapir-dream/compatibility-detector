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

'influencing_margin_collapsing',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  function hasFloatOrPositionedBeforeFirstInFlowChild(element) {
    var first = getFirstInFlowElement(element);
    if (!first)
      return false;
    var ch = element.children;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (!isInFlow(ch[i]))
        return ch[i];
      if (hasPureFloatOrPositioned(ch[i]) && isZeroHeight(ch[i]))
        return ch[i];
      if (ch[i] == first)
        return;
    }
    return false;
  }

  function hasFloatOrPositionedAfterLastInFlowChild(element) {
    var last = getLastInFlowElement(element);
    var reWS = /^\s*$/g;
    if (!last)
      return false;
    var ch = element.children;
    for (var i = ch.length - 1, j = 0; i >= j; i--) {
      if (!isInFlow(ch[i]))
        return ch[i];
      if (hasPureFloatOrPositioned(ch[i]) && isZeroHeight(ch[i]))
        return ch[i];
      if (ch[i].innerText.match(reWS))
        return ch[i];
      if (ch[i] == last)
        return;
    }
    return false;
  }

  function isInFlow(element) {
    if (!element)
      return null;
    var pos = chrome_comp.getComputedStyle(element).position;
    var fl = chrome_comp.getComputedStyle(element).float;
    var dis = chrome_comp.getComputedStyle(element).display;
    return (pos != 'absolute') && (pos != 'fixed') && (fl == 'none') &&
      (dis != 'none');
  }

  function getFirstInFlowElement(element) {
    var ch = element.childNodes;
    var reWS = /^\s*$/g;
    var reNBSP = /\u00a0/g;
    if (!element.firstElementChild)
      return null;
    for (var i = 0, j = ch.length; i < j; i++) {
      var nv = ch[i].nodeValue;
      if (ch[i].nodeType == 3) {
        if (!nv.match(reWS))
          return null;
        if (nv.match(reNBSP))
          return null;
      } else if (ch[i].nodeType == 1) {
        if (!isInFlow(ch[i]))
          continue;
        if (isInFlow(ch[i]))
          return ch[i];
      }
    }
    return null;
  }

  function getLastInFlowElement(element) {
    var ch = element.childNodes;
    var reWS = /^\s*$/g;
    var reNBSP = /\u00a0/g;
    if (!element.lastElementChild)
      return null;
    for (var i = ch.length - 1, j = 0; i >= j; i--) {
      var nv = ch[i].nodeValue;
      if (ch[i].nodeType == 3) {
        if (!nv.match(reWS))
          return null;
        if (nv.match(reNBSP))
          return null;
      } else if (ch[i].nodeType == 1) {
        if (!isInFlow(ch[i]))
          continue;
        if (isInFlow(ch[i]))
          return ch[i];
      }
    }
    return null;
  }

  function hasPureFloatOrPositioned(element) {
    var ch = element.children;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (!isInFlow(ch[i])) {
        return true;
      }
      if (isZeroHeight(ch[i])) {
        return hasPureFloatOrPositioned(ch[i]);
      }
      return false;
    }
  }

  function isZeroHeight(element) {
    return element.offsetHeight == 0;
  }

  function isBlockFormattingContext(element) {
    var computedStyle = window.chrome_comp.getComputedStyle(element);
    var display = computedStyle.display;
    var cssFloat = computedStyle.float;
    var position = computedStyle.position;
    var overflow = computedStyle.overflow;
    var overflowX = computedStyle.overflowX;
    var overflowY = computedStyle.overflowY;
    return (display == 'inline-block') || (display == 'table') ||
      (display == 'table-cell') || (display == 'table-caption') ||
      (position == 'absolute') || (position == 'fixed') ||
      (overflow != 'visible') || (overflowX != 'visible') ||
      (overflowY != 'visible') || (cssFloat != 'none');
  }

  function hasTopBorderAndPadding(element) {
    var bt = parseInt(chrome_comp.getComputedStyle(element).borderTopWidth);
    var pt = parseInt(chrome_comp.getComputedStyle(element).paddingTop);
    return (bt != 0) || (pt != 0);
  }

  function hasBottomBorderAndPadding(element) {
    var bb = parseInt(chrome_comp.getComputedStyle(element).borderBottomWidth);
    var pb = parseInt(chrome_comp.getComputedStyle(element).paddingBottom);
    return (bb != 0) || (pb != 0);
  }

  function hasMarginTop(element) {
    return parseInt(chrome_comp.getComputedStyle(element).marginTop) != 0;
  }

  function hasMarginBottom(element) {
    return parseInt(chrome_comp.getComputedStyle(element).marginBottom) != 0;
  }

  function getPreviousCollapsing(element) {
    if (!hasMarginTop(element))
      return null;
    var el = element;
    while (el) {
      el = el.previousElementSibling;
      if (isInFlow(el)) {
        if (!isZeroHeight(el)) {
          if (hasMarginBottom(el))
            return el;
        }
      }
    }
  }

  function isFloating(element) {
    return chrome_comp.getComputedStyle(element).float != 'none';
  }

  function getFloatingBetweenMarginCollapsing(element) {
    var el = element;
    while (el) {
      el = el.nextElementSibling;
      if (!el)
        return null;
      if (isFloating(el))
        return el;
      if (isZeroHeight(el)) {
        if (hasPureFloatOrPositioned(el))
          return el;
      }
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if ((node.tagName == 'HTML') || (node.tagName == 'BODY'))
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (isBlockFormattingContext(node))
    return;

  if (!hasMarginTop(node) && !hasMarginBottom(node))
    return;

  if (chrome_comp.getComputedStyle(node).display == 'inline')
    return;

  if (hasTopBorderAndPadding(node) || hasBottomBorderAndPadding(node))
    return;

  var f = hasFloatOrPositionedBeforeFirstInFlowChild(node);
  var l = hasFloatOrPositionedAfterLastInFlowChild(node);
  if (f && hasMarginTop(node))
    this.addProblem('RB8004', [f]);
  if (l && hasMarginBottom(node))
    this.addProblem('RB8004', [l]);

  var prev = getPreviousCollapsing(node);
  if (prev && getFloatingBetweenMarginCollapsing(prev)) {
    this.addProblem('RB8004', [prev]);
  }
}
); // declareDetector

});

