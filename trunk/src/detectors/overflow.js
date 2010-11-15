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
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

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

  if (node.tagName == 'TABLE') {
    var computedStyle = chrome_comp.getComputedStyle(node);
    if (computedStyle && computedStyle.tableLayout == 'fixed') {
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
  } else {
    // Doesn't apply to replaced element
    if (chrome_comp.isReplacedElement(node))
      return;

    if (node.tagName == 'TD') {
      var tableStyle =
          chrome_comp.getComputedStyle(node.parentNode.parentNode.parentNode);
      // The cell has been checked above
      if (tableStyle && tableStyle.tableLayout == 'fixed')
        return;
    }

    var width = chrome_comp.getDefinedStylePropertyByName(node, false, 'width');
    var height =
        chrome_comp.getDefinedStylePropertyByName(node, false, 'height');
    var checkWidth = parseFloat(width) > 0;
    var checkHeight = parseFloat(height) > 0;
    if (checkOverflow(node, checkWidth, checkHeight))
      this.addProblem('RD1002', { nodes: [node], rectCallback: rectCallback });

    var overflowX = chrome_comp.getDefinedStylePropertyByName(
        node, false, 'overflow-x');
    var overflowY = chrome_comp.getDefinedStylePropertyByName(
        node, false, 'overflow-y');
    function isVisible(overflow) {
      return !overflow || overflow == 'visible';
    }
    var xVisible = isVisible(overflowX);
    var yVisible = isVisible(overflowY);
    if ((xVisible && !yVisible) || (!xVisible && yVisible)) {
      if ((xVisible && node.scrollWidth > node.offsetWidth) ||
          (yVisible && node.scrollHeight > node.offsetHeight)) {
        this.addProblem('RV1001', [node]);
      }
    }

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
  }
}
); // declareDetector

});
