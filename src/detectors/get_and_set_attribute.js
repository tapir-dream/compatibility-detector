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

// Detector for element.getAttribute and element.setAttribute
//
// Element.getAttribute(attributeName) is introduced in DOM level 1, which
// returns the value of the named attribute on the specified element. If the
// named attribute does not exist, the value returned will either be null or ''
// (the empty string).
//
// In IE 6, IE 7 and IE 8(Q), attribute is confused with property and
// element.getAttribute method is confused with dot method, which causes
// compatibility issues.

addScriptToInject(function() {

const INVALID_ATTRIBUTE_NAMES = {
  className: true,
  htmlFor: true
};

chrome_comp.CompDetect.declareDetector(

'get_and_set_attribute',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.getAttributeHandler_ = function(result, originalArguments, callStack) {
    var attributeName = originalArguments[0];
    if (!attributeName)
      return;

    if (INVALID_ATTRIBUTE_NAMES.hasOwnProperty(attributeName) ||
        // If element.getAttribute(attributeName) returns null, but
        // attributeName is a non-empty property of element, we warn the user
        // because he/she may mean to use element[attributeName].
        (result == null && this[attributeName]) ||
        // In IE 6, IE 7 and IE 8(Q), if element is an input object,
        // element.getAttribute('value') returns the current value, while
        // in Chrome it returns the initial value.
        (this.tagName == 'INPUT' && attributeName == 'value'))
      This.addProblem('SD9006', {
        nodes: [this],
        details: 'getAttribute("' + attributeName + '")',
        needsStack: true
      });
  };
  this.setAttributeHandler_ = function(result, originalArguments, callStack) {
    var attributeName = originalArguments[0];
    var attributeValue = originalArguments[1];
    if (!attributeName || !attributeValue)
      return;

    var attributeType = typeof attributeValue;
    if (INVALID_ATTRIBUTE_NAMES.hasOwnProperty(attributeName) ||
        // In Chrome, the second param should always be a string, while in IE6,
        // IE7 and IE 8(Q), element.setAttribute('style', styleObject) requires
        // an object as the second param, and element.setAttribute('onclick',
        // func) requires a function as the second param.
        // Cases of other primitive types which also work in Chrome are ignored.
        attributeType == 'function' || attributeType == 'object' ||
        // In IE 6, IE 7 and IE 8(Q), if element is an input object,
        // element.setAttribute('value', 'foo') sets the current value, while
        // in Chrome it sets the initial value.
        (this.tagName == 'INPUT' && attributeName == 'value'))
      This.addProblem('SD9006', {
        nodes: [this],
        details: 'setAttribute("' + attributeName + '",' + attributeValue + ')',
        needsStack: true
      });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      window.Element.prototype, 'getAttribute', this.getAttributeHandler_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      window.Element.prototype, 'setAttribute', this.setAttributeHandler_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window.Element.prototype, 'getAttribute', this.getAttributeHandler_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window.Element.prototype, 'setAttribute', this.setAttributeHandler_);
}
); // declareDetector

});
