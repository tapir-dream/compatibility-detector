/**
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

'background_image_on_broken_inline',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function hasBackgroundImage(element) {
    return chrome_comp.getComputedStyle(element).backgroundImage != 'none';
  }

  function isBroken(element) {
    element.insertAdjacentHTML('beforeBegin',
        '<span style="display:inline-block; height:20px;"></span>');
    element.insertAdjacentHTML('afterEnd',
        '<span style="display:inline-block; height:20px;"></span>');
    var span1 = element.previousElementSibling;
    var span2 = element.nextElementSibling;
    var top1 = span1.getBoundingClientRect().top;
    var top2 = span2.getBoundingClientRect().top;
    element.parentNode.removeChild(span1);
    element.parentNode.removeChild(span2);
    return (top1 != top2);
  }

  function isInline(element) {
    return chrome_comp.getComputedStyle(element).display == 'inline';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (!isInline(node))
    return;

  if (!hasBackgroundImage(node))
    return;

  if (isBroken(node))
    this.addProblem('RC3004', [node]);
}
); // declareDetector

});

