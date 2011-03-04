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

/**
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=14
 * WontFix
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'mouse_enter_leave',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  var enterFlag = false;
  var leaveFlag = false;
  this.hookOverHandler_ = function(oldValue, newValue, reason) {
    if (reason == 'set') {
      enterFlag=true;
    }
  };
  //When onmouseenter and onmouseover same time bound ,
  //that the author considers the problem
  this.hookEnterHandler_ = function(oldValue, newValue, reason) {
    if (reason == 'set' && enterCounter == true)
      This.addProblem('BT9017', { nodes: [this], needsStack: true });
    return newValue;
  };
  this.hookOutHandler_ = function(oldValue, newValue, reason) {
    if (reason == 'set') {
      leaveFlag=true;
    }
  };
  //When onmouseout and onmouseleave same time bound ,
  //that the author considers the problem
  this.hookLeaveHandler_ = function(oldValue, newValue, reason) {
    if (reason == 'set' && leaveFlag == true)
      This.addProblem('BT9017', { nodes: [this], needsStack: true });
    return newValue;
  };
  enterFlag = false;
  leaveFlag = false;
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  //Increase the filter conditions , When the elements
  //of the display: none ,no problem.
  var display = window.getComputedStyle(node, null).display;
  //Increase the filter conditions , When the elements
  //of the visibility: hidden ,no problem.
  var visibility = window.getComputedStyle(node, null).visibility;
  if (display == 'none' || visibility == 'hidden')
    return;
  //Increase the filter conditions, when onmouseenter and onmouseover exist,
  //that the author considers the problem
  if (node.hasAttribute('onmouseenter') &&
      node.hasAttribute('onmouseover'))
    return;
  //Increase the filter conditions, when onmouseleave and onmouseout exist,
  //that the author considers the problem
  else if (node.hasAttribute('onmouseleave') &&
           node.hasAttribute('onmouseout'))
    return;
  if (node.hasAttribute('onmouseenter') || node.hasAttribute('onmouseleave'))
    this.addProblem('BT9017', [node]);
},

function setUp() {
  //add onmouseover hook of register
  chrome_comp.CompDetect.registerSimplePropertyHook(
      Element.prototype, 'onmouseover', this.hookOverHandler_);
  chrome_comp.CompDetect.registerSimplePropertyHook(
      Element.prototype, 'onmouseenter', this.hookEnterHandler_);
  //add onmouseout hook of register
  chrome_comp.CompDetect.registerSimplePropertyHook(
      Element.prototype, 'onmouseout', this.hookOutHandler_);
  chrome_comp.CompDetect.registerSimplePropertyHook(
      Element.prototype, 'onmouseleave', this.hookLeaveHandler_);
},

function cleanUp() {
  //add onmouseover hook of unregister
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      Element.prototype, 'onmouseover', this.hookOverHandler_);
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      Element.prototype, 'onmouseenter', this.hookEnterHandler_);
  //add onmouseout hook of unregister
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      Element.prototype, 'onmouseout', this.hookOutHandler_);
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      Element.prototype, 'onmouseleave', this.hookLeaveHandler_);
}
); // declareDetector

});
