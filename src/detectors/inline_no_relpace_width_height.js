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
 * @fileoverview Check non-replaced inline element's height and width
 * settings only take effect in quirks mode in IE problems.
 * 
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=91
 *
 * Check document mode, when in quirks mode and found a inline non-replaced
 * element sets width or height, report problem.
 */

addScriptToInject(function() {

if (chrome_comp.documentMode.IE != 'Q')
  return;

chrome_comp.CompDetect.declareDetector(

'inline_no_relpace_width_height',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  var style = chrome_comp.getComputedStyle(node);
  if (style.display == 'inline' &&
      !chrome_comp.isReplacedElement(node)) {
    var specifiedStyle = chrome_comp.getSpecifiedValue(node);
    // If the inline non-replace element's width/height is specified, and it
    // has background image but has no content or child elements, the layout
    // will be very different in IE and Chrome, so in this case ,increase
    // severity level to error.
    if (specifiedStyle.width != 'auto' || specifiedStyle.height != 'auto') {
      if (style.backgroundImage != 'none' &&
          (!node.hasChildNodes() || node.innerText.trim() == ""))
        this.addProblem('RD1014', {nodes: [node], severityLevel: 9});
      else
        this.addProblem('RD1014', {nodes: [node]});
    }
  }
}
); // declareDetector

});