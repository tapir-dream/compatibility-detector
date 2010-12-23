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
 * @fileoverview: One detector implementation for checking influence of the
 * 'text-align' property on the block level elements.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=34
 *
 * The 'text-align' property can apply to all kinds of elements including the
 * block level elements in W3C CSS 1 specification which IE6, IE7 and IE8
 * quirks mode follow, but in CSS2.1 specification, it changes to applying to
 * only the inline level elements or contents. So, this property can apply to
 * the block level elements in the said versions of IE.
 *
 * The detector check all nodes, and do the following treatment:
 * 1. Ignore all text nodes, invisible elements and the elements having no
 *    parent.
 * 2. Ignore the standards mode in IE.
 * 3. Check the elements set the 'text-align' property.
 * 4. Check the elements whose left margin and right margin are the same. If
 *    no, report the issue.
 * 5. Check the elements whose right margin is 0 and is not floating right. If
 *    yes, report the issue.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'text_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

function construtor() {
  this.getCompatMode_ = function() {
    function isIEDTDBug() {
      var html = document.documentElement
      var prev = html;
      while (prev.previousSibling)
        prev = prev.previousSibling;
      if (prev && prev.nodeType == 8)
        return true;
    }

    var doctypeInIE;
    var doctypeInWebKit
    var diffMap;
    var pid = (document.doctype) ? document.doctype.publicId : 0;
    var sid = (document.doctype) ? document.doctype.systemId : 0;
    var cm = document.compatMode.toLowerCase();
    doctypeInIE = doctypeInWebKit = (cm == 'backcompat') ? 'Q' : 'S';
    if (isIEDTDBug()) {
      doctypeInIE = 'Q';
    }
    diffMap = {
      '-//W3C//DTD HTML 4.0 Transitional//EN': {
        'systemId': 'http://www.w3.org/TR/html4/loose.dtd',
        'IE': 'S',
        'WebKit': 'Q'
      },
      'ISO/IEC 15445:2000//DTD HTML//EN': {
        'systemId': '',
        'IE': 'Q',
        'WebKit': 'S'
      },
      'ISO/IEC 15445:1999//DTD HTML//EN': {
        'systemId': '',
        'IE': 'Q',
        'WebKit': 'S'
      }
    }
    if (diffMap[pid]) {
      if (diffMap[pid]['systemId'] == sid) {
        doctypeInIE = diffMap[pid]['IE'];
        doctypeInWebKit = diffMap[pid]['WebKit'];
      }
    }
    return {
      doctypeInIE: doctypeInWebKit,
      doctypeInWebKit: doctypeInWebKit
    };
  }();
}, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (this.getCompatMode_.doctypeInIE === 'S')
    return;

  var style = chrome_comp.getComputedStyle(node);
  var display = style.display;
  var textAlign = style.textAlign;
  var direction = style.direction;

  if ((display == 'block' || display == 'inline-block' ||
      display == 'table-cell') &&
      (textAlign == 'center' ||
      (direction == 'ltr' && textAlign == 'right') ||
      (direction == 'rtl' && textAlign == 'left'))) {
    var parentElementMaxWidth = parseInt(node.style.width, 10);
    var child = node.firstElementChild;
    do {
      if (child) {
        var childStyle = chrome_comp.getComputedStyle(child);
        if (childStyle.display == 'block' &&
            childStyle.float == 'none' &&
            (childStyle.position == 'static' ||
            childStyle.position == 'relative')) {
          var childWidth = parseInt(child.style.width, 10) +
              parseInt(childStyle.paddingLeft, 10) +
              parseInt(childStyle.paddingRight, 10);
          if (Math.abs(parseInt(childStyle.marginLeft, 10) -
              parseInt(childStyle.marginRight, 10)) > 1 &&
              childWidth + 1 < parentElementMaxWidth) {
            this.addProblem('RT8003', {
              nodes: [node],
              details: parentElementMaxWidth + 'vs' + childWidth
            });
            return;
          }
        }
        child = child.nextElementSibling;
      }
    } while (child && child != node.lastElementChild);
  }
}
); // declareDetector

});
