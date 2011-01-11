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
 * @fileoverview: One detector implementation for checking that if the table
 * cell set the width is stretched.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=35
 *
 * Though we set a width for a table cell, it does not stand for using that
 * value necessarily. The cell may be computed as another value for some reason.
 * If a cell is set the width (its value of the width property is not auto),
 * stretched, and content in the cell will not align by the computed value but
 * by the setting value in IE6, IE7 and IE8 quirks mode.
 *
 * First of all, check all table cell elements which are set the absolute width
 * (not 'auto' and the percentage).
 * Get the real value and the setting value of the cell. Here the real value can
 * be gotten by getComputedStyle method, and setting value is the computed value
 * in W3C CSS2.1 specification. But the getComputedStyle method cannot get the
 * real computed value of the width property, so used a tricky way to get the
 * real computed value of the said properties. A 'display:none' element can be
 * gotten the corrent value of its width property by using getComputedStyle
 * method.
 *
 * So we get the two principal values. Second is to get the value of
 * 'text-align' property because we do not consider the left-aligned element.
 *
 * At last, if the cell is really stretched by the table and not by its
 * contents, and contains the inflow content, we report this issue.
 */

addScriptToInject(function() {

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

function isStretched(element) {
  var table = element.offsetParent;
  var inlineWidth = table.style.width;
  var oldWidth = element.offsetWidth;
  table.style.width = '0px !important';
  var newWidth = element.offsetWidth;
  table.style.width = null;
  table.style.width = (inlineWidth) ? inlineWidth : null;
  return oldWidth == newWidth;
}

function isPercentageWidth(width) {
  return width.slice(-1) == '%' && width != '100%';
}

function hasBackground(element) {
  var style = chrome_comp.getComputedStyle(element);
  if ((!style.backgroundColor || style.backgroundColor == 'transparent' ||
      style.backgroundColor == chrome_comp.COLOR_TRANSPARENT) &&
      (!style.backgroundImage || style.backgroundImage == 'none'))
    return false;
  return true;
}

function hasInflowContent(element) {
  var ch = element.childNodes;
  if (ch.length == 0)
    return false;
  if (ch.length == 1 && ch[0].nodeType == 3 && /^\s+$/g.test(ch[0].nodeValue))
    return false
  for (var i = 0, j = ch.length; i < j; i++) {
    if (ch[i].nodeType == 3) {
      if (!/^\s+$/g.test(ch[i].nodeValue))
        return true;
    } else if (ch[i].nodeType == 1) {
      var style = chrome_comp.getComputedStyle(ch[i]);
      if (style.position != 'absolute' && style.position != 'fixed' &&
          style.float == 'none')
        return arguments.callee(ch[i])
      else
        return false;
    }
  }
  return false;
}

chrome_comp.CompDetect.declareDetector(

'stretched_cell_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

 if (node.tagName != 'TD' && node.tagName != 'TH')
    return;

  var realWidth = getRealComputedWidth(node);
  if (realWidth == undefined)
    return;
  if (realWidth == 'auto')
    return;

  if (isPercentageWidth(realWidth))
    return;

  var usedWidth = parseInt(chrome_comp.getComputedStyle(node).width, 10);
  var computedWidth = parseInt(getRealComputedWidth(node), 10);
  var textAlign = chrome_comp.getComputedStyle(node).textAlign;
  if ((usedWidth <= computedWidth))
    return;
  if (((textAlign.indexOf('left') != -1) || (textAlign.indexOf('auto') != -1)))
    return;
  if ((!isStretched(node)) && (hasInflowContent(node)))
    this.addProblem('RE8014', [node]);

}
); // declareDetector

});
