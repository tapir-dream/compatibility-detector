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

'haslayout_full_shape_space',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.TEXT_NODE != node.nodeType || context.isDisplayNone())
    return;

  // Whether it has full shape space at the end
  var text = node.nodeValue;
  var result = text.match(/^(.*?)(\u3000+)(\s*)$/);
  if (!result)
    return;

  // Whether it's the descendant of a hasLayout element
  for (var parentNode = node.parentElement; parentNode;
       parentNode = parentNode.parentElement) {
    if (parentNode == document.body)
      return;
    if (chrome_comp.hasLayoutInIE(parentNode))
      break;
  }
  if (!parentNode)
    return;

  // Whether it is the last inline element in the line which has width
  var parentNode = node;
  while (parentNode) {
    for (var sibling = parentNode.nextSibling; sibling;
         sibling = sibling.nextSibling) {
      var siblingStyle = chrome_comp.getComputedStyle(sibling);
      if (!siblingStyle || siblingStyle.float != 'none' ||
          (siblingStyle.position != 'static' &&
           siblingStyle.position != 'relative')) {
        continue;
      }
      if (siblingStyle.display.substr(0, 6) != 'inline' ||
          sibling.tagName == 'BR') {
        break;
      } else if (sibling.offsetWidth > 0 ||
                 (sibling.nodeType == Node.TEXT_NODE &&
                  !sibling.nodeValue.replace(/^\s*$/g, ''))) {
        return;
      }
    }
    // Our content is at the end of out parent box. But we need to check
    // the parent style, as the parent's siblings may be just behind us
    // if the parent is also inline (or inline block)
    parentNode = parentNode.parentElement;
    var style = chrome_comp.getComputedStyle(parentNode);
    if (!style)
      return;
    if (style.display != 'inline')
      break;
  }

  var textWithoutFullSpace = result[1];

  function hasDiffBackgroundColor(element) {
    var style = chrome_comp.getComputedStyle(element);
    var color = style && style.backgroundColor;
    if (!color || color == 'rgba(0, 0, 0, 0)')
      return false;
    // Compares our background color with that of parent
    var parentColor;
    var parent = element.parentNode;
    while (parent) {
      var parentStyle = chrome_comp.getComputedStyle(parent);
      parentColor = parentStyle && parentStyle.backgroundColor;
      if (parentColor != 'rgba(0, 0, 0, 0)')
        break;
      parent = parent.parentElement;
    }
    return (parentColor != 'rgba(0, 0, 0, 0)' && color != parentColor);
  }

  function hasTextDecoration(element) {
    var style = chrome_comp.getComputedStyle(element);
    return style.WebkitTextDecorationsInEffect &&
           style.WebkitTextDecorationsInEffect != 'none';
  }

  function hasTextDirection(element){
    var style = chrome_comp.getComputedStyle(element);
    var styleMap = {
      'marginLeft': parseInt(style.marginLeft, 10) | 0,
      'marginRight': parseInt(style.marginRight, 10) | 0,
      'paddingLeft': parseInt(style.paddingLeft, 10) | 0,
      'paddingRight': parseInt(style.paddingRight, 10) | 0,
      'borderLeft': parseInt(style.borderLeftWidth, 10) | 0,
      'borderRight': parseInt(style.borderRightWidth, 10) | 0,
      'direction': style.direction
    };
    if (styleMap.direction == 'ltr')
      return styleMap.marginRight || styleMap.paddingRight || 
        styleMap.borderRight;

    if (styleMap.direction == 'rtl'){
      return styleMap.marginLeft || styleMap.paddingLeft || styleMap.borderLeft;
    }
    return false;
  }

  function checkProblem(parent, child) {
    if (!(parent && child))
      return false;

    if (hasTextDecoration(parent))
      return true;
    // Check parent element style direction is 'ltr' or 'rtl'
    if (hasTextDirection(parent))
      return false;

    function getSiblingBoxes(parent, child) {
      var boxes = [];
      for (var sibling = parent.firstElementChild; sibling;
           sibling = sibling.nextElementSibling) {
        if (sibling != child &&
            sibling.offsetWidth > 0 && sibling.offsetHeight > 0) {
          boxes.push([sibling.offsetLeft, sibling.offsetTop,
                      sibling.offsetWidth, sibling.offsetHeight]);
        }
      }
      return boxes;
    }

    var oldParentLeft = parent.offsetLeft;
    var oldParentTop = parent.offsetTop;
    var oldParentWidth = parent.offsetWidth;
    var oldParentHeight = parent.offsetHeight;
    var oldSiblingBoxes = getSiblingBoxes(parent, child);

    node.nodeValue = textWithoutFullSpace;

    var offsetLeft = parent.offsetLeft;
    var offsetTop = parent.offsetTop;
    var offsetWidth = parent.offsetWidth;
    var offsetHeight = parent.offsetHeight;
    var newSiblingBoxes = getSiblingBoxes(parent, child);

    // Restore old value
    node.nodeValue = text;

    // Check siblings' poisition and size
    for (var i = 0, len = newSiblingBoxes.length; i < len; ++i) {
      for (var j = 0; j < 4; ++j) {
        if (newSiblingBoxes[i][j] != oldSiblingBoxes[i][j])
          return true;
      }
    }

    // Check parent's position and size, if changed, go to parent' parent
    // for more checking, otherwise there's no problem
    if (offsetLeft == oldParentLeft &&
        offsetTop == oldParentTop &&
        offsetWidth == oldParentWidth &&
        offsetHeight == oldParentHeight) {
      return false;
    } else if (offsetLeft != oldParentLeft || offsetTop != oldParentTop) {
      // If parent's position changed, report as a problem
      return true;
    } else {
      var style = chrome_comp.getComputedStyle(parent);
      // parent's size changed, if it has border or has different background
      // color, report as a problem
      if (parseInt(style.borderRightWidth, 10) | 0 > 0 ||
          parseInt(style.borderBottomWidth, 10) | 0 > 0 ||
          hasDiffBackgroundColor(parent)) {
        return true;
      }
    }
    // parent's size changed, but it has neither border nor background
    // color, no visual effect so far. Need more checking
    return checkProblem(parent.parentNode, parent);
  }

  if (checkProblem(node.parentNode, node))
    this.addProblem('BT1025', [node.parentNode]);
}
); // declareDetector

});
