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

'word_wrap_spaces',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (context.isDisplayNone() || Node.ELEMENT_NODE != node.parentNode.nodeType)
    return;
  var parentStyle = chrome_comp.getComputedStyle(node.parentNode);
  if (// About pre white-space there are more problems that are out of range
      // of this detector.
      (parentStyle.whiteSpace != 'normal' &&
       parentStyle.whiteSpace != 'nowrap') ||
      parentStyle.wordWrap != 'break-word')
    return;

  // Status values in the block stack:
  // 1: has met visible element in current logical line
  // 2: has met trailing space in status 1.

  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      var style = chrome_comp.getComputedStyle(node);
      switch (style.display) {
        case 'none':
          if ((node.tagName == 'INPUT' &&
               chrome_comp.getAttributeLowerCase(node, 'type') == 'hidden') ||
              chrome_comp.getDefinedStylePropertyByName(
                  node, true, 'display') == 'none') {
            if (context.getValueInBlockStack('status') == 2) {
              context.putValueInBlockStack('hiddenElementCandidate', node);
              context.putValueInBlockStack('status', 1);
            }
          }
          // Nodes like SCRIPT, META, etc. should be ignored.
          break;
        case 'inline-block':
          context.clearValuesInBlockStack();
          context.putValueInBlockStack('status', 1);
          break;
        case 'block':
          // This is a block element in normal flow. Reset the line status
          // because this block will create a new line.
          // Not testing fixed position because some browser doesn't support.
          if (style.position != 'absolute' && style.float == 'none')
            context.clearValuesInBlockStack();
          break;
        case 'inline':
          if (node.tagName == 'BR') {
            context.clearValuesInBlockStack();
          } else if (chrome_comp.isReplacedElement(node)) {
            context.clearValuesInBlockStack();
            context.putValueInBlockStack('status', 1);
          }
          break;
      }
      break;
    case Node.TEXT_NODE:
      var status = context.getValueInBlockStack('status');
      var text = node.textContent;
      var hiddenElementCandidate =
        context.getValueInBlockStack('hiddenElementCandidate');
      if (hiddenElementCandidate && text.match(chrome_comp.LEADING_WHITESPACES))
        this.addProblem('RT1008', [node]);
      context.clearValuesInBlockStack();
      if (!status && text.match(chrome_comp.LEADING_WHITESPACES))
        status = 1;
      if (status) {
        status = text.match(chrome_comp.TRAILING_WHITESPACES) ? 2 : 1;
        context.putValueInBlockStack('status', status);
      }
  }
}
); // declareDetector

});
