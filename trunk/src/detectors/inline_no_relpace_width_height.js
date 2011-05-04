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

  // Filter out some special tags, such as OPTION in:
  // http://amuse.nen.com.cn/73749755317977088/20100906/2661446.shtml
  if (node.tagName == 'OPTION')
    return;
  // And v:roundrect in:
  // http://www.zhrtvu.net/
  if (-1 != node.tagName.indexOf(':'))
    return;

  var style = chrome_comp.getComputedStyle(node);
  if (style.display == 'inline' && !chrome_comp.isReplacedElement(node)) {
    var specifiedWidth = chrome_comp.getSpecifiedStyleValue(node, 'width');
    var specifiedHeight = chrome_comp.getSpecifiedStyleValue(node, 'height');
    if (!chrome_comp.isAutoOrNull(specifiedWidth) ||
        !chrome_comp.isAutoOrNull(specifiedHeight)) {
      var severityLevel = 1;
      // If the inline non-replace element's width/height is specified, and it
      // has background image but no content, the layout will be very different
      // in IE and Chrome. Increase the severity level for this case.
      if (style.backgroundImage != 'none' &&
          (!node.hasChildNodes() || node.innerText.trim() == ""))
        severityLevel = 9;

      specifiedWidth = specifiedWidth || 'auto';
      specifiedHeight = specifiedHeight || 'auto';
      this.addProblem('RD1014', {
        nodes: [node],
        details: node.tagName + ' ' + specifiedWidth + ' * ' + specifiedHeight,
        severityLevel: severityLevel
      });
    }
  }
}

); // declareDetector

});
