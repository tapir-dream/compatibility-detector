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

'computing_absolutely_positioned_elements_width_and_height_according_to_offset',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isPositioned(nodeEl) {
    var position = window.chrome_comp.getComputedStyle(nodeEl).position;
    return (position == 'absolute') || (position == 'fixed');
  }

  function isWidthAuto(nodeEl) {
    var width = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true,
        'width');
    return !width || width == 'auto';
  }

  function isHeightAuto(nodeEl) {
    var height = window.chrome_comp.getDefinedStylePropertyByName(nodeEl, true,
        'height');
    return !height || height == 'auto';
  }

  if (Node.ELEMENT_NODE != node.nodeType || !isPositioned(node))
    return;

  var left = window.chrome_comp.getComputedStyle(node).left;
  var right = window.chrome_comp.getComputedStyle(node).right;
  var width = window.chrome_comp.getComputedStyle(node).width;

  if (left != 'auto' && right != 'auto' && isWidthAuto(node)) {
    var stfWidth = window.chrome_comp.getComputedStyle(node).width;
    node.style.left = 'auto';
    node.style.right = 'auto';
    node.style.left = left;
    node.style.right = right;
    if (width != stfWidth) {
      this.addProblem('RD8008', [node]);
      return;
    }
  }
  var elementStyle = window.chrome_comp.getComputedStyle(node);
  var top = elementStyle.top;
  var bottom = elementStyle.bottom;
  var height = elementStyle.height;

  if (left != 'auto' && right != 'auto' && isHeightAuto(node)) {
    node.style.top = 'auto';
    node.style.bottom = 'auto';
    var stfHeight = window.chrome_comp.getComputedStyle(node).height;
    node.style.top = top;
    node.style.bottom = bottom;
    if (height != stfHeight) {
      this.addProblem('RD8008', [node]);
      return;
    }
  }
}
); // declareDetector

});