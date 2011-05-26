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
 * @fileoverview Check if the HTML align attribute for several elements
 * transformed into floating element.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=5
 *
 * The align attribute for objects, images, tables, frames, etc., causes the
 * object to float to the left or right margin. Floating objects generally
 * begin a new line.
 * In other word, the align attribute for the said elements will be transformed
 * into CSS 'float' property in the corresponding direction.
 *
 * First, we ignore the inline and invisible elements. And get the children
 * elements of the present checked element, recording the left-aligned and
 * right-aligned said elements' information (the node object, its position and
 * its alignment). If there are less then two elements satisfied with
 * conditions, we do not continue.
 *
 * Try to enlarge the width of the element, we get the new position of the
 * elements satisfied with conditions. By comparing the changes in the
 * position to determine that if there may have the compatibility issue.
 * At last, restore the style of the element.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'align_nowrap',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  // We just check these elements whose align=left|right means floating. Refer
  // to http://www.w3.org/TR/html401/present/graphics.html#h-15.1.3.1
  this.ALIGNED_ELEMENT_LIST = {
    IMG: true,
    OBJECT: true,
    IFRAME: true,
    TABLE: true,
    APPLET: true,
    EMBED: true
  };

  /**
   * Get the next sibling node, this node may the element node or text node, but
   * it cannot be whitespace text node and absolutely positioned element node.
   * Because this compatibility issue only happens when these nodes appear after
   * the aligned tested element.
   * @param {Node} node the tested DOM element node.
   * @return {Node} the DOM node.
   */
  this.getNextUnpositionedSiblingNode = function(element) {
    var nextSibling = element.nextSibling;
    // Make sure the node we are finding is an element node or a non-whitespace
    // text node. We also must ignore the BR element, because BR do not occupy
    // any space.
    while (nextSibling &&
        (nextSibling.nodeType != Node.ELEMENT_NODE ||
            nextSibling.tagName == 'BR') &&
        (nextSibling.nodeType != Node.TEXT_NODE ||
            (nextSibling.nodeValue && nextSibling.nodeValue.trim() == ''))) {
      nextSibling = nextSibling.nextSibling;
    }
    if (!nextSibling)
      return null;
    if (nextSibling.nodeType == Node.ELEMENT_NODE) {
      // The absolutely positioned elements may trigger other compatibility
      // issues here, so we must ignore them.
      var position = chrome_comp.getComputedStyle(nextSibling).position;
      if (position != 'absolute' && position != 'fixed')
        return nextSibling;
    } else if (nextSibling.nodeType == Node.TEXT_NODE) {
      // There will not exist two consecutive whitespace text nodes, so there
      // must be a non-whitespace text node after the whitespace text node.
      if (nextSibling.nodeValue.trim() == '')
        nextSibling = nextSibling.nextSibling;
      return nextSibling;
    }
    return null;
  }

  /**
   * Get the rect information including ClientRect and ClientRectList of the
   * specified node.
   * @param {Node} node the DOM element node or the DOM text node.
   * @param {boolean} returnList determine the object type to return, if true
   *     return the ClientRectList object, if false return the ClientRect
   *     object.
   * @return {Object} the ClientRect or ClientRectList object about the node.
   * TODO: put this function into framework.
   */
  this.getRects = function(node, returnList) {
    if (!node)
      return null;
    if (node.nodeType == Node.ELEMENT_NODE) {
      // For the element nodes, return the ClientRect object and the
      // ClientRectList object of the node directly.
      // note: Since the shape of a block element is always rectangular, the
      // returned ClientRectList collection contains only one ClientRect
      // object for block elements.
      return (returnList)
          ? node.getClientRects()
          : node.getBoundingClientRect();
    } else if (node.nodeType == Node.TEXT_NODE) {
      // For the text nodes, since the text node object does not support to
      // retrieve the ClientRect object and the ClientRectList object, we need
      // to use the range object loading the text node to return the objects
      // we want.
      var range = document.createRange();
      range.selectNodeContents(node);
      var rects = (returnList)
          ? range.getClientRects()
          : range.getBoundingClientRect();
      return rects;
    }
    return null;
  }

  /**
   * Get all descendant non-whitespace text nodes under the specified element
   * sub tree.
   * @param {Node} element the DOM element node.
   * @return {Array} the array including all qualified text nodes.
   */
  this.getDescendantTextNode = function(element) {
    var result = [];
    if (!element || element.nodeType != Node.ELEMENT_NODE)
      return result;
    // Find all text nodes under the specified element through XPath.
    var allTextNode = document.evaluate('./descendant::text()', element, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, j = allTextNode.snapshotLength; i < j; ++i) {
      var textNode = allTextNode.snapshotItem(i);
      var nodeValue = textNode.nodeValue;
      // The white space text nodes are no use here, because they do not affect
      // the layout.
      if (nodeValue && nodeValue.trim() != '')
        result.push(textNode);
    }
    return result;
  }

  /**
   * Get all descendant empty element nodes under the specified element sub
   * tree.
   * @param {Node} element the DOM element node.
   * @return {Array} the array including all qualified element nodes.
   */
  this.getDescendantEmptyElement = function(element) {
    var result = [];
    if (!element || element.nodeType != Node.ELEMENT_NODE)
      return result;
    // We consider the aligned tested elements as indivisible, so do not check
    // their descendant elements, such as the PARAM element in the OBJECT
    // element.
    if (element.tagName in this.ALIGNED_ELEMENT_LIST)
      return result;
    var allElement = element.getElementsByTagName('*');
    for (var i = 0, j = allElement.length; i < j; ++i) {
      var ele = allElement[i];
      // if innerHTML is equal to empty string, it means the element does not
      // contain any content, the element containing context has been detect
      // when calling the getDescendantTextNode method.
      if (ele.innerHTML == '')
        result.push(ele);
    }
    return result;
  }

  /**
   * Get the original position of the tested element and its relative nodes.
   * @param {Node} node the DOM element node.
   * @param {Node} nextSibling the DOM element node.
   * @return {Object} the object including rect object about the tested element
   *     and its relative nodes.
   */
  this.getOldNodesRect = function(node, nextSibling) {
    var result = {
      // The rect object about the tested element.
      node: null,
      // Each element in the array contains two keys, the key node stands the
      // DOM node (text node or element node) which is related to the tested
      // element, the key nodeRect stands the rect object of the node.
      nextSibling: []
    };
    if (nextSibling.nodeType == Node.ELEMENT_NODE) {
      result.node = this.getRects(node, false);
      var descendantTextNode = this.getDescendantTextNode(nextSibling);
      var descendantEmptyElement = this.getDescendantEmptyElement(nextSibling);
      if (nextSibling.tagName in this.ALIGNED_ELEMENT_LIST ||
          (descendantTextNode.length == 0 &&
          descendantEmptyElement.length == 0)) {
        result.nextSibling.push({
          node: nextSibling,
          nodeRect: this.getRects(nextSibling, false)
        });
      } else {
        for (var i = 0, j = descendantTextNode.length; i < j; ++i) {
          result.nextSibling.push({
            node: descendantTextNode[i],
            nodeRect: this.getRects(descendantTextNode[i], false)
          });
        }
        for (var i = 0, j = descendantEmptyElement.length; i < j; ++i) {
          result.nextSibling.push({
            node: descendantEmptyElement[i],
            nodeRect: this.getRects(descendantEmptyElement[i], false)
          });
        }
      }
    } else if (nextSibling.nodeType == Node.TEXT_NODE) {
      result.node = this.getRects(node, false);
      result.nextSibling.push({
        node: nextSibling,
        nodeRect: this.getRects(nextSibling, false)
      });
    }
    return result;
  }

  /**
   * Get the new position of the tested element and its relative nodes after
   * changing the width of the node's containing block, and restore the style we
   * modified.
   * @param {Node} node the DOM element node.
   * @param {Node} nextSibling the DOM element node.
   * @param {Node} containingBlock the node' containing block.
   * @return {Object} the object including rect object about the tested element
   *     and its relative nodes after changing the width of the node's
   *     containing block.
   */
  this.getNewNodesRect = function(node, nextSibling, containingBlock) {
    var result = {
      // The rect object about the tested element.
      node: null,
      // Each element in the array contains two keys, the key node stands the
      // DOM node (text node or element node) which is related to the tested
      // element, the key nodeRect stands the rect object of the node.
      nextSibling: [],
      // The containing block of the tested element.
      containingBlock: null
    };
    // Cache the original inline width style.
    var inlineWidthValue = containingBlock.style.getPropertyValue('width');
    var inlineWidthPriority =
        containingBlock.style.getPropertyPriority('width');
    // Set the containing block's width be wide enough for observing the
    // position's change of the tested element and its relative nodes.
    containingBlock.style.setProperty('width', '100000px', 'important');
    if (nextSibling.nodeType == Node.ELEMENT_NODE) {
      result.node = this.getRects(node, false);
      result.containingBlock = this.getRects(containingBlock, false);
      var descendantTextNode = this.getDescendantTextNode(nextSibling);
      var descendantEmptyElement = this.getDescendantEmptyElement(nextSibling);
      if (nextSibling.tagName in this.ALIGNED_ELEMENT_LIST ||
          (descendantTextNode.length == 0 &&
          descendantEmptyElement.length == 0)) {
        result.nextSibling.push({
          node: nextSibling,
          nodeRect: this.getRects(nextSibling, false)
        });
      } else {
        for (var i = 0, j = descendantTextNode.length; i < j; ++i) {
          result.nextSibling.push({
            node: descendantTextNode[i],
            nodeRect: this.getRects(descendantTextNode[i], false)
          });
        }
        for (var i = 0, j = descendantEmptyElement.length; i < j; ++i) {
          result.nextSibling.push({
            node: descendantEmptyElement[i],
            nodeRect: this.getRects(descendantEmptyElement[i], false)
          });
        }
      }
    } else if (nextSibling.nodeType == Node.TEXT_NODE) {
      result.node = this.getRects(node, false);
      result.containingBlock = this.getRects(containingBlock, false);
      result.nextSibling.push({
        node: nextSibling,
        nodeRect: this.getRects(nextSibling, false)
      });
    }
    // Restore the original inline width style.
    containingBlock.style.removeProperty('width');
    if (inlineWidthValue)
      containingBlock.style.setProperty('width', inlineWidthValue,
          inlineWidthPriority);
    return result;
  }

  /**
   * Determine if the position of all tested element's relative nodes will be
   * affected by the left-aligned or right-aligned tested element.
   * @param {object} oldRectObj the original position.
   * @param {object} newRectObj the new position after changing the width of
   *     the node's containing block.
   * @param {string} alignDirection left or right.
   * @return {Array} the array including the nodes affected by tested element.
   */
  this.getDifferentPositionNodeList = function(oldRectObj, newRectObj,
      alignDirection) {
    var result = [];
    if (!oldRectObj ||
        !newRectObj ||
        !oldRectObj.nextSibling ||
        !newRectObj.nextSibling ||
        oldRectObj.nextSibling.length != newRectObj.nextSibling.length)
      return result;
    var oldNodeRect = oldRectObj.node;
    var oldContainingBlockRect = oldRectObj.containingBlock;
    var oldNextSiblingRectList = oldRectObj.nextSibling;
    var newNodeRect = newRectObj.node;
    var newContainingBlockRect = newRectObj.containingBlock;
    var newNextSiblingRectList = newRectObj.nextSibling;
    if (oldNextSiblingRectList.length == 0 ||
        newNextSiblingRectList.length == 0)
      return result;
    var oldNodeLeft = oldNodeRect.left;
    var oldNodeRight = oldNodeRect.right;
    var oldNodeTop = oldNodeRect.top;
    var newNodeLeft = newNodeRect.left;
    var newNodeRight = newNodeRect.right;
    var newNodeTop = newNodeRect.top;
    for (var i = 0, j = oldNextSiblingRectList.length; i < j; ++i) {
      var oldNextSiblingLeft = oldNextSiblingRectList[i].nodeRect.left;
      var oldNextSiblingRight = oldNextSiblingRectList[i].nodeRect.right;
      var oldNextSiblingTop = oldNextSiblingRectList[i].nodeRect.top;
      var newNextSiblingLeft = newNextSiblingRectList[i].nodeRect.left;
      var newNextSiblingRight = newNextSiblingRectList[i].nodeRect.right;
      var newNextSiblingTop = newNextSiblingRectList[i].nodeRect.top;
      // If the current node's position does not change, we consider it cannot
      // be affected by the tested element.
      if ((newNextSiblingLeft - newNodeLeft) >
          (oldNextSiblingLeft - oldNodeLeft) ||
          (newNextSiblingTop - newNodeTop) <
          (oldNextSiblingTop - oldNodeTop)) {
        // If the original position of the current node is on the right side of
        // the left-aligned tested element or the left side of the right-aligned
        // tested element, we consider it cannot be affected by the tested
        // element.
        if (alignDirection == 'left' && oldNextSiblingLeft >= oldNodeRight)
          continue;
        if (alignDirection == 'right' && oldNextSiblingRight <= oldNodeLeft)
          continue;
        result.push(oldNextSiblingRectList[i].node);
      }
    }
    return result;
  }
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  // Only check the element having the align attribute, and the align attribute
  // means floating. Refer to
  // http://www.w3.org/TR/html401/present/graphics.html#h-15.1.3
  if (!(node.tagName in this.ALIGNED_ELEMENT_LIST))
    return;
  var alignDirection = (node.align + '').toLowerCase();
  // This issue happens when the align attribute is left or right.
  if (alignDirection != 'left' && alignDirection != 'right')
    return;
  var containingBlock = chrome_comp.getContainingBlock(node);
  var nextSibling = this.getNextUnpositionedSiblingNode(node);
  // The aligned tested element may only affect its next siblings in IE.
  if (!nextSibling)
    return;
  var nodeList = this.getDifferentPositionNodeList(
      this.getOldNodesRect(node, nextSibling, containingBlock),
      this.getNewNodesRect(node, nextSibling, containingBlock), alignDirection);
  if (nodeList.length > 0) {
    // Add the tested element to the front of the list.
    nodeList.unshift(node);
    this.addProblem('RX8015', {
      nodes: nodeList,
      details: node.tagName + '[align="' + alignDirection + '"]'
    });
  }
}
); // declareDetector

});
