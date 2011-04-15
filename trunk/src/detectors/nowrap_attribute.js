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

/*
 * @fileoverview Check nowrap attribute on all elements.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=43
 *
 * Check DIV DT DD elmement.
 * If meet all of the following 3 conditions, then report issue 'HE1003':
 * 1. It has nowrap attribute or node.noWrap is true.
 * 2. The computed 'white-space' is not 'nowrap'
 * 3. The child is wider than parent.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'nowrap_attribute',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.isTextNodeOverflowContainer = function(container) {
    var containerWidth = container.getBoundingClientRect().width;
    var oldWhiteSpace = container.style.whiteSpace;
    // Set container style property, in order to accurately calculate
    // width vale of the text does not wrap.
    container.style.whiteSpace = 'nowrap !important';
    var childNodes = container.childNodes;
    var result = false;
    for (var i = 0, c = childNodes.length; i < c; ++i) {
      if (childNodes[i].nodeType == Node.TEXT_NODE) {
        var textNodeWidth = chrome_comp.getTextNodeRect(childNodes[i]).width;
        if (textNodeWidth > containerWidth) {
          result = true;
          break;
        }
      }
    }
    container.style.whiteSpace = null;
    container.style.whiteSpace = oldWhiteSpace;
    return result;
  };
},

function checkNode(node, context) {
  // Only detect ELEMENT_NODE and visible Element.
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  var tagName = node.tagName;

  // BODY tag can set nowrap attribute too, it can affect its descendant
  // inline elements, but this situation is very rare in practice, so we
  // do not detect it.
  var CHECK_TAGNAMES = {DIV: true, DT: true, DD: true};

  if (!(tagName in CHECK_TAGNAMES))
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);

  if (computedStyle.whiteSpace == 'nowrap')
    return;

  var hasNoWrapAttribute = node.hasAttribute('nowrap');
  var hasNoWrapProperty = node.hasOwnProperty('noWrap');
  // As long as the node.noWrap is false and whiteSpace style is not
  // nowrap and has nowrap attribute, then IE is no problem.
  // TODO: IE has node.noWrap property, Chrome without it.
  // If js set node.noWrap = true, will is add custom Property in Chrome.
  if (hasNoWrapAttribute && hasNoWrapProperty && !node.noWrap)
     return;

  // HTML has nowrap attribute and node object has not nowrap property.
  if (hasNoWrapAttribute && !hasNoWrapProperty) {
    if (this.isTextNodeOverflowContainer(node))
      this.addProblem('HE1003', {
        nodes: [node],
        details: node.tagName + ' nowrap="' +
            node.getAttribute('nowrap') + '"'
      });
  }

  // HTML has not nowrap attribute and node has nowrap property and it is true.
  if (!hasNoWrapAttribute && hasNoWrapProperty && node.noWrap) {
    if (this.isTextNodeOverflowContainer(node))
      this.addProblem('HE1003', {
        nodes: [node],
        details: node.tagName + '.noWrap=true'
      });
  }
}
); // declareDetector

});
