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

'negative_margin',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isNegativeMargin(nodeEl) {
    var t = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginTop);
    var r = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginRight);
    var b = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginbottom);
    var l = parseInt(window.chrome_comp.getComputedStyle(nodeEl).marginLeft);
    return (t < 0) || (r < 0) || (b < 0) || (l < 0);
  }

  function isRelativePositioned(nodeEl) {
    return window.chrome_comp.getComputedStyle(nodeEl).position == 'relative';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (!isNegativeMargin(node))
    return;

  var cb = window.chrome_comp.getContainingBlock(node);
  if (window.chrome_comp.hasLayoutInIE(cb) && isRelativePositioned(node) &&
      window.chrome_comp.hasLayoutInIE(node))
    return;

  var nodeBound = node.getBoundingClientRect();
  var cbBound = cb.getBoundingClientRect();
  if (nodeBound.top < cbBound.top || nodeBound.right > cbBound.right ||
      nodeBound.bottom > cbBound.bottom || nodeBound.left < cbBound.left) {
    this.addProblem('RB1001', [cb]);
  }
}
); // declareDetector

});

