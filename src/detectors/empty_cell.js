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

function hasMargin(style) {
  return parseInt(style.marginLeft, 10) || parseInt(style.marginTop, 10) ||
         parseInt(style.marginRight, 10) || parseInt(style.marginBottom, 10);
}

function hasPadding(style) {
  return parseInt(style.paddingLeft, 10) || parseInt(style.paddingTop, 10) ||
         parseInt(style.paddingRight, 10) || parseInt(style.paddingBottom, 10);
}

function hasBorder(style) {
  return parseInt(style.borderLeftWidth, 10) ||
         parseInt(style.borderTopWidth, 10) ||
         parseInt(style.borderRightWidth, 10) ||
         parseInt(style.borderBottomWidth, 10);
}

function isEmptyNode(node, cell) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      var whiteSpace = chrome_comp.getComputedStyle(node.parentNode).whiteSpace;
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
          if (hasMargin(style) || hasPadding(style) || hasBorder(style))
            return false;
          break;
        case 'block':
          if (hasPadding(style) || hasBorder(style)) {
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
      if (style.position == 'relative' || chrome_comp.hasLayoutInIE(node))
        return false;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (!isEmptyNode(child, null))
          return false;
      }
      return true;
    default:
      return true;
  }
  var style = chrome_comp.getComputedStyle(node);

}

function isEmptyCell(cell) {
  for (var node = cell.firstChild; node; node = node.nextSibling) {
    if (!isEmptyNode(node, cell))
      return false;
  }
  return true;
}

function isEmptyChild(node) {
  var childElements =
          Array.prototype.slice.call(node.getElementsByTagName('*'));
  for (var i = 0, l = childElements.length; i < l; i++) {
    if (chrome_comp.hasLayoutInIE(childElements[i]) ||
        childElements[i].tagName == 'IFRAME' ||
        childElements[i].tagName == 'OBJECT' ||
        childElements[i].tagName == 'EMBED')
      return false;
  }
  if (getFixedNodeTextContent(node) == '')
    return true;
  return false;
}

//match script and style element content fix textContent return text
//don't use 'node.cloneNode(true).innerText ' it will trigger RCA SD9029
function getFixedNodeTextContent(node) {
  var scriptElements =
          Array.prototype.slice.call(node.getElementsByTagName('script'));
  var styleElements =
          Array.prototype.slice.call(node.getElementsByTagName('style'));
  var nodeValue = node.textContent;
  for (var i = 0, l = scriptElements.length; i < l; i++)
    nodeValue = nodeValue.replace(scriptElements[i].textContent, '');
  for (var i = 0, l = styleElements.length; i < l; i++)
    nodeValue = nodeValue.replace(styleElements[i].textContent, '');
  return nodeValue;
}


chrome_comp.CompDetect.declareDetector(

'empty_cell',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName == 'TD' || node.tagname == 'TH') {
    var style = chrome_comp.getComputedStyle(node);
    if (style.emptyCells == 'hide')
      return;

    var mayHaveRE1012 = style.borderCollapse != 'collapse' && hasBorder(style);
    var mayHaveRE1013 = false;
    var nodePaddingTop = parseInt(style.paddingTop, 10) | 0;
    var nodePaddingBottom = parseInt(style.paddingBottom, 10) | 0;

    //fix empty cell padding is 1px
    nodePaddingTop = (nodePaddingTop == 1) ? 0 : nodePaddingTop;
    nodePaddingBottom = (nodePaddingBottom == 1) ? 0 : nodePaddingBottom;

    if (nodePaddingTop || nodePaddingBottom) {
      var nodeHeight = parseInt(
          chrome_comp.getDefinedStylePropertyByName(node, true, 'height'),
          10) | 0;
      //fix cell getCompatStyle height is null
      nodeHeight = nodeHeight ||
        (parseInt(node.getAttribute('height'), 10) | 0);
      var nodeClientHeight = node.clientHeight | 0;
      var nodePaddingHeight = nodePaddingTop + nodePaddingBottom;

      if (nodeHeight < nodePaddingHeight &&
          !(nodePaddingHeight < nodeClientHeight))
          mayHaveRE1013 = true;
    }
    //filter child nodes is haslayout and empty elements
    if (mayHaveRE1012 && isEmptyChild(node))
      this.addProblem('RE1012', [node]);
    if (mayHaveRE1013 && isEmptyCell(node))
      this.addProblem('RE1013', [node]);
  }
}
); // declareDetector

});
