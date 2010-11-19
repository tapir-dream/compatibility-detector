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

'background_attachment_scroll',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  var computedStyle = chrome_comp.getComputedStyle(node);
  var scrollValue = ['scroll', 'auto'];
  if (computedStyle.backgroundImage != 'none' && 
      computedStyle.backgroundAttachment == 'scroll' && (
        (scrollValue.indexOf(computedStyle.overflowX) >= 0 && hasScrollAt(node, 'Width')) ||
        (scrollValue.indexOf(computedStyle.overflowY) >= 0 && hasScrollAt(node, 'Height'))
      )){
    this.addProblem('RC3003', [node])         
  }
  
  function hasScrollAt(element, woh){
    return element['client' + woh] < element['scroll' + woh];
  }
}
); // declareDetector

});
