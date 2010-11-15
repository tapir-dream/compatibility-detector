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

'img_text_decoration',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (chrome_comp.inQuirksMode() || context.isDisplayNone())
    return;

  switch (node.nodeType) {
    case Node.TEXT_NODE:
      if (context.getValueInBlockStack('hasNonBlankText'))
        return;
      var parentStyle = chrome_comp.getComputedStyle(node.parentNode);
      var whiteSpace = parentStyle.whiteSpace;
      var keepSpaces = whiteSpace == 'pre' || whiteSpace == 'pre-wrap';
      var isNonBlankText =
          !!(keepSpaces ? node.nodeValue : chrome_comp.trim(node.nodeValue));
      if (isNonBlankText) {
        var imgCandidates = context.getValueInBlockStack('imgCandidates');
        if (imgCandidates) {
          for (var i = 0; i < imgCandidates.length; i++)
            this.addProblem('RT3001', [imgCandidates[i]]);
          context.deleteValueInBlockStack('imgCandidate');
        }
        context.putValueInBlockStack('hasNonBlankText', true);
      }
      break;

    case Node.ELEMENT_NODE:
      if (node.tagName != 'IMG')
        return;
      var style = chrome_comp.getComputedStyle(node);
      if (style.WebkitTextDecorationsInEffect == 'none' ||
          style.display != 'inline')
        return;
      if (context.getValueInBlockStack('hasNonBlankText')) {
        this.addProblem('RT3001', [node]);
      } else {
        var imgCandidates = context.getValueInBlockStack('imgCandidates');
        if (imgCandidates)
          imgCandidates.push(node);
        else
          imgCandidates = [node];
        context.putValueInBlockStack('imgCandidates', imgCandidates);
      }
  }
}
); // declareDetector

});
