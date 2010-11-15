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

'missing_tags',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  this.missingTags_ = {
    'BGSOUND': 'BT2033',
    'XML': 'BT9036',
    'LAYER': 'BX8042',
    'WBR': 'BX1039' // WBR is not supported by IE8(S) and Opera
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  var tagName = node.tagName;
  var typeId = this.missingTags_[tagName];
  if (typeId)
    this.addProblem(typeId, [node]);
}
); // declareDetector

});
