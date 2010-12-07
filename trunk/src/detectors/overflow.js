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
  function isTableElement(node) {
    var TABLELIKE_VALUES = ['table', 'inline-table', 'table-row-group',
        'table-header-group', 'table-footer-group', 'table-row',
        'table-column-group','table-column','table-cell','table-caption'];
    var display = chrome_comp.getComputedStyle(node).display;
    return TABLELIKE_VALUES.indexOf(display) != -1;
  }

  function checkOverflow(node, checkWidth, checkHeight) {
    var computedStyle = chrome_comp.getComputedStyle(node);
    if (computedStyle.overflow == 'visible') {
      var overflow = false;
      if (checkWidth)
        overflow = node.scrollWidth > node.offsetWidth;
      if (!overflow && checkHeight)
        overflow = node.scrollHeight > node.offsetHeight;
      return overflow;
    }
  }

  // Some developers using '{content:"."; display:block; visibility:hidden;
  // height:0; clear:both;}' to expand containing blocks.
  // However, if they donot add a rule like 'overflow:hidden', the pseudo
  // element ':after' will holding space in WebKit.
  // This affects the calculation of 'scrollHeight'.
  // Fortunately, it does not expand its containing block visually.
  function pseudoElementDoesNotAffect(node) {
    var pseudoStyle = window.getComputedStyle(node, ':after');
    if (pseudoStyle.display && pseudoStyle.clear) {
      var h0 = node.offsetHeight;
      var settedHeight = node.style.height;
      var settedOverflowX = node.style.overflowX;
      var settedOverflowY = node.style.overflowY;
      node.style.height = 'auto';
      node.style.overflowX = 'hidden';
      node.style.overflowY = 'hidden';
      var h1 = node.offsetHeight;
      node.style.height = settedHeight;
      node.style.overflowX = settedOverflowX;
      node.style.overflowY = settedOverflowY;
      return h1 > h0;
    }
    return true;
  }

  function rectCallback(node) {
    var left = chrome_comp.PageUtil.pageLeft(node);
    var top = chrome_comp.PageUtil.pageTop(node);
    return [{
      left: left,
      top: top,
      width: node.offsetWidth,
      height: node.offsetHeight
    }, {
      left: left,
      top: top,
      width: node.scrollWidth,
      height: node.scrollHeight
    }];
  }

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
  return;

// RX1002 WontFix now.

//  if (node.tagName == 'TABLE') {
//    var computedStyle = chrome_comp.getComputedStyle(node);
//    if (computedStyle.tableLayout == 'fixed') {
//      for (var i = 0; i < node.rows.length; ++i) {
//        var row = node.rows[i];
//        for (var j = 0; j < row.cells.length; ++j) {
//          var cell = row.cells[j];
//          if (checkOverflow(cell, true, true))
//            this.addProblem('RX1002',
//                { nodes: [cell], rectCallback: rectCallback });
//        }
//      }
//    }
//  } else {

  if (chrome_comp.isReplacedElement(node) || isTableElement(node) ||
      node.tagName == "HTML" || node.tagName == "BODY")
  return;

  var computedStyle = chrome_comp.getComputedStyle(node);

  //RD1002
  if (checkOverflow(node, true, true)) {
    // To get the computed value of 'width' or 'height', set the 'display'
    // property to 'none' first to ensure the value is correct.
    var settedDisplay = node.style.display;
    node.style.display = 'none !important';
    var cWidthIsNotAuto = computedStyle.width != 'auto';
    var cHeightIsNotAuto = computedStyle.height != 'auto';
    var cOverflowIsVisible = computedStyle.overflow == 'visible';
    node.style.display = '';
    node.style.display = settedDisplay;
    if (cOverflowIsVisible && (cWidthIsNotAuto || cHeightIsNotAuto)) {
      var elPool = [];
      var descentElements = node.getElementsByTagName('*');
      // Negative margin or relative positioned element won't expand the
      // containing element's size. So we clean the settings first.
      for(var i = 0; i < descentElements.length; i++) {
        var el = descentElements[i];
        var settedStyle = {};
        var computedStyle = chrome_comp.getComputedStyle(el);
        if (parseInt(computedStyle.marginTop) < 0){
          settedStyle.marginTop = el.style.marginTop;
          el.style.marginTop = '0 !important';
        }
        if (parseInt(computedStyle.marginRight) < 0){
          settedStyle.marginRight = el.style.marginRight;
          el.style.marginRight = '0 !important';
        }
        if (parseInt(computedStyle.marginBottom) < 0){
          settedStyle.marginBottom = el.style.marginBottom;
          el.style.marginBottom = '0 !important';
        }
        if (parseInt(computedStyle.marginLeft) < 0){
          settedStyle.marginLeft = el.style.marginLeft;
          el.style.marginLeft = '0 !important';
        }
        if (computedStyle.position == 'relative'){
          settedStyle.position = el.style.position;
          el.style.position = 'static !important';
        }
        // Save styles if we cleaned them.
        if ('marginTop' in settedStyle || 'marginRight' in settedStyle ||
            'marginBottom' in settedStyle || 'marginLeft' in settedStyle ||
            'position' in settedStyle)
          elPool.push({'el': el, 'settedStyle': settedStyle});
      }
      if (checkOverflow(node, cWidthIsNotAuto, cHeightIsNotAuto)) {
        // Pseudo elements maybe expand the containing block, see overflow.html
        // - 'None - pseudo' part.
        if (!cHeightIsNotAuto ||
            cHeightIsNotAuto && pseudoElementDoesNotAffect(node)) {
          this.addProblem('RD1002',
              { nodes: [node], rectCallback: rectCallback });
        }
      }
      // Restore cleaned styles.
      if (elPool.length) {
        for (var i = 0; i < elPool.length; i++) {
          var elementAndStyle = elPool[i];
          for (var s in elementAndStyle.settedStyle) {
            elementAndStyle.el.style[s] = '';
            elementAndStyle.el.style[s] = elementAndStyle.settedStyle[s];
          }
        }
      }
    }
  }

  // RV1001
  // The element must be visible.
  if (node.offsetWidth && node.offsetHeight) {
    var overflowX = computedStyle.overflowX;
    var overflowY = computedStyle.overflowY;
    if (overflowX == 'auto' || overflowY == 'auto') {
      var xVisible = false;
      var yVisible = false;
      if (overflowX == 'auto') {
        var settedOverflowY = node.style.overflowY;
        node.style.overflowY = 'visible !important';
        xVisible = computedStyle.overflowX == 'visible';
        node.style.overflowY = '';
        node.style.overflowY = settedOverflowY;
      }
      if (overflowY == 'auto') {
        var settedOverflowX = node.style.overflowX;
        node.style.overflowX = 'visible !important';
        yVisible = computedStyle.overflowY == 'visible';
        node.style.overflowX = '';
        node.style.overflowX = settedOverflowX;
      }
      if ((xVisible && !yVisible && node.scrollWidth > node.offsetWidth) ||
          (!xVisible && yVisible && node.scrollHeight > node.offsetHeight)) {
        this.addProblem('RV1001', [node]);
      }
    }
  }

  //RV1002



  if (!chrome_comp.inQuirksMode()) {
    var style = chrome_comp.getComputedStyle(node);
    if (style && style.position == 'relative') {
      var parentNode = node.parentNode;
      var parentStyle = chrome_comp.getComputedStyle(parentNode);
      if (parentStyle.overflow != 'hidden' ||
          parentStyle.position == 'relative' ||
          parentStyle.position == 'absolute')
        return;
      // If there is overflow, chrome cuts out the overflow part, but
      // scroll size is still larger than offset size. While in IE6/7
      // standard mode, the overflow part is not cut out
      if (parentNode.offsetWidth < parentNode.scrollWidth ||
          parentNode.offsetHeight < parentNode.scrollHeight) {
        // Make sure the parent's overflow is caused by this node
        var oldDisplay = node.style.display;
        node.style.display = 'none';
        if (parentNode.offsetWidth == parentNode.scrollWidth &&
            parentNode.offsetHeight == parentNode.scrollHeight) {
          this.addProblem('RV1002', [node, parentNode]);
        }
        node.style.display = oldDisplay;
      }
    }
  }
//  }
}
); // declareDetector

});
