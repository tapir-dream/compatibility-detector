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

'invisible_element_overflow',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isInvisible(nodeEl) {
    var w = parseInt(window.chrome_comp.getComputedStyle(nodeEl).width);
    var h = parseInt(window.chrome_comp.getComputedStyle(nodeEl).height);
    return (w == 0) || (h == 0);
  }

  function isOverflowAutoOrScroll(nodeEl) {
    return window.chrome_comp.getComputedStyle(nodeEl).overflow == 'auto' ||
      window.chrome_comp.getComputedStyle(nodeEl).overflow == 'scroll';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!isInvisible(node))
    return;
  
  var cb = window.chrome_comp.getContainingBlock(node);
  if (!cb)
    return;
  
  if (!isOverflowAutoOrScroll(cb))
    return;
  
  var nodeBound = node.getBoundingClientRect();
  var cbBound = cb.getBoundingClientRect();
  if (nodeBound.top < cbBound.top || nodeBound.right > cbBound.right ||
      nodeBound.bottom > cbBound.bottom || nodeBound.left < cbBound.left) {
    this.addProblem('BX8037', [node]);
  }
}
); // declareDetector

});

