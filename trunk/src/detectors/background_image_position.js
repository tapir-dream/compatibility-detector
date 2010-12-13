/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'background_image_position',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function hasBackgroundImage(element) {
    return chrome_comp.getComputedStyle(element).backgroundImage != 'none';
  }

  function hasBorder(element) {
    var elementStyle = chrome_comp.getComputedStyle(element);
    var btw = parseInt(elementStyle.borderTopWidth,10);
    var blw = parseInt(elementStyle.borderLeftWidth,10);
    return (btw != 0) || (blw != 0);
  }

  function getBackgroundOrigin(element) {
    return chrome_comp.getComputedStyle(element).backgroundOrigin;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (chrome_comp.hasLayoutInIE(node))
    return;

  if (!hasBackgroundImage(node))
    return;

  if (!hasBorder(node))
    return;

  if (getBackgroundOrigin(node) != 'border-box')
    this.addProblem('RC3005', [node]);
}
); // declareDetector

});
