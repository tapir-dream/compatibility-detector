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

'text_decoration_propagation',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType ||
      Node.ELEMENT_NODE != node.parentNode.nodeType ||
      context.isDisplayNone())
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);
  var display = computedStyle.display;
  var threshold = -100;
  if (display == 'block') {
    var position = computedStyle.position;
    // All browsers propagates decoration into absolute positioned block in
    // Quirks mode.
    if (position == 'absolute' || position == 'fixed') {
      if (chrome_comp.inQuirksMode())
        return;
      if ((parseInt(computedStyle.top,10)|0) < threshold ||
          (parseInt(computedStyle.left,10)|0) < threshold)
        return;
    } else if ((parseInt(computedStyle.textIndent,10)|0) < threshold ){
      return;
    } else {
      var float = computedStyle.float;
      if (float == 'left' || float == 'right')
        return;
    }
  } else if (display != 'inline-table' && display != 'inline-block') {
    return;
  }

  if ((parseInt(computedStyle.textIndent,10)|0) < threshold)
    return;

  if (!node.innerText)
    return;

  var parentComputedStyle = chrome_comp.getComputedStyle(node.parentNode);
  if (parentComputedStyle.WebkitTextDecorationsInEffect != 'none')
    this.addProblem('RT3002', [node]);
}
); // declareDetector

});
