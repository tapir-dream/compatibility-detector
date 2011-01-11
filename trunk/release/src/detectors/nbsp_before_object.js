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

'nbsp_before_object',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (context.isDisplayNone() || chrome_comp.mayAffectNormalFlow(node) != 1)
    return;

  if (Node.TEXT_NODE == node.nodeType) {
    var text = node.textContent;
    if (text && text.charCodeAt(text.length - 1) == 160)
      context.putValueInBlockStack('textCandidate', node);
  } else if (Node.ELEMENT_NODE == node.nodeType) {
    if (node.tagName == 'OBJECT') {
      var textCandidate = context.getValueInBlockStack('textCandidate');
      if (textCandidate)
        this.addProblem('HT1002', [node, textCandidate]);
    }
    context.clearValuesInBlockStack();
  }
}
); // declareDetector

});
