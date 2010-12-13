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

'base_tag_position',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'BASE')
    return;

  var bodyElement = document.getElementsByTagName('body')[0];
  if (bodyElement.compareDocumentPosition(node) != 20)
    return;

  var Links = Array.prototype.slice.call(document.getElementsByTagName('A'));

  for (var i = 0, len = Links.length; i < len; i++){
    if (node.compareDocumentPosition(Links[i]) === 2){
      this.addProblem('HJ2001', [node]);
      return;
    }
  }
}
); // declareDetector

});
