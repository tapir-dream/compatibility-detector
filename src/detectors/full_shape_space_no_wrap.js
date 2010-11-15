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

'full_shape_space_no_wrap',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (context.isDisplayNone())
    return;
  if (!(Node.TEXT_NODE == node.nodeType && node.nodeValue.match(/\u3000$/g)))
    return;
  var parentNode = node.parentNode;
  if (!parentNode)
    return;

  // The parent element node must be inline, not float and not absolute
  // positioned
  var style = chrome_comp.getComputedStyle(parentNode);
  if (!style || style.display != 'inline' || style.float != 'none' ||
      !(style.position == 'relative' || style.position == 'static'))
    return;

  // The parent element node must have prev element sibling that is inline
  // or float
  var prevNode = parentNode.previousElementSibling;
  if (!(prevNode && prevNode.offsetWidth > 0))
    return;
  var prevStyle = chrome_comp.getComputedStyle(prevNode);
  if (!prevStyle ||
      !(prevStyle.display == 'inline' || prevStyle.float == 'left'))
    return;

  var staticLeft = parentNode.offsetLeft;
  var staticTop = parentNode.offsetTop;
  if (style.position == 'relative') {
    var tmpLeft = parseInt(style.left);
    if (tmpLeft)
      staticLeft = parentNode.offsetLeft - tmpLeft;
    var tmpTop = parseInt(style.top);
    if (tmpTop)
      staticTop = parentNode.offsetTop - tmpTop;
  }
  var staticRight = staticLeft + parentNode.offsetWidth;
  if (staticRight > parentNode.parentNode.offsetWidth) {
    // In IE8(s), the node overflows out of the containing block in current
    // line, while in others, it wraps into a new line.
    this.addProblem('BX1009', [parentNode]);
  } else {
    if (staticLeft == 0) {
      if (!node.nodeValue.replace(/\u3000/g, '')) {
        // In IE8(s), this pure full shape space node is appended to the last
        // line and overflows out of the containing block.
        this.addProblem('BX1009', [parentNode]);
      }
    }
    var nextNode = parentNode.nextElementSibling;
    if (nextNode) {
      var nextStyle = chrome_comp.getComputedStyle(nextNode);
      if (nextStyle.float == 'left') {
        var nextStaticTop = nextNode.offsetTop;
        if (nextStyle.position == 'relative') {
          var tmpTop = parseInt(nextStyle.top);
          if (tmpTop)
            nextStaticTop = nextNode.offsetTop - tmpTop;
        }
        var sumWidth = staticRight + nextNode.offsetWidth;
        // If the next float sibling is put to the next line due to the
        // width limit of containing block.
        if (nextStaticTop > staticTop &&
            sumWidth > parentNode.parentNode.offsetWidth) {
          this.addProblem('BX1009', [parentNode, nextNode]);
          return;
        }
      }
    }
  }
}
); // declareDetector

});
