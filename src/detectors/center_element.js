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
 * @fileoverview Check the alignment of the CENTER element.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=33
 *
 * The CENTER element will make its descendants align center, but In IE, the
 * CENTER element also make itself align center.
 *
 * This detector will check all nodes, and do the following things:
 * 1. Check CENTER tag.
 * 2. Ignore CENTER is not normal flow layout.
 * 3. Check for child elements whose width is less than the parent. if it is
 *    large, then not continue to detector.
 * 4. Calculate the left rect position， whether the location is expected
 *    match the IE rendering. if it is true, then not continue to detector.
 * 5. The remaining cases has problems.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'center_element',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.THRESHOLD_OF_CENTER = 5;
  this.THRESHOLD_OF_HEIGHT = 3;
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType ||
      context.isDisplayNone() || node.tagName != 'CENTER')
    return;

  if (chrome_comp.mayAffectNormalFlow(node) != 1 ||
      (node.offsetHeight <= this.THRESHOLD_OF_HEIGHT &&
          node.innerText == '' &&
          !chrome_comp.hasBorder(node) &&
          !chrome_comp.hasBackground(node)))
    return;

  var parentNode = node.parentElement;

  // If element marginLeft and marginRight value is 'auto',
  // and width value is not 'auto', the layout is auto align center,
  // use chrome_comp.isCenterAlignedByMarginAndWidth methods deteciton.
  // if return true, then text-align invalid in IE6/7, not detecor.
  if (chrome_comp.isCenterAlignedByMarginAndWidth(node))
    return;

  // Element margin-left or margin-right style is auto. element marginBox will
  // full parent container content box, text-align layout invalid in IE6/7.
  if (chrome_comp.isMarginLeftAuto(node) ||
      chrome_comp.isMarginRightAuto(node))
    return;

  if (chrome_comp.isVisuallyCenterAligned(parentNode, node,
      this.THRESHOLD_OF_CENTER))
    return;

  var containerContentWidth = chrome_comp.util.width(
      chrome_comp.getLayoutBoxes(parentNode).contentBox);
  var childMarginBoxWidth = chrome_comp.util.width(
      chrome_comp.getLayoutBoxes(node).marginBox);

  this.addProblem('HA8001', {
    nodes: [node, parentNode],
    details: 'container content box width: ' +  containerContentWidth  + 'px' +
        ', CENTER element width: '+ childMarginBoxWidth + 'px'
  });
}
); // declareDetector

});
