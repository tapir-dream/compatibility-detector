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
 * @fileoverview Check if there are paddings on images when IE is Quirks Mode.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=149
 *
 * Get the real document mode in IE first. If the document mode in IE is Quirks
 * Mode and the node is an image with paddings, report this issue.
 */

addScriptToInject(function() {

if (chrome_comp.documentMode.IE != 'Q')
  return;

chrome_comp.CompDetect.declareDetector(

'img_padding',

chrome_comp.CompDetect.ScanDomBaseDetector,

null,

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType ||
      node.tagName != 'IMG')
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);
  if (parseInt(computedStyle.paddingLeft, 10) ||
      parseInt(computedStyle.paddingTop, 10) ||
      parseInt(computedStyle.paddingRight, 10) ||
      parseInt(computedStyle.paddingBottom, 10))
    this.addProblem('RX1010', {
      nodes: [node],
      details: '{padding: ' + computedStyle.paddingTop + ' ' +
          computedStyle.paddingRight + ' ' + computedStyle.paddingBottom +
          ' ' + computedStyle.paddingLeft + ';}'
    });
}
); // declareDetector

});
