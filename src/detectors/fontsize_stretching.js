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

'fontsize_stretching',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (chrome_comp.getComputedStyle(node).display != 'inline')
    return;

  var fontSize = parseInt(chrome_comp.getComputedStyle(node).fontSize, 10);
  var ch = node.children;
  var chFontSize;
  for (var i = 0, j = ch.length; i < j; i++) {
    chFontSize = parseInt(chrome_comp.getComputedStyle(ch[i]).fontSize, 10);
    if ((chFontSize > fontSize) && 
        (chrome_comp.getComputedStyle(ch[i]).display != 'none'))
      this.addProblem('RD1011', [ch[i]]);
  }
}
); // declareDetector

});

