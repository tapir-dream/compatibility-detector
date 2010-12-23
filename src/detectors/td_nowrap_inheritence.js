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

/**
 * @fileoverview: One detector implementation for checking the inheritence of
 * 'nowrap' for the table cell elements.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=118
 *
 * In CSS2.1 specification, the 'white-space' property can be inherited. So if
 * a table is set 'white-space:nowrap', its cell elements will inherit the value
 * of the 'white-space' property from the table. And the HTML nowrap attribute
 * for table cell element (TD and TH) will be transformed into the CSS property
 * 'white-space:nowrap' in all browsers.
 * MSDN notes that care should be taken when the noWrap property is used in 
 * conjunction with the width attribute of table or td elements.
 * If a td element has its noWrap set to true and the WIDTH attribute of its 
 * table element is set to a smaller dimension than the rendered content of the 
 * td element, wordwrap does not occur. In this case, the noWrap setting takes 
 * precedence over the WIDTH attribute. (refer to
 * http://msdn.microsoft.com/en-us/library/ms534196(VS.85).aspx)
 * So this detector should check the situation that MSDN notes.
 *
 * First check all table cell elements, getting its real computed value of 
 * width. the getComputedStyle method cannot get the real computed value of the 
 * width property, so used a tricky way to get the real computed value of the 
 * said properties. A 'display:none' element can be gotten the corrent value of 
 * its width property by using getComputedStyle method.
 *
 * If the real computed value of 'width' is 'auto', we should check that whether
 * the 'white-space:nowrap' is inherited from the ancestors, then if the
 * children elements will be affected by 'white-space:nowrap', report this
 * issue.
 * If the real computed value of 'width' is not 'auto'. We should check that
 * whether the 'white-space' property is 'nowrap' and the width of the cell is
 * percentage, then if the children elements will be affected by
 * 'white-space:nowrap', and report this issue too.
 */

addScriptToInject(function() {

function isNowrap(element) {
  return chrome_comp.getComputedStyle(element).whiteSpace.indexOf('nowrap') !=
      -1;
}

function isNowrapInherited(element) {
  var table = element.parentElement;
  var tableInlineWhiteSpace = table.style.whiteSpace;
  table.style.whiteSpace = 'normal !important';
  var computedWhiteSpace = chrome_comp.getComputedStyle(element).whiteSpace;
  table.style.whiteSpace = null;
  table.style.whiteSpace =
      (tableInlineWhiteSpace) ? tableInlineWhiteSpace : null;
  return computedWhiteSpace == 'normal';
}

function isChildrenAffectedByCellsWhiteSpace(element) {
  var inlineWhiteSpace = element.style.whiteSpace;
  var op = element.offsetParent;
  var inlineTableWhiteSpace = op.style.whiteSpace;
  var oldWidth = element.offsetWidth;
  element.style.whiteSpace = 'normal !important';
  op.style.whiteSpace = 'normal !important';
  var newWidth = element.offsetWidth;
  element.style.whiteSpace = null;
  element.style.whiteSpace = (inlineWhiteSpace) ? inlineWhiteSpace : null;
  op.style.whiteSpace = null;
  op.style.whiteSpace = (inlineTableWhiteSpace) ? inlineTableWhiteSpace : null;
  return oldWidth > newWidth + 1;
}

function getRealComputedWidth(element) {
  var x = element.cloneNode(false);
  x.style.display = 'none !important';
  var p = element.parentElement;
  if (!p)
    return;
  p.appendChild(x);
  var width = chrome_comp.getComputedStyle(x).width;
  p.removeChild(x);
  x = null;
  return width;
}

function isPercentageWidth(width) {
  return width.slice(-1) == '%' && width != '0%';
}

chrome_comp.CompDetect.declareDetector(

'td_nowrap_inheritence',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if ((node.tagName != 'TH') && (node.tagName != 'TD'))
    return;
  if (!isNowrap(node))
    return;

  var realWidth = getRealComputedWidth(node);
  if (realWidth == undefined)
    return;
  if (realWidth == 'auto') {
    if (isNowrapInherited(node)) {
      if (isChildrenAffectedByCellsWhiteSpace(node))
        this.addProblem('RX1003', [node]);
    }
  } else {
    if (!isPercentageWidth(realWidth)) {
      if (isChildrenAffectedByCellsWhiteSpace(node))
        this.addProblem('RX1003', [node]);
    }
  }
}
); // declareDetector

});
