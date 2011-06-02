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
 * @fileoverview Checking the empty cells.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=11
 *      https://code.google.com/p/compatibility-detector/issues/detail?id=12
 *
 * In the separated borders model, the border of the empty cell will disappear
 * in some cases. And the 'padding-top' and 'padding-bottom' of the empty cell
 * will disappear in IE6, IE7 and IE8 quirks mode.
 *
 * The detector check all table cell elements (TD and TH), ignoring the
 * invisible and 'empty-cells:hidden' elements.
 * Check that if the table is using the separated borders model and the present
 * cell is set the border.
 * Check the descendant elements to determine that the cell is real empty, then
 * report this issue.
 */


addScriptToInject(function() {

function isEmptyNode(node, cell) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      var whiteSpace =
          chrome_comp.getComputedStyle(node.parentNode).whiteSpace;
      return !(whiteSpace == 'pre' ?
          node.nodeValue : chrome_comp.trim(node.nodeValue));
    case Node.ELEMENT_NODE:
      if (node.tagName == 'BR' || node.tagName == 'HR')
        return false;
      var style = chrome_comp.getComputedStyle(node);
      switch (style.display) {
        case 'none':
          return true;
        case 'inline':
          if (chrome_comp.isReplacedElement(node))
            return false;
          if (chrome_comp.hasMargin(node) ||
              chrome_comp.hasPadding(node) ||
              chrome_comp.hasBorder(node)) {
              console.log(node)
            return false;
            }
          break;
        case 'block':
          if (chrome_comp.hasPadding(node) || chrome_comp.hasBorder(node)) {
            if (cell) {
              var lastChildOfCell = cell.lastChild;
              if (Node.TEXT_NODE == lastChildOfCell.nodeType)
                lastChildOfCell = lastChildOfCell.previousSibling;
              if (node == lastChildOfCell)
                return true;
            }
            return false;
          }
          break;
        default:
          return false;
      }
      var position = style.position;
      if (position == 'absolute')
        return true;
      if (style.position == 'relative' ||
          chrome_comp.hasLayoutInIE(node) ||
          node.tagName == 'IFRAME' ||
          node.tagName == 'OBJECT' ||
          node.tagName == 'EMBED')
        return false;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (!isEmptyNode(child, null))
          return false;
      }
      return true;
    default:
      return true;
  }
}

function isEmptyCell(cell) {
  for (var node = cell.firstChild; node; node = node.nextSibling) {
    if (!isEmptyNode(node, cell))
      return false;
  }
  if (chrome_comp.trim(cell.innerText) == '')
    return true;
  return false;
}

chrome_comp.CompDetect.declareDetector(

'empty_cell',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (!(node.tagName == 'TD' || node.tagName == 'TH'))
    return;

  var style = chrome_comp.getComputedStyle(node);
  if (style.emptyCells == 'hide')
    return;

  var mayHaveRE1012 = style.borderCollapse != 'collapse' &&
      chrome_comp.hasBorder(node);
  var mayHaveRE1013 = false;
  var nodePaddingTop = chrome_comp.toInt(style.paddingTop);
  var nodePaddingBottom = chrome_comp.toInt(style.paddingBottom);

  // Fix empty cell padding is 1px.
  nodePaddingTop = (nodePaddingTop == 1) ? 0 : nodePaddingTop;
  nodePaddingBottom = (nodePaddingBottom == 1) ? 0 : nodePaddingBottom;

  if (nodePaddingTop || nodePaddingBottom) {
    // Fix cell getComputStyle height is null.
    var nodeHeight = chrome_comp.toInt(chrome_comp.getSpecifiedStyleValue(
        node, 'height')) || chrome_comp.toInt(node.getAttribute('height'));

    var nodeClientHeight = node.clientHeight;
    var nodePaddingHeight = nodePaddingTop + nodePaddingBottom;

    // Check set height and padding top to bottom height value,
    // client height is table-cell actual render height.
    // if empty cell, the cell set height value less the padding height value,
    // then IE padding fail render cell hight will hava different.
    // if the cell distraction by other cells, then IE has not render different.
    if (nodeHeight < nodePaddingHeight &&
        !(nodePaddingHeight < nodeClientHeight - nodeHeight))
      mayHaveRE1013 = true;
  }

  // Filter child nodes is haslayout and empty elements.
  if (mayHaveRE1012 && isEmptyCell(node))
    this.addProblem('RE1012', [node]);
  if (mayHaveRE1013 && isEmptyCell(node))
    this.addProblem('RE1013', [node]);

}
); // declareDetector

});
