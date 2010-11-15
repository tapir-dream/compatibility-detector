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

'shrink_to_fit_percentage_child',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var isShrinkToFit = context.getValueInBlockStack('isShrinkToFit');
  if (isShrinkToFit === undefined) {
    var block = context.getParentBlock();
    if (block) {
      isShrinkToFit = chrome_comp.isShrinkToFit(block, true);
      context.putValueInBlockStack('isShrinkToFit', isShrinkToFit);
    }
  }
  if (!isShrinkToFit)
    return;

  // This algorithm only applies to non-replaced elements.
  if (chrome_comp.isReplacedElement(node))
    return;

  var style = chrome_comp.getComputedStyle(node);
  if (style.display == 'inline')
    return;
  var position = style.position;
  if (position == 'fixed' || position == 'absolute')
    return;

  var width = chrome_comp.getDefinedStylePropertyByName(node, false, 'width');
  if (width && width.match(/[0-9]+\%$/) && parseInt(width) > 0)
    this.addProblem('RX8017', [node]);
}
); // declareDetector

});
