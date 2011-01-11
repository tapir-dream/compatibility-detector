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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'bold_element_font_weight',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType ||
      Node.ELEMENT_NODE != node.parentNode.nodeType)
    return;

  var fontWeight = chrome_comp.getDefinedStylePropertyByName(node, true,
      'font-weight');
  var parentFontWeight = parseInt(
      chrome_comp.getComputedStyle(node.parentNode).fontWeight, 10);

  if ((fontWeight == 'bolder' && parentFontWeight <= 300) ||
      (fontWeight == 'lighter' && parentFontWeight >= 800)) {
    this.addProblem('RA3002', [node]);
    return;
  }

  if (!fontWeight) {
    var tagName = node.tagName;
    if (tagName == 'STRONG' || tagName == 'B' || tagName == 'TH' ||
        // Check H1 ~ H6
        (tagName.length == 2 && tagName[0] == 'H' &&
        tagName[1] >= '1' && tagName[1] <= '6')) {
      if (!isNaN(parentFontWeight) && parentFontWeight <= 300)
        this.addProblem('RA3002', [node]);
    }
  }
}
); // declareDetector

});
