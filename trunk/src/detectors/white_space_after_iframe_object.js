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

'white_space_after_iframe_object',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (context.isDisplayNone() ||
      chrome_comp.mayAffectNormalFlow(node) != 1)
    return;

  if (Node.TEXT_NODE == node.nodeType) {
    var objectCandidate = context.getValueInBlockStack('objectCandidate');
    if (objectCandidate) {
      var textCandidate = context.getValueInBlockStack('textCandidate');
      var text = node.textContent;
      if (textCandidate &&
          (chrome_comp.trim(textCandidate.textContent) ||
           chrome_comp.trim(text))) {
        this.addProblem('HT1001', [objectCandidate, textCandidate]);
        context.clearValuesInBlockStack();
      //text node must be sibling of IFRAME, EMBED or OBJECT object
      } else if (text.match(chrome_comp.LEADING_WHITESPACES) &&
          node.parentNode == objectCandidate.parentNode) {
        context.putValueInBlockStack('textCandidate', node);
      }
    }
  } else if (Node.ELEMENT_NODE == node.nodeType) {
    //BR block table list-item
    if (chrome_comp.startsNewLine(node)) {
      context.clearValuesInBlockStack();
      return;
    }
    var objectCandidate = context.getValueInBlockStack('objectCandidate');
    var textCandidate = context.getValueInBlockStack('textCandidate');
    if (objectCandidate && textCandidate)
      this.addProblem('HT1001', [objectCandidate, textCandidate]);

    context.clearValuesInBlockStack();
    var tagName = node.tagName;
    if ((tagName == 'IFRAME' || tagName == 'OBJECT' || tagName == 'EMBED') &&
         chrome_comp.getComputedStyle(node).whiteSpace == 'normal')
      context.putValueInBlockStack('objectCandidate', node);
  }
}
); // declareDetector

});
