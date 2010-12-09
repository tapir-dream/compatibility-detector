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

'z_index_auto',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (node.nodeType != Node.ELEMENT_NODE || context.isDisplayNone())
    return;

  var nodeComputedStyle = chrome_comp.getComputedStyle(node);

  if (nodeComputedStyle.position == 'static' ||
      nodeComputedStyle.zIndex != 'auto')
    return;

  var childrenElements = Array.prototype.slice.call(node.children);

  for (var i = 0, l = childrenElements.length; i < l; i++) {
    var childernElementStyle =
          chrome_comp.getComputedStyle(childrenElements[i]);

    if (childernElementStyle.position != 'static' &&
        childernElementStyle.display != 'none') {
      this.addProblem('RM8015', [node]);
      return;
    }
  }

}
); // declareDetector

});