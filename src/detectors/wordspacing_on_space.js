/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'wordspacing_on_space',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function hasTextNode(element) {
    var ch = element.childNodes, has = false, list = [];
    for (var i = 0, j = ch.length; i < j; i++) {
      if (ch[i].nodeType == 3) {
        has = has || true;
        list.push(ch[i]);
      }
    }
    return { list : list, has : has }
  }

  function isSetWordSpacing(element) {
    return parseInt(chrome_comp.getComputedStyle(element).wordSpacing) != 0;
  }

  function hasNonBreakingSpace(string) {
    return /\u00a0/g.test(string);
  }

  function hasIdeographicSpace(string) {
    var res = string.match(/\u3000/g);
    return res && res.length > 0;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (!isSetWordSpacing(node))
    return;

  var textNode = hasTextNode(node);
  if (!textNode.has)
    return;

  for (var i = 0, j = textNode.list.length; i < j; i++) {
    if (hasNonBreakingSpace(textNode.list[i].nodeValue) ||
        hasIdeographicSpace(textNode.list[i].nodeValue))
      this.addProblem('RT2013', [node]);
  }
}
); // declareDetector

});