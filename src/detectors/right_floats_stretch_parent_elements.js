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

'right_floats_stretch_parent_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor
/*
[train of thought]
Find a right floating element (gloss over 'direction:rtl' for now).
Check its ancestor elements one bye one and push them in an array, until find an
element which 'width' is clearly defined, or its a TABLE/BODY element.
Find a 'shrink-to-fit' width element in the found elements from the outside
toward the center, and check the available horizontal space of the element.
If the available horizontal space is greater then its width, report an error.
(There were no cases need to continue inward to find another element now.)
*/
function checkNode(node, additionalData) {
  function isTableElement(node) {
    var TABLELIKE_VALUES = ['table', 'inline-table', 'table-row-group',
    'table-header-group', 'table-footer-group', 'table-row',
    'table-column-group','table-column','table-cell','table-caption'];
    var display = chrome_comp.getComputedStyle(node).display;
    return TABLELIKE_VALUES.indexOf(display) != -1;
  }
  function widthIsAuto(node) {
    var computedStyle = getComputedStyle(node);
    var oWidth = computedStyle.width;
    var oInlineWidth = node.style.width;
    node.style.width = 'auto !important';
    var cWidth = computedStyle.width;
    node.style.width = '';    //!important bug.
    node.style.width = oInlineWidth;
    if (!node.style.cssText) node.removeAttribute('style');
    if (cWidth == oWidth) {
      return true;
      //todo: check 'width' property need another function that is accurate.
      //todo: the 'width' maybe affected by its STF ancestor elements.
//      console.log(oWidth,cWidth);
//      var oBorderLeftWidth = computedStyle.borderLeftWidth;
//      var oInlineBorderLeftWidth = node.style.borderLeftWidth;
//      node.style.borderLeftWidth = '5px !important';
//      cWidth = computedStyle.width;
    }
    return false;
  }
  /*
  Only in this context, if extract from here, need to consider TABLE and BUTTON
  elements.
  */
  function widthIsShrinkToFit(node) {
    var computedStyle = chrome_comp.getComputedStyle(node);
    return widthIsAuto(node) && computedStyle.display != 'none' && (
      ((computedStyle.position == 'absolute' ||
        computedStyle.position == 'fixed') &&
      (computedStyle.left == 'auto' || computedStyle.right == 'auto')) ||
      computedStyle.float != 'none' ||
      computedStyle.display == 'inline-block'
    );
  }

  if (node.nodeType != Node.ELEMENT_NODE) return;
  var computedStyle = chrome_comp.getComputedStyle(node);
  if (computedStyle.float == 'right' && computedStyle.position != 'absolute'
    && computedStyle.position != 'fixed' && computedStyle.display != 'none') {
    var ancestorElements = [];
    var parentElement = node;
    while ((parentElement = parentElement.parentElement) &&
      widthIsAuto(parentElement) && !isTableElement(parentElement) &&
      parentElement.tagName != 'BUTTON' && parentElement.tagName != 'BODY') {
      ancestorElements.push(parentElement);
    }
    for (var i = ancestorElements.length; i; i--) {
      var ancestorElement = ancestorElements[i-1];
      if (widthIsShrinkToFit(ancestorElement)) {
        var rulerElement = document.createElement('div');
        rulerElement.style.cssText = 'display: block !important;' +
          'position: static !important; float: none !important;' +
          'width: auto !important; height: 0 !important;' +
          'margin: 0 !important; padding: 0 !important;' +
          'border: 0 none !important;';
        ancestorElement.parentNode.insertBefore(rulerElement, ancestorElement);
        var availableWidth = rulerElement.offsetWidth;
        ancestorElement.parentNode.removeChild(rulerElement);
        var computedStyle = chrome_comp.getComputedStyle(node);
        if (availableWidth > ancestorElement.offsetWidth +
          parseInt(computedStyle.marginLeft, 10) +
          parseInt(computedStyle.marginRight, 10)) {
          this.addProblem('RD8006', [node]);
        }
        break;
      }
    }
  }
}
); // declareDetector

});
