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

'overflow',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {

  // Check if the node is a table element.
  function isTableElement(node) {
    var TABLELIKE_VALUES = [
      'table', 'inline-table', 'table-row-group', 'table-header-group',
      'table-footer-group', 'table-row', 'table-column-group', 'table-column',
      'table-cell', 'table-caption'
    ];
    var display = chrome_comp.getComputedStyle(node).display;
    return TABLELIKE_VALUES.indexOf(display) != -1;
  }

  // In Chrome, if one of the two values is 'visible' and the other is not,
  // the computed value of the 'visible' one will be converted into 'auto'.
  function overflowIsVisible(node) {
    var style = chrome_comp.getComputedStyle(node);
    if (style.overflow == 'visible')
      return {'xIsVisible': true, 'yIsVisible': true};
    var xIsVisible = false;
    var yIsVisible = false;
    if (style.overflowX == 'auto') {
      var settedOverflowY = node.style.overflowY;
      node.style.overflowY = 'visible !important';
      xIsVisible = style.overflowX == 'visible';
      node.style.overflowY = '';
      node.style.overflowY = settedOverflowY;
    }
    if (style.overflowY == 'auto') {
      var settedOverflowX = node.style.overflowX;
      node.style.overflowX = 'visible !important';
      yIsVisible = style.overflowY == 'visible';
      node.style.overflowX = '';
      node.style.overflowX = settedOverflowX;
    }
    return { 'xIsVisible': xIsVisible, 'yIsVisible': yIsVisible };
  }

  // Some developers using '{content:"."; display:block; visibility:hidden;
  // height:0; clear:both;}' to expand containing blocks.
  // However, if they donot add a rule like 'overflow:hidden', the pseudo
  // element ':after' will holding space in WebKit.
  // This affects the calculation of 'scrollHeight'.
  // Fortunately, it does not expand its containing block visually.
  /* For RD1002
  function pseudoElementDoesNotAffect(node) {
    var pseudoStyle = window.getComputedStyle(node, ':after');
    if (pseudoStyle.display && pseudoStyle.clear) {
      var h0 = node.offsetHeight;
      var settedHeight = node.style.height;
      var settedOverflowX = node.style.overflowX;
      var settedOverflowY = node.style.overflowY;
      node.style.height = 'auto !important';
      node.style.overflowX = 'hidden !important';
      node.style.overflowY = 'hidden !important';
      var h1 = node.offsetHeight;
      node.style.height = '';
      node.style.overflowX = '';
      node.style.overflowY = '';
      node.style.height = settedHeight;
      node.style.overflowX = settedOverflowX;
      node.style.overflowY = settedOverflowY;
      return h1 > h0;
    }
    return true;
  }
  */

  /* For RD1002
  function rectCallback(node) {
    var left = chrome_comp.PageUtil.pageLeft(node);
    var top = chrome_comp.PageUtil.pageTop(node);
    return [
      {
        left: left,
        top: top,
        width: node.offsetWidth,
        height: node.offsetHeight
      },
      {
        left: left,
        top: top,
        width: node.scrollWidth,
        height: node.scrollHeight
      }
    ];
  }
  */

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  // Check whether the contents overflowed from an element.
  /*
  function checkOverflow(node, checkWidth, checkHeight) {
    var overflow = overflowIsVisible(node);
    var isOverflow = false;
    if (checkWidth && overflow.xIsVisible)
        overflow = node.scrollWidth > node.offsetWidth;
    if (checkHeight && overflow.yIsVisible)
        overflow = node.scrollHeight > node.offsetHeight;
    return isOverflow;
  }
  */

  // RX1002 WontFix now.
  /*
  if (node.tagName == 'TABLE') {
    var computedStyle = chrome_comp.getComputedStyle(node);
    if (computedStyle.tableLayout == 'fixed') {
      for (var i = 0; i < node.rows.length; ++i) {
        var row = node.rows[i];
        for (var j = 0; j < row.cells.length; ++j) {
          var cell = row.cells[j];
          if (checkOverflow(cell, true, true))
            this.addProblem('RX1002',
                { nodes: [cell], rectCallback: rectCallback });
        }
      }
    }
  }
  */

  if (chrome_comp.isReplacedElement(node) || isTableElement(node) ||
      node.tagName == "HTML" || node.tagName == "BODY")
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);

  // RD1002
  /*
  // In [IE6 IE7(Q) IE8(Q)], if an element's specified size is not big enouth to
  // contain its child elements, and its 'overflow' is 'visible',
  if (node.scrollWidth > node.clientWidth ||
      node.scrollHeight > node.clientHeight) {
    // To get the computed value of 'width' or 'height', set the 'display'
    // property to 'none' first to ensure the value is correct.
    var settedDisplay = node.style.display;
    node.style.display = 'none !important';
    var widthIsNotAuto = computedStyle.width != 'auto';
    var heightIsNotAuto = computedStyle.height != 'auto';
    node.style.display = '';
    node.style.display = settedDisplay;
    // Get the specified value of 'overflow'.
    var overflow = overflowIsVisible(node);
    if ((overflow.xIsVisible && widthIsNotAuto) ||
        (overflow.yIsVisible && heightIsNotAuto)) {
      var elPool = [];
      var descentElements =
          Array.prototype.slice.call(node.getElementsByTagName('*'));
      // An element has negative margin, a abosolute positioned element,
      // or a relative positioned element won't expand the containing
      // element's size.
      // So we clean the settings or hide absolute elements first.
      for(var i = 0, l = descentElements.length; i < l; i++) {
        var el = descentElements[i];
        var settedStyle = {};
        var style = chrome_comp.getComputedStyle(el);
        if (parseInt(style.marginTop) < 0) {
          settedStyle.marginTop = el.style.marginTop;
          el.style.marginTop = '0 !important';
        }
        if (parseInt(style.marginRight) < 0) {
          settedStyle.marginRight = el.style.marginRight;
          el.style.marginRight = '0 !important';
        }
        if (parseInt(style.marginBottom) < 0) {
          settedStyle.marginBottom = el.style.marginBottom;
          el.style.marginBottom = '0 !important';
        }
        if (parseInt(style.marginLeft) < 0) {
          settedStyle.marginLeft = el.style.marginLeft;
          el.style.marginLeft = '0 !important';
        }
        if (style.position == 'relative') {
          settedStyle.position = el.style.position;
          el.style.position = 'static !important';
        } else if (style.position == 'absolute') {
          settedStyle.display = el.style.display;
          el.style.display = 'none !important';
        }
        // Save styles if we cleaned them.
        if ('marginTop' in settedStyle || 'marginRight' in settedStyle ||
            'marginBottom' in settedStyle || 'marginLeft' in settedStyle ||
            'position' in settedStyle || 'display' in settedStyle)
          elPool.push({'el': el, 'settedStyle': settedStyle});
      }
      if ((overflow.xIsVisible && widthIsNotAuto &&
          node.scrollWidth > node.clientWidth) ||
          (overflow.yIsVisible && heightIsNotAuto &&
          node.scrollHeight > node.clientHeight)) {
        // Pseudo elements maybe expand the containing block.
        if (!heightIsNotAuto ||
            heightIsNotAuto && pseudoElementDoesNotAffect(node)) {
          this.addProblem('RD1002',
              { nodes: [node], rectCallback: rectCallback });
        }
      }
      // Restore cleaned styles.
      if (elPool.length) {
        for (var i = 0, l = elPool.length; i < l; i++) {
          var elementAndStyle = elPool[i];
          for (var s in elementAndStyle.settedStyle) {
            elementAndStyle.el.style[s] = '';
            elementAndStyle.el.style[s] = elementAndStyle.settedStyle[s];
          }
        }
      }
    }
  }
  */

  // RV1001
  // For an element specified values of 'overflow-x' and 'overflow-y', if one of
  // them is 'visible' and the other is 'hidden', and its content overflow from
  // its content box, the element will generate a scroll bar in [Chrome], but
  // not in [IE6 IE7 IE8].

  // The element's content box must be visible.
  if (node.clientWidth && node.clientHeight) {
    var overflowX = computedStyle.overflowX;
    var overflowY = computedStyle.overflowY;
    if ((overflowX == 'hidden' && overflowY == 'auto') ||
        (overflowX == 'auto' && overflowY == 'hidden')) {
      // Is the 'auto' value is converted from 'visible'?
      var overflow = overflowIsVisible(node);
      if ((overflow.xIsVisible && node.scrollWidth > node.clientWidth) ||
          (overflow.yIsVisible && node.scrollHeight > node.clientHeight)) {
        this.addProblem('RV1001', [node]);
      }
    }
  }

  // RV1002
  // For a absolute positioned element, if it overflows its container which
  // 'overflow' is not 'visible', [IE6(Q) IE7(Q) IE8(Q)] cut out the overflow
  // part, but [IE6(S) IE7(S) IE8(S) Chrome] dosn't.
  // For a relative positioned element, if it overflows its container which
  // 'overflow' is not 'visible', [IE6(Q) IE7(Q) IE8 Chrome] cuts out the
  // overflow part, but [IE6(S) IE7(S)] dosn't.

  // The element's border box must be visible.
  if ((node.offsetWidth && node.offsetHeight) &&
      ((chrome_comp.inQuirksMode() && computedStyle.position == 'absolute') ||
      (!chrome_comp.inQuirksMode() && computedStyle.position == 'relative'))) {
    var parentElement = node;
    while ((parentElement = parentElement.parentElement) &&
        !isTableElement(parentElement) &&
        parentElement.tagName != "BUTTON" &&
        parentElement.tagName != "BODY" ) {
      var style = chrome_comp.getComputedStyle(parentElement);
      if (style.position != 'static')
        break;
      // In Chrome, the value of 'overflow' is computed from the values of
      // 'overflow-x' and 'overflow-y', and the value of 'overflow' will not
      // be 'visible' if one of 'overflow-x' and 'overflow-y' is not 'visible'.
      // So we check 'overflow' here, that's enough.
      if (style.overflow != 'visible') {
        var pRect = parentElement.getBoundingClientRect();
        var cRect = node.getBoundingClientRect();
        if (cRect.left < pRect.left || cRect.right > pRect.right ||
            cRect.top < pRect.top || cRect.bottom > pRect.bottom) {
          this.addProblem('RV1002', [parentElement, node]);
          break;
        }
      }
    }
  }
}
); // declareDetector

});
