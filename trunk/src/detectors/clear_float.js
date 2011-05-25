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
 * @fileoverview Check floating layout of not clear floating or
 * clear floating fail or use IE hasLayout.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=155
 * Floating layout is a common layout. IE will calculate the height of the
 * container which is hasLayout. In CSS2.1 only the container which
 * establishes new block formatting context will have this behaviour.
 * And if a have 'clearance' style element appears after the floating elements,
 * there is no difference in all browsers.
 *
 * Detecting steps:
 * 1. Ignore the HTML BODY FORM A elements.
 * 2. Ignore the element who has no descendant floats.
 * 3. Ignore the elements which is hasLayout and establishes new block
 *    formatting context.
 * 4. Ignore normal floating layout without ':after' pseudo-elements on which
 *    setting 'clear' property, and not hasLayout, and not establishes a block
 *    formatting context.
 * 5. Ignore this case: If a element who is not established a block
 *    formatting context and its descendant floats are not overflow.
 * 6. Ignore set the element hight layout (this is set hasLayout in IE) of
 *    the not use ':after' pseudo-element processing floating Layout, and
 *    floating layout is not overflow ancestor element, and element not set
 *    new block formatting context.
 * 7. Ignore set pseudo element ':after' clear floating, and triggered
 *    IE hasLayout.
 * 8. Check if childer have the floating, and layout is not clear floating,
 *    and use pseudo element ':after' clear floating, report the IE6 issue.
 * 9. Check if the element triggered hasLayout in IE or block formatting
 *    contexts, if childer have not clear the floating elements.
 *    report the IE or other issue.
 * 10.Check if the element display style is 'table-xxxx', if childer have
 *    not clear the floating elements, report the IE6/7 issue.
 * 11.Check if the element layout clear floating fail, and set hasLayout
 *    in IE or new block formatting context, report the IE or other issue.
 *
 * ps: This detector not detection use CSS hack.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'clear_float',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {

  this.floatNode = null;

  /**
   * Get child nodes float or clear style is not 'none'.
   * @param {Element} node
   * @param {string} styleName is 'float' or 'clear'
   * @return {Array.<Element>} node array
   */
  this.getVisibleChildrenByFloatOrClear = function(node, styleName) {
    var children = Array.prototype.slice.call(node.children);
    var nodes = [];
    for (var i = 0, c = children.length; i < c; ++i) {
      var childNode = children[i];
      var computedStyle = chrome_comp.getComputedStyle(childNode);
      if (styleValue = computedStyle[styleName] != 'none' &&
          computedStyle.display != 'none' &&
          childNode.offsetHeight > 0)
        nodes.push(childNode);
    }
    return nodes;
  };

  /**
   * Check subsequent element clear floating of the node.
   *
   * A.
   * +--------------------------------------------+
   * |  +-------------------------------+         |
   * |  |   float node                  |         |
   * |  +-------------------------------+         |
   * |  +--------------------------------------+  |
   * |  |   clear node                         |  |
   * |  +--------------------------------------+  |
   * +--------------------------------------------+
   * +--------------------------------------------+
   * |      other layout block                    |
   * +--------------------------------------------+
   *
   * B.
   * +--------------------------------------------+
   * |  +-------------------------------+         |
   * +--|   float node                  |---------+
   *    +-------------------------------+
   * +--------------------------------------------+
   * |   clear node                               |
   * +--------------------------------------------+
   * +--------------------------------------------+
   * |      other layout block                    |
   * +--------------------------------------------+
   *
   * C.
   * +--------------------------------------------+
   * |  +-------------------------------------+   |
   * |  |  +-------------------------------+  |   |
   * |  +--|   float node                  |--+   |
   * +-----|                               |----- +
   *       +-------------------------------+
   * +--------------------------------------------+
   * |   clear node                               |
   * +--------------------------------------------+
   * +--------------------------------------------+
   * |      other layout block                    |
   * +--------------------------------------------+
   *
   * D.
   * +--------------------------------------------+
   * |  +-------------------------------------+   |
   * |  |  +-------------------------------+  |   |
   * |  +--|   float node                  |--+   |
   * |     |                               |      |
   * |     +-------------------------------+      |
   * |  +--------------------------------------+  |
   * |  |   clear node                         |  |
   * |  +--------------------------------------+  |
   * +--------------------------------------------+
   * +--------------------------------------------+
   * |      other layout block                    |
   * +--------------------------------------------+
   */
  this.isNextElementClear = function(node) {
    var nextSibling = this.getNextAffectFloatingLayoutElementByNode(node);
    var parentNextSibling =
        this.getNextAffectFloatingLayoutElementByParentNode(node);
    if (nextSibling)
      return this.hasClearStyle(nextSibling);
    // The layout has no problem if it's the last node of DOM tree.
    if (!nextSibling && !parentNextSibling)
      return true;
    // The next slibling clear success of parent elment.
    if (!this.hasClearStyle(parentNextSibling))
      return false;
    return false;
  };

  this.hasClearStyle = function(node) {
    return (chrome_comp.getComputedStyle(node).clear != 'none');
  };

  /**
   * Check parent node of the node, if it is visual non-inline elment
   * of normal flow.
   * @param {Node} node
   * @return {Node} It is null or it is noraml flow or floats node.
   *    If node is BODY return is null.
   */
  this.getNextAffectFloatingLayoutElementByParentNode = function(node) {
    // The last element of the document and no impact is not clear float.
    if (!node || node.tagName == 'BODY' || node.tagName == 'HTML')
      return null;
    node = node.parentNode;
    var nextSibling = this.getNextAffectFloatingLayoutElementByNode(node);
    if (!nextSibling)
      return this.getNextAffectFloatingLayoutElementByParentNode(node);
    else
      return nextSibling;
  };

  /**
   * Get the next sibling element which is visible, non-inline and in normal
   * flow.
   * @param {Element} node
   * @return {Element} null if not found
   */
  this.getNextAffectFloatingLayoutElementByNode = function(node) {
    node = node.nextSibling;
    for (; node; node = node.nextSibling) {
      if (Node.ELEMENT_NODE != node.nodeType)
        continue;
      var style = chrome_comp.getComputedStyle(node);
      if (style.display != 'none' &&
          style.display.indexOf('inline') != 0 &&
          (node.childElementCount == 0 ||
              this.isAffectedByChildrenLayout(node)))
        return node;
    }
    return null;
  };

  /**
   * Check childer element, if it is in normal flow or floats return true,
   * else return false.
   */
  this.isAffectedByChildrenLayout = function(node) {
    var children = Array.prototype.slice.call(node.children);
    for (var i = 0, c = children.length; i < c; ++i) {
      var computedStyle = chrome_comp.getComputedStyle(children[i]);
      if (!(computedStyle.display == 'none' ||
            computedStyle.position == 'absolute' ||
            computedStyle.position == 'fixed'))
        return true;
    }
    return false;
  };

  this.isPseudoElementClear = function(node) {
    // Temporary use window.getComputedStyle method,
    // wait framework.js fixed, replace the window.getComputedStyle method
    // to the chrome_comp.getComputedStyle method.
    var pseudoStyle = window.getComputedStyle(node,':after');
    // Triggered ie hasLayout features and use ':after' pseudo-element
    // processing floating Layout, not detection.
    return pseudoStyle.display == 'block' && pseudoStyle.clear != 'none';
  }

  this.isClearSuccess = function(floatNodes, clearNodes) {
    if (clearNodes == 0)
      return false;
    var lastFloatNode = floatNodes[floatNodes.length - 1];
    var lastClearNode = clearNodes[clearNodes.length - 1];
    // Used to compareDocumentPosition method compare two elements
    // of position, if the A element in the B element after, return 2.
    if (lastClearNode.compareDocumentPosition(lastFloatNode) != 2) {
      this.floatNode = lastFloatNode;
      return false;
    }
    return true;
  };

  this.isFloatsOverflowContainer = function(floatNodes, container) {
    var containerBottom = container.getBoundingClientRect().bottom +
        parseInt(chrome_comp.getComputedStyle(container).marginBottom, 10);
    for (var i = 0, c = floatNodes.length; i < c; ++i) {
      var floatNodeBottom = floatNodes[i].getBoundingClientRect().bottom;
      if (containerBottom < floatNodeBottom) {
        this.floatNode = floatNodes[i];
        return true;
      }
    }
    return false;
  };

  this.hasBackground = function(nodeStyle) {
    return (nodeStyle.backgroundImage != 'none' ||
            nodeStyle.backgroundColor != 'rgba(0, 0, 0, 0)');
  };

  this.hasBorder = function(nodeStyle) {
    return (parseInt(nodeStyle.borderTopWidth, 10) > 0 ||
            parseInt(nodeStyle.borderRightWidth, 10) > 0 ||
            parseInt(nodeStyle.borderBottomWidth, 10) > 0 ||
            parseInt(nodeStyle.borderLeftWidth, 10) > 0);
  };

  this.setProblem = function(node) {
    this.addProblem('RM8002', {
      nodes: [node, this.floatNode],
      details: 'Problem Element height is ' +
          chrome_comp.getComputedStyle(node).height
    });
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var IGNORED_TAGS = {HTML: true, BODY: true, FORM: true};
  if (node.tagName in IGNORED_TAGS)
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);
  if (computedStyle.display == 'inline')
    return;

  var floatNodes = this.getVisibleChildrenByFloatOrClear(node, 'float');
  // Stop detection if it has no descendant floats.
  if (floatNodes.length == 0)
    return;

  var hasLayout = chrome_comp.hasLayoutInIE(node);
  var hasBFC = chrome_comp.isBlockFormattingContext(node);

  // Stop detection if it hasLayout in IE and established
  // a BFC in other browsers.
  if (hasLayout && hasBFC)
   return;

  var hasBorder = this.hasBorder(computedStyle);
  var hasBackground = this.hasBackground(computedStyle);

  if (this.isNextElementClear(node) && !hasBorder && !hasBackground)
    return;

  var isPseudoElementClear = this.isPseudoElementClear(node);
  var isOverflow = this.isFloatsOverflowContainer(floatNodes, node);
  var clearNodes = this.getVisibleChildrenByFloatOrClear(node, 'clear');
  var clearNodeCount = clearNodes.length;

  // Stop detection if it's not established a BFC and its descendant
  // floats are not overflow.
  if (!isOverflow && !isPseudoElementClear && !hasBFC)
    return;

  // Normal float layout is not detection.
  if (clearNodeCount == 0 && !isPseudoElementClear &&
      !hasLayout && !hasBFC &&
      !hasBorder && !hasBackground)
    return;

  // Node is set hasLayout in IE, sub-element is float layout and not overfolw
  // ancestor element, not detection.
  // ps: set height triggered hasLayout in IE.
  if (clearNodeCount == 0 && !isPseudoElementClear && !isOverflow && !hasBFC)
    return;

  // Use pseudo element ':after' clear floating, and triggered IE hasLayout,
  // not detection.
  if (clearNodeCount == 0 && isPseudoElementClear && hasLayout)
    return;

  // Only use pseudo element ':after' clear floating.
  if (clearNodeCount == 0 && isPseudoElementClear && !hasLayout) {
    this.addProblem('RS8010', {
      nodes: [node],
      details: 'Problem Element set ":after" pseudo element.'
    });
  }

  // Detection the element triggered hasLayout in IE or Block Formatting
  // Contexts, if childer have not clear the floating elements.
  // report the issue.
  if (clearNodeCount == 0 && (hasLayout || hasBFC)) {
    this.floatNode = floatNodes[0];
    this.setProblem(node);
    return;
  }

  // Detection the element display style is 'table-xxxx',
  // if childer have not clear the floating elements.
  // report the issue.
  if (clearNodeCount == 0 &&
      computedStyle.display.indexOf('table') == 0) {
    this.floatNode = floatNodes[0];
    this.setProblem(node);
    return;
  }

  // Detection sub-elements clear floating fail, and triggered hasLayout
  // in IE or Block Formatting Contexts, report the issue.
  if (!this.isClearSuccess(floatNodes, clearNodes) &&
      !(!isOverflow && hasLayout && hasBFC) && !isPseudoElementClear) {
    this.setProblem(node);
    return;
  }

}
); // declareDetector

});
