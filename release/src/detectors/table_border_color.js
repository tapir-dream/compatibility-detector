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

'table_border_color',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.hookHandler_ = function(oldValue, newValue, reason) {
    This.addProblem('BT3003', { nodes: [this], needsStack: true });
    return newValue;
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName == 'TABLE' &&
      (node.hasAttribute('bordercolorlight') ||
       node.hasAttribute('bordercolordark'))) {
    this.addProblem('BT3003', [node]);
  }
},

function setUp() {
  chrome_comp.CompDetect.registerSimplePropertyHook(
      HTMLTableElement.prototype, 'borderColorLight', this.hookHandler_);
  chrome_comp.CompDetect.registerSimplePropertyHook(
      HTMLTableElement.prototype, 'borderColorDark', this.hookHandler_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      HTMLTableElement.prototype, 'borderColorLight', this.hookHandler_);
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      HTMLTableElement.prototype, 'borderColorDark', this.hookHandler_);
}
); // declareDetector

});
