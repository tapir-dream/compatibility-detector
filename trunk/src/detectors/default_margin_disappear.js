/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'default_margin_disappear',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function getContainingBlock(nodeEl) {
    var position = window.chrome_comp.getComputedStyle(nodeEl).position;
    if (nodeEl == document.documentElement)
      return;
    if (position == 'fixed')
      return;
    if (position == 'absolute')
      return nodeEl.offsetParent;
    var nod = nodeEl;
    while (nod) {
      if (nod == document.body)
        return document.documentElement;
      if (nod.parentNode) nod = nod.parentNode;
      if (window.chrome_comp.getComputedStyle(nod).display ==
          'block' || isBlockFormattingContext(nod)) {
        return nod;
      }
    }
    return;
  }

  function isBlockFormattingContext(nodeEl) {
    var elementStyle = window.chrome_comp.getComputedStyle(nodeEl);
    var display = elementStyle.display;
    var cssFloat = elementStyle['float'];
    var position = elementStyle.position;
    var overflow = elementStyle.overflow;
    var overflowX = elementStyle.overflowX;
    var overflowY = elementStyle.overflowY;
    return (display == 'inline-block') || (display == 'table') ||
           (display == 'table-cell') || (display == 'table-caption') ||
           (position == 'absolute') || (position == 'fixed') ||
           (overflow != 'visible') || (overflowX != 'visible') ||
           (overflowY != 'visible');
  }

  function isHavingLayout(nodeEl) {
    var elementStyle = window.chrome_comp.getComputedStyle(nodeEl);
    var display = elementStyle.display;
    var cssFloat = elementStyle['float'];
    var width =
        window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true,'width');
    var height =
        window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true,'height');
    var position = elementStyle.position;
    var writingMode = elementStyle.writingMode;
    var zoom =
        window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true;'zoom');
    var minWidth = elementStyle.minWidth;
    var minHeight = elementStyle.minHeight;
    var maxWidth = elementStyle.maxWidth;
    var maxHeight = elementStyle.maxHeight;
    var overflow = elementStyle.overflow;
    var overflowX = elementStyle.overflowX;
    var overflowY = elementStyle.overflowY;
    var tagList = ['HTML', 'BODY', 'TABLE', 'TR', 'TH', 'TD',
                   'BUTTON','FIELDSET', 'LEGEND', 'MARQUEE'];

    if (display == 'none')
      return false;
    if (tagList.indexOf(nodeEl.tagName) != -1)
      return true;
    if (display == 'inline-block')
      return true;
    if (cssFloat == 'left' || cssFloat == 'right')
      return true;
    if (position == 'absolute' || position == 'fixed')
      return true;
    if (minWidth != '0px')
      return true;
    if (minHeight != '0px')
      return true;
    if (maxWidth != 'none')
      return true;
    if (maxHeight != 'none')
      return true;
    if (overflow != 'visible')
      return true;
    if (overflowX != 'visible')
      return true;
    if (overflowY != 'visible')
      return true;
    if (writingMode == 'tb-rl')
      return true;
    if (zoom && zoom != 'normal')
      return true;
    if (width && width != 'auto')
      return true;
    if (height && height != 'auto')
      return true;
    return false;
  }

  function isNegativeMargin(nodeEl) {
    var elementStyle = window.chrome_comp.getComputedStyle(nodeEl);
    var t = parseInt(elementStyle.marginTop,10);
    var r = parseInt(elementStyle.marginRight,10);
    var b = parseInt(elementStyle.marginbottom,10);
    var l = parseInt(elementStyle.marginLeft,10);
    return (t < 0) || (r < 0) || (b < 0) || (l < 0);
  }

  function isNotInFlow(nodeEl) {
    var elementStyle = window.chrome_comp.getComputedStyle(nodeEl);
    return (elementStyle.position == 'absolute') ||
           (elementStyle.position == 'fixed') ||
           (elementStyle['float'] != 'none');
  }

  function isDefaultMargin(nodeEl) {
    var mt = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, false,
          'margin-top');
    var mb = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, false,
          'margin-bottom');
    return !mt || !mb;
  }

  function isFirstInFlow(nodeEl, containingBlock) {
    var p = containingBlock.firstElementChild;
    while (p) {
      if (p == nodeEl) {
        return true;
      }
      if (isNotInFlow(p)) {
        p = p.nextElementSibling;
        continue;
      } else {
        return false;
      }
      p = p.nextElementSibling;
    }
    return false;
  }

  function isLastInFlow(nodeEl, containingBlock) {
    var p = containingBlock.lastElementChild;
    while (p) {
      if (p == nodeEl)
        return true;
      if (isNotInFlow(p)) {
        p = p.previousElementSibling;
        continue;
      } else {
        return false;
      }
      p = p.previousElementSibling;
    }
    return false;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var tagList = ['BLOCKQUOTE', 'DL', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5',
      'H6', 'OL', 'P', 'PRE', 'UL'];

  if (tagList.indexOf(node.tagName) == -1)
    return;

  if (!isDefaultMargin(node))
    return;

  if (isNotInFlow(node)) {
    this.addProblem('RM1009', [node]);
    return;
  }

  var cb = getContainingBlock(node)
  var t = node.tagName;
  if (t == 'P' && (isFirstInFlow(node, cb) || isLastInFlow(node, cb))) {
    this.addProblem('RM1009', [node]);
    return;
  }
  if (t != 'P' && isFirstInFlow(node, cb)) {
    this.addProblem('RM1009', [node]);
    return;
  }
}
); // declareDetector

});